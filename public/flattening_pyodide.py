import math, json
import numpy as np
import pandas as pd

try:
    import numba
    HAS_NUMBA = True
except ImportError:
    HAS_NUMBA = False


# ---------------------------------------------------------------------------
# _ndtri_approx : rational approximation to inverse normal CDF
# Peter Acklam's algorithm — max absolute error < 1e-4
# Replaces scipy.special.ndtri for Pyodide compatibility.
# ---------------------------------------------------------------------------

def _ndtri_approx(p):
    """Rational approximation to the inverse normal CDF (max error < 1e-4)."""
    scalar = np.ndim(p) == 0
    p = np.atleast_1d(np.asarray(p, dtype=float))
    a = [-3.969683028665376e+01,  2.209460984245205e+02,
         -2.759285104469687e+02,  1.383577518672690e+02,
         -3.066479806614716e+01,  2.506628277459239e+00]
    b = [-5.447609879822406e+01,  1.615858368580409e+02,
         -1.556989798598866e+02,  6.680131188771972e+01,
         -1.328068155288572e+01]
    c = [-7.784894002430293e-03, -3.223964580411365e-01,
         -2.400758277161838e+00, -2.549732539343734e+00,
          4.374664141464968e+00,  2.938163982698783e+00]
    d = [ 7.784695709041462e-03,  3.224671290700398e-01,
          2.445134137142996e+00,  3.754408661907416e+00]
    p_low  = 0.02425
    p_high = 1.0 - p_low
    out = np.zeros_like(p)
    lo  = (p > 0.0) & (p < p_low)
    mid = (p >= p_low) & (p <= p_high)
    hi  = (p > p_high) & (p < 1.0)
    if lo.any():
        q = np.sqrt(-2.0 * np.log(p[lo]))
        out[lo] = (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / \
                  ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1.0)
    if mid.any():
        q = p[mid] - 0.5
        r = q * q
        out[mid] = (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q / \
                   (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1.0)
    if hi.any():
        q = np.sqrt(-2.0 * np.log(1.0 - p[hi]))
        out[hi] = -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / \
                   ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1.0)
    return float(out[0]) if scalar else out

# ---------------------------------------------------------------------------
# Constants (unchanged from flattening_v5.py)
# ---------------------------------------------------------------------------

BASE_PARAMS = {
    'N': 200, 'T': 20, 'K': 10,
    'delta': 0.04, 'A_max': 0.80, 'kappa': 0.15,
    'beta_surr': 0.60, 'lambda': 8.0, 'q_in0': 0.92, 'mu_in': 0.002,
    'q_out': 0.55, 'eta': 0.02, 'var_ref': 0.050, 'beta_conform': 0.30,
    'p_crisis': 0.08, 'kappa_normal': 60, 'E_crisis': 0.35,
    'mu_crisis': 2.2, 'sigma_crisis': 0.3, 'sigma_normal': 0.25,
}
SCENARIO_DEFAULTS = {
    'baseline': {'p0': 0.0, 'gamma_eff': 0.0, 'eta_mult': 0.0, 'theta': 1.00, 'quota_diversity': 0.0},
    'G0': {'p0': 0.80, 'gamma_eff': 5.0, 'eta_mult': 1.0, 'theta': 1.25, 'quota_diversity': 0.0},
    'G1': {'p0': 0.70, 'gamma_eff': 3.5, 'eta_mult': 1.0, 'theta': 1.20, 'quota_diversity': 0.0},
    'G2': {'p0': 0.55, 'gamma_eff': 1.5, 'eta_mult': 0.5, 'theta': 1.10, 'quota_diversity': 0.10},
}
SCENARIOS = ['baseline','G0','G1','G2']
PROFILES = {
    1: dict(profile_label='bigfour_continental', description='Big Four audit firm, continental Europe (Frankfurt/Paris/Milan)', geographies='Frankfurt/Paris/Milan',
            params={'a_pi':5.0,'b_pi':5.0,'alpha':0.70,'tau_alpha0':3.5,'tau_beta0':3.5,'H_LO':0.55,'H_HI':0.85,'eta':0.02},
            scenario_overrides={'G0':{'p0':0.75},'G1':{'p0':0.65},'G2':{'p0':0.50,'theta':1.12}},
            label_short='Big Four — Frankfurt'),
    2: dict(profile_label='bank_international', description='International investment bank (London/NYC/Singapore)', geographies='London/NYC/Singapore',
            params={'a_pi':5.5,'b_pi':4.5,'alpha':0.40,'tau_alpha0':1.5,'tau_beta0':1.5,'H_LO':0.65,'H_HI':0.95,'eta':0.02},
            scenario_overrides={'G0':{'p0':0.70},'G1':{'p0':0.55},'G2':{'p0':0.42,'theta':1.18}},
            label_short='Investment bank — London'),
    3: dict(profile_label='conseil_elite', description='Strategy consulting firm, national elite pipeline (Paris/Seoul/Tokyo)', geographies='Paris/Seoul/Tokyo',
            params={'a_pi':5.5,'b_pi':4.5,'alpha':0.90,'tau_alpha0':4.0,'tau_beta0':4.0,'H_LO':0.65,'H_HI':0.95,'eta':0.02},
            scenario_overrides={'G0':{'p0':0.70},'G1':{'p0':0.55},'G2':{'p0':0.42,'theta':1.18}},
            label_short='Strategy consulting — Paris'),
    4: dict(profile_label='juridique_continental', description='Corporate legal department, continental Europe (Paris/Frankfurt/Brussels)', geographies='Paris/Frankfurt/Brussels',
            params={'a_pi':4.5,'b_pi':5.5,'alpha':0.90,'tau_alpha0':3.0,'tau_beta0':3.0,'H_LO':0.40,'H_HI':0.80,'eta':0.01},
            scenario_overrides={'G0':{'p0':0.80},'G1':{'p0':0.70},'G2':{'p0':0.55,'theta':1.10}},
            label_short='Corporate legal — Brussels'),
    5: dict(profile_label='startup_tech', description='Tech startup in a tier-1 hub (SF/London/Berlin)', geographies='SF/London/Berlin',
            params={'a_pi':7.0,'b_pi':3.0,'alpha':0.60,'tau_alpha0':2.5,'tau_beta0':2.5,'H_LO':0.50,'H_HI':0.85,'eta':0.03},
            scenario_overrides={'G0':{'p0':0.80},'G1':{'p0':0.75},'G2':{'p0':0.70,'theta':1.08}},
            label_short='Tech startup — tier-1 hub'),
    6: dict(profile_label='agence_creative', description='Creative agency, international hub (Singapore/Dubai/Amsterdam)', geographies='Singapore/Dubai/Amsterdam',
            params={'a_pi':8.5,'b_pi':1.5,'alpha':0.30,'tau_alpha0':1.5,'tau_beta0':1.5,'H_LO':0.40,'H_HI':0.80,'eta':0.01},
            scenario_overrides={'G0':{'p0':0.80},'G1':{'p0':0.70},'G2':{'p0':0.55,'theta':1.10}},
            label_short='Creative agency — Singapore'),
    7: dict(profile_label='backoffice_csp', description='Shared services / back-office (Bangalore/Manila)', geographies='Bangalore/Manila',
            params={'a_pi':7.5,'b_pi':2.5,'alpha':0.70,'tau_alpha0':2.0,'tau_beta0':2.0,'H_LO':0.30,'H_HI':0.60,'eta':0.04},
            scenario_overrides={'G0':{'p0':0.85},'G1':{'p0':0.80},'G2':{'p0':0.78,'theta':1.03}},
            label_short='Back-office — Bangalore'),
    8: dict(profile_label='admin_concours', description='Central government administration, national exam pipeline (FR/KR/JP)', geographies='FR/KR/JP',
            params={'a_pi':6.0,'b_pi':4.0,'alpha':0.95,'tau_alpha0':4.5,'tau_beta0':4.5,'H_LO':0.40,'H_HI':0.75,'eta':0.01},
            scenario_overrides={'G0':{'p0':0.80},'G1':{'p0':0.70},'G2':{'p0':0.55,'theta':1.10}},
            label_short='Central admin — national exam'),
}

# ---------------------------------------------------------------------------
# Internal functions (unchanged from flattening_v5.py)
# ---------------------------------------------------------------------------

def make_params(profile_spec, **overrides):
    p = BASE_PARAMS.copy()
    p.update(profile_spec['params'])
    p.update(overrides)
    return p

def make_scenarios(params, overrides):
    sc = {k:v.copy() for k,v in SCENARIO_DEFAULTS.items()}
    for k in sc:
        sc[k]['eta_eff'] = params['eta'] * sc[k]['eta_mult']
    for k,v in overrides.items():
        sc[k].update(v)
    return sc

def sample_pi_xi(p, rng):
    """Coupled (pi_t, xi_t) draw. Crisis regime couples low pi with high xi.
    Returns (is_crisis, pi_t, xi_t)."""
    E_pi = p['a_pi'] / (p['a_pi'] + p['b_pi'])
    p_c = p.get('p_crisis', 0.08)
    E_c = p.get('E_crisis', 0.35)
    kappa_n = p.get('kappa_normal', 40)
    mu_c = p.get('mu_crisis', 1.5)
    sig_c = p.get('sigma_crisis', 0.5)
    E_n = (E_pi - p_c * E_c) / (1.0 - p_c)
    if E_n < 0.40:
        E_c = max(0.20, E_pi - 0.10)
        E_n = (E_pi - p_c * E_c) / (1.0 - p_c)
    is_crisis = rng.random() < p_c
    if is_crisis:
        a_c = E_c * 10.0
        b_c = (1.0 - E_c) * 10.0
        pi_t = rng.beta(a_c, b_c)
        xi_t = rng.normal(mu_c, sig_c)
    else:
        a_n = E_n * kappa_n
        b_n = (1.0 - E_n) * kappa_n
        pi_t = rng.beta(a_n, b_n)
        xi_t = rng.normal(0.0, p.get('sigma_normal', 1.0))
    return is_crisis, pi_t, xi_t

def adoption_rate(t,p):
    return p['A_max'] * (1 - math.exp(-p['kappa']*t))

def init_agents(p, rng):
    tau = rng.beta(p['tau_alpha0'], p['tau_beta0'], size=p['N'])
    h = rng.uniform(p['H_LO'], p['H_HI'], size=p['N'])
    return tau, h

def sample_new_taus(m,t,scenario,p,rng):
    if m == 0:
        return np.empty(0)
    u = rng.random(m)
    quota = scenario.get('quota_diversity', 0.0)
    a = b = 2.0 + scenario['gamma_eff']*adoption_rate(t,p)
    out = np.empty(m)
    mask = u < quota
    if mask.any():
        out[mask] = rng.beta(p['tau_alpha0'], p['tau_beta0'], size=mask.sum())
    if (~mask).any():
        out[~mask] = rng.beta(a, b, size=(~mask).sum())
    return out

def apply_turnover(tau, h, t, scenario_name, p, scenarios, rng):
    m = rng.binomial(p['N'], p['delta'])
    if m == 0:
        return tau, h
    dep = rng.choice(p['N'], size=m, replace=False)
    keep = np.ones(p['N'], dtype=bool)
    keep[dep] = False
    tau_new = sample_new_taus(m, t, scenarios[scenario_name], p, rng)
    h_new = rng.uniform(p['H_LO'], p['H_HI'], size=m)
    return np.concatenate([tau[keep], tau_new]), np.concatenate([h[keep], h_new])

if HAS_NUMBA:
    @numba.njit(cache=True)
    def _ar1_fill(x, eta, rhos, sig):
        N = x.shape[0]
        K = x.shape[1]
        for i in range(1, N):
            for k in range(K):
                x[i, k] = rhos[i-1] * x[i-1, k] + sig[i-1] * eta[i, k]
else:
    def _ar1_fill(x, eta, rhos, sig):
        for i in range(1, x.shape[0]):
            x[i, :] = rhos[i-1] * x[i-1, :] + sig[i-1] * eta[i, :]

def sample_correlated_normals_exp_kernel(tau, lambd, K, rng):
    order = np.argsort(tau)
    ts = tau[order]
    N = len(tau)
    eta = rng.normal(size=(N, K))
    x = np.empty((N, K))
    x[0, :] = eta[0, :]
    if N > 1:
        gaps = np.diff(ts)
        rhos = np.exp(-lambd * gaps)
        sig = np.sqrt(np.maximum(0.0, 1 - rhos**2))
        _ar1_fill(x, eta, rhos, sig)
    inv = np.empty(N, dtype=int)
    inv[order] = np.arange(N)
    return x[inv,:]

def excess_coerror(errors):
    N,K = errors.shape
    n_pairs = N*(N-1)/2.0
    cs = errors.sum(axis=0).astype(float)
    term1 = np.mean((cs*(cs-1)/2.0)/n_pairs)
    f = errors.mean(axis=1)
    term2 = (((f.sum()**2) - np.square(f).sum()) / (N*(N-1)))
    return float(term1 - term2)

def compute_surrender_prob(tau, tau_bar, p0, p):
    var_tau = float(np.var(tau, ddof=0))
    conformism_factor = 1.0 + p['beta_conform'] * (p['var_ref'] - var_tau) / p['var_ref']
    p0_eff = float(np.clip(p0 * conformism_factor, 0.0, 0.98))
    probs = np.clip(p0_eff - p['beta_surr'] * np.abs(tau - tau_bar), 0.0, 1.0)
    return probs, p0_eff, var_tau

# ---------------------------------------------------------------------------
# Core simulation (model logic unchanged; pi_t/is_crisis stored in arrs)
# ---------------------------------------------------------------------------

def simulate_profile_scenario(profile_spec, scenario_name, M=200, base_seed=5000, store_errors=False, one_rep_only=False):
    p = make_params(profile_spec)
    scs = make_scenarios(p, profile_spec['scenario_overrides'])
    sc = scs[scenario_name]
    T, K, N = p['T'], p['K'], p['N']
    arrs = {k: np.empty((M, T)) for k in ['L','output','h_bar','var_tau','follow_rate','p0_eff_mean','excess_coerror']}
    arrs['pi_t'] = np.empty((M, T))
    arrs['is_crisis'] = np.zeros((M, T), dtype=bool)
    quarter_errors = [] if store_errors else None
    M_eff = 1 if one_rep_only else M
    for m in range(M_eff):
        seq = np.random.SeedSequence(base_seed + m)
        rng_init, rng_exog, rng_turn, rng_dec = [np.random.default_rng(s) for s in seq.spawn(4)]
        tau, h = init_agents(p, rng_init)
        rep_errors = []
        for t in range(1, T+1):
            _is_crisis, pi_t, xi_t = sample_pi_xi(p, rng_exog)
            arrs['pi_t'][m, t-1] = pi_t
            arrs['is_crisis'][m, t-1] = _is_crisis
            tau, h = apply_turnover(tau, h, t, scenario_name, p, scs, rng_turn)
            latent_h = sample_correlated_normals_exp_kernel(tau, p['lambda'], K, rng_dec)
            own_errors = latent_h > _ndtri_approx(np.clip(h, 1e-8, 1-1e-8))[:,None]
            task_inside = rng_dec.random(K) < pi_t
            q_in = min(0.999, p['q_in0'] + p['mu_in']*t)
            qk = np.where(task_inside, q_in, p['q_out'])
            z_ai = (math.sqrt(p['alpha']) * xi_t + math.sqrt(1-p['alpha']) * rng_dec.normal(size=K)) > _ndtri_approx(qk)
            if sc['p0'] > 0:
                p_surr, p0_eff, var_tau = compute_surrender_prob(tau, tau.mean(), sc['p0'], p)
                surrender = rng_dec.random((N,K)) < p_surr[:,None]
                errors = np.where(surrender, z_ai[None,:], own_errors)
                h = np.clip(h - sc['eta_eff'] * surrender.mean(axis=1) * h, 0.0, 1.0)
                follow = float(surrender.mean())
            else:
                errors = own_errors
                p0_eff = 0.0
                var_tau = float(np.var(tau, ddof=0))
                follow = 0.0
            err_total = int(errors.sum())
            arrs['L'][m,t-1] = err_total
            arrs['output'][m,t-1] = sc['theta'] * (N*K - err_total)
            arrs['h_bar'][m,t-1] = float(h.mean())
            arrs['var_tau'][m,t-1] = var_tau
            arrs['follow_rate'][m,t-1] = follow
            arrs['p0_eff_mean'][m,t-1] = p0_eff
            arrs['excess_coerror'][m,t-1] = excess_coerror(errors.astype(np.int8))
            if store_errors:
                rep_errors.append(errors.astype(np.int8))
        if store_errors:
            quarter_errors.append(rep_errors)
    if one_rep_only:
        for k in arrs:
            arrs[k] = arrs[k][:1,:]
    return {'arrays':arrs, 'scenario_meta':sc, 'params':p, 'quarter_errors':quarter_errors}

# ---------------------------------------------------------------------------
# Summary / analysis helpers (pure calc, no file I/O)
# ---------------------------------------------------------------------------

def summarize_result(profile_num, scenario_name, sim):
    spec = PROFILES[profile_num]
    arrs = sim['arrays']
    sc = sim['scenario_meta']
    L = arrs['L'].reshape(-1)
    out = arrs['output'].reshape(-1)
    return {
        'profile_num': profile_num,
        'profile_label': spec['profile_label'],
        'scenario': scenario_name,
        'E_L': float(L.mean()),
        'P99_L': float(np.percentile(L, 99)),
        'P99_theta': float(np.percentile(L,99) * sc['theta']),
        'Output': float(out.mean()),
        'h_bar': float(arrs['h_bar'][:,-1].mean()),
        'var_tau': float(arrs['var_tau'][:,-1].mean()),
        'follow_rate': float(arrs['follow_rate'].mean()),
        'p0_eff_mean': float(arrs['p0_eff_mean'].mean()),
        'excess_coerror': float(arrs['excess_coerror'].mean()),
        'theta': sc['theta'],
        'alpha_val': PROFILES[profile_num]['params']['alpha'],
        'beta_a': PROFILES[profile_num]['params']['tau_alpha0'],
        'E_pi': PROFILES[profile_num]['params']['a_pi'] / (PROFILES[profile_num]['params']['a_pi'] + PROFILES[profile_num]['params']['b_pi']),
        'description': spec['description'],
        'geographies': spec['geographies'],
    }

def enrich_profile_table(df):
    baseline = df[df.scenario=='baseline'][['profile_num','E_L','P99_L','Output']].rename(columns={'E_L':'E_L_baseline','P99_L':'P99_baseline','Output':'Output_baseline'})
    out = df.merge(baseline, on='profile_num', how='left')
    out['premium_pct'] = np.where(out.scenario=='baseline', np.nan, 100*(out.P99_L/out.P99_baseline - 1))
    out['gain_pct'] = np.where(out.scenario=='baseline', np.nan, 100*(out.Output/out.Output_baseline - 1))
    out['ratio'] = np.where(out.scenario=='baseline', np.nan, out['gain_pct']/out['premium_pct'])
    return out

def _run_one(args):
    pid, sc_name, M, base_seed = args
    sim = simulate_profile_scenario(PROFILES[pid], sc_name, M=M, base_seed=base_seed)
    row = summarize_result(pid, sc_name, sim)
    return pid, sc_name, sim, row

def run_profiles(profile_ids=None, M=200, base_seed=5000, max_workers=1):
    if profile_ids is None:
        profile_ids = sorted(PROFILES)
    jobs = [(pid, sc, M, base_seed) for pid in profile_ids for sc in SCENARIOS]
    sims = {}
    rows = []
    for job in jobs:
        pid, sc_name, sim, row = _run_one(job)
        sims[(pid, sc_name)] = sim
        rows.append(row)
    df = enrich_profile_table(pd.DataFrame(rows).sort_values(['profile_num','scenario']).reset_index(drop=True))
    return df, sims

def build_summary(df):
    rows = []
    for pid in sorted(df.profile_num.unique()):
        sub = df[df.profile_num == pid].set_index('scenario')
        ratio_g0 = float(sub.loc['G0','ratio'])
        ratio_g2 = float(sub.loc['G2','ratio'])
        rows.append({
            'profile_num': pid,
            'profile_label': sub.loc['G0','profile_label'],
            'description': sub.loc['G0','description'],
            'geographies': sub.loc['G0','geographies'],
            'E_L_baseline': float(sub.loc['baseline','E_L']),
            'E_L_G0': float(sub.loc['G0','E_L']),
            'P99_baseline': float(sub.loc['baseline','P99_L']),
            'P99_G0': float(sub.loc['G0','P99_L']),
            'P99_G2': float(sub.loc['G2','P99_L']),
            'P99xtheta_G0': float(sub.loc['G0','P99_theta']),
            'P99xtheta_G2': float(sub.loc['G2','P99_theta']),
            'Output_G0': float(sub.loc['G0','Output']),
            'Output_G2': float(sub.loc['G2','Output']),
            'premium_G0_pct': float(sub.loc['G0','premium_pct']),
            'premium_G2_pct': float(sub.loc['G2','premium_pct']),
            'ratio_G0': ratio_g0,
            'ratio_G2': ratio_g2,
            'scaffold_benefit': float((ratio_g2 - ratio_g0)/ratio_g0),
            'p0_eff_mean_G0': float(sub.loc['G0','p0_eff_mean']),
            'var_tau_t20_G0': float(sub.loc['G0','var_tau']),
            'h_bar_t20_G0': float(sub.loc['G0','h_bar']),
            'follow_rate_mean_G0': float(sub.loc['G0','follow_rate']),
        })
    return pd.DataFrame(rows).sort_values('profile_num').reset_index(drop=True)

def build_scatter(df):
    rows = []
    for _, r in df.iterrows():
        pid = int(r.profile_num)
        rows.append({
            'profile_num': pid, 'profile_label': r.profile_label, 'scenario': r.scenario,
            'x_P99': r.P99_L, 'y_Output': r.Output, 'x_P99theta': r.P99_theta,
            'label_short': PROFILES[pid]['label_short'],
            'label_long': PROFILES[pid]['label_short'] + ', ' + PROFILES[pid]['geographies'],
            'alpha_val': r.alpha_val, 'beta_a': r.beta_a, 'E_pi': r.E_pi
        })
    return pd.DataFrame(rows)

def build_histograms(sims):
    rows = []
    for pid in sorted(PROFILES):
        for sc in ['baseline','G0']:
            arr = sims[(pid,sc)]['arrays']['L'].reshape(-1).astype(int).tolist()
            rows.append({'profile_num': pid, 'profile_label': PROFILES[pid]['profile_label'], 'scenario': sc, 'quarter_loss_values': json.dumps(arr)})
    return pd.DataFrame(rows)

def build_trajectories(sims):
    rows = []
    for pid in sorted(PROFILES):
        for sc in ['G0','G2']:
            arrs = sims[(pid,sc)]['arrays']
            for q in range(arrs['L'].shape[1]):
                L = arrs['L'][:,q]
                rows.append({
                    'profile_num': pid, 'profile_label': PROFILES[pid]['profile_label'], 'scenario': sc, 'quarter': q+1,
                    'E_L': float(L.mean()), 'P99_L': float(np.percentile(L,99)), 'P99_E_ratio': float(np.percentile(L,99)/L.mean()),
                    'var_tau': float(arrs['var_tau'][:,q].mean()), 'h_bar': float(arrs['h_bar'][:,q].mean()),
                    'follow_rate': float(arrs['follow_rate'][:,q].mean()), 'p0_eff_mean': float(arrs['p0_eff_mean'][:,q].mean())
                })
    return pd.DataFrame(rows)

# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def simulate_one_quarter(profile_id, scenario, seed=None):
    """Run one replication; return stats from the first simulated quarter.

    Returns dict: total_loss, is_crisis, pi_t, follow_rate, outside_pct, output
    """
    if seed is None:
        seed = int(np.random.randint(0, 2**31))
    sim = simulate_profile_scenario(
        PROFILES[profile_id], scenario, M=1, base_seed=seed, one_rep_only=True
    )
    arrs = sim['arrays']
    total_loss  = int(arrs['L'][0, 0])
    pi_t        = float(arrs['pi_t'][0, 0])
    is_crisis   = bool(arrs['is_crisis'][0, 0])
    follow_rate = float(arrs['follow_rate'][0, 0])
    outside_pct = float(1.0 - pi_t)
    output      = float(arrs['output'][0, 0])
    return {
        'total_loss':  total_loss,
        'is_crisis':   is_crisis,
        'pi_t':        pi_t,
        'follow_rate': follow_rate,
        'outside_pct': outside_pct,
        'output':      output,
    }


def simulate_quarter_grid(profile_id, scenario, seed=None):
    """Run one replication; return full error matrix for the worst quarter.

    Returns dict: error_matrix (N x K list[list[int]]), is_crisis, c_excess, pi_t
    """
    if seed is None:
        seed = int(np.random.randint(0, 2**31))
    sim = simulate_profile_scenario(
        PROFILES[profile_id], scenario, M=1, base_seed=seed,
        store_errors=True, one_rep_only=True
    )
    arrs = sim['arrays']
    L = arrs['L'][0]
    bad_idx = int(np.argmax(L))
    errors = sim['quarter_errors'][0][bad_idx]
    error_matrix = errors.tolist()
    c_excess  = excess_coerror(errors)
    pi_t      = float(arrs['pi_t'][0, bad_idx])
    is_crisis = bool(arrs['is_crisis'][0, bad_idx])
    return {
        'error_matrix': error_matrix,
        'is_crisis':    is_crisis,
        'c_excess':     c_excess,
        'pi_t':         pi_t,
    }


def run_scenario(profile_id, scenario, M=50, seed=5000):
    """Run M replications; return aggregate metrics including trajectories and histogram.

    scaffold_benefit = gain_pct / premium_pct relative to baseline
    (requires a second baseline simulation call).

    Returns dict: p99_theta, mean_loss, output_mean, scaffold_benefit,
                  histogram_bins (list of dicts), trajectories (list of dicts)
    """
    sim = simulate_profile_scenario(PROFILES[profile_id], scenario, M=M, base_seed=seed)
    arrs = sim['arrays']
    row = summarize_result(profile_id, scenario, sim)

    p99_theta   = float(row['P99_theta'])
    mean_loss   = float(row['E_L'])
    output_mean = float(row['Output'])

    if scenario != 'baseline':
        sim_base = simulate_profile_scenario(
            PROFILES[profile_id], 'baseline', M=M, base_seed=seed
        )
        row_base = summarize_result(profile_id, 'baseline', sim_base)
        P99_base = row_base['P99_L']
        Out_base = row_base['Output']
        premium = 100.0 * (row['P99_L'] / P99_base - 1.0) if P99_base > 0 else 0.0
        gain    = 100.0 * (row['Output'] / Out_base - 1.0) if Out_base > 0 else 0.0
        scaffold_benefit = float(gain / premium) if premium != 0.0 else 0.0
    else:
        scaffold_benefit = 0.0

    L_flat = arrs['L'].reshape(-1)
    counts, bin_edges = np.histogram(L_flat, bins=30)
    histogram_bins = [
        {'bin_left': float(bin_edges[i]), 'bin_right': float(bin_edges[i+1]), 'count': int(counts[i])}
        for i in range(len(counts))
    ]

    trajectories = []
    for q in range(arrs['L'].shape[1]):
        L_q = arrs['L'][:, q]
        trajectories.append({
            'quarter':     q + 1,
            'E_L':         float(L_q.mean()),
            'P99_L':       float(np.percentile(L_q, 99)),
            'var_tau':     float(arrs['var_tau'][:, q].mean()),
            'h_bar':       float(arrs['h_bar'][:, q].mean()),
            'follow_rate': float(arrs['follow_rate'][:, q].mean()),
        })

    return {
        'p99_theta':        p99_theta,
        'mean_loss':        mean_loss,
        'output_mean':      output_mean,
        'scaffold_benefit': scaffold_benefit,
        'histogram_bins':   histogram_bins,
        'trajectories':     trajectories,
    }


def run_custom_scenario(alpha, beta_a, epi, eta, h_lo, h_hi, scenario, M=50, seed=5000):
    """Run M replications with arbitrary parameters (not limited to preset profiles).

    Parameters:
        alpha    : float  — AI stack concentration (0.20 to 0.95)
        beta_a   : float  — Beta(a,a) cognitive homogeneity (1.5 to 4.5)
        epi      : float  — E[pi] domain exposure (0.40 to 0.90)
        eta      : float  — deskilling rate per quarter (0.00 to 0.04)
        h_lo     : float  — talent quality lower bound
        h_hi     : float  — talent quality upper bound
        scenario : str    — 'baseline', 'G0', 'G1', or 'G2'
        M        : int    — number of Monte Carlo replications
        seed     : int    — random seed

    Returns same structure as run_scenario.
    """
    # Build a synthetic profile spec
    a_pi = epi * 10.0
    b_pi = (1.0 - epi) * 10.0
    custom_spec = {
        'profile_label': 'custom',
        'description': 'Custom parameters',
        'geographies': 'Custom',
        'params': {
            'a_pi': a_pi, 'b_pi': b_pi,
            'alpha': alpha,
            'tau_alpha0': beta_a, 'tau_beta0': beta_a,
            'H_LO': h_lo, 'H_HI': h_hi,
            'eta': eta,
        },
        'scenario_overrides': {},
        'label_short': 'Custom',
    }

    sim = simulate_profile_scenario(custom_spec, scenario, M=M, base_seed=seed)
    arrs = sim['arrays']

    sc = SCENARIO_DEFAULTS.get(scenario, SCENARIO_DEFAULTS['G0'])
    theta = sc['theta']

    p99_theta   = float(np.percentile(arrs['L'].reshape(-1), 99) * theta)
    mean_loss   = float(arrs['L'].mean())
    output_mean = float(arrs['output'].mean()) if 'output' in arrs else 0.0

    # Scaffold benefit: compare to baseline
    scaffold_benefit = 0.0
    if scenario != 'baseline':
        sim_base = simulate_profile_scenario(custom_spec, 'baseline', M=M, base_seed=seed)
        arr_base = sim_base['arrays']
        P99_base = float(np.percentile(arr_base['L'].reshape(-1), 99))
        Out_base = float(arr_base['output'].mean()) if 'output' in arr_base else 0.0
        P99_cur  = float(np.percentile(arrs['L'].reshape(-1), 99))
        Out_cur  = float(arrs['output'].mean()) if 'output' in arrs else 0.0
        premium = 100.0 * (P99_cur / P99_base - 1.0) if P99_base > 0 else 0.0
        gain    = 100.0 * (Out_cur / Out_base - 1.0) if Out_base > 0 else 0.0
        scaffold_benefit = float(gain / premium) if premium != 0.0 else 0.0

    L_flat = arrs['L'].reshape(-1)
    counts, bin_edges = np.histogram(L_flat, bins=30)
    histogram_bins = [
        {'bin_left': float(bin_edges[i]), 'bin_right': float(bin_edges[i+1]), 'count': int(counts[i])}
        for i in range(len(counts))
    ]

    trajectories = []
    for q in range(arrs['L'].shape[1]):
        L_q = arrs['L'][:, q]
        trajectories.append({
            'quarter':     q + 1,
            'E_L':         float(L_q.mean()),
            'P99_L':       float(np.percentile(L_q, 99)),
            'var_tau':     float(arrs['var_tau'][:, q].mean()),
            'h_bar':       float(arrs['h_bar'][:, q].mean()),
            'follow_rate': float(arrs['follow_rate'][:, q].mean()),
        })

    return {
        'p99_theta':        p99_theta,
        'mean_loss':        mean_loss,
        'output_mean':      output_mean,
        'scaffold_benefit': scaffold_benefit,
        'histogram_bins':   histogram_bins,
        'trajectories':     trajectories,
    }
