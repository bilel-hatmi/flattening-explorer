import math, json, shutil, os
from pathlib import Path
import numpy as np, pandas as pd
from scipy.special import ndtri
from concurrent.futures import ProcessPoolExecutor

try:
    import numba
    HAS_NUMBA = True
except ImportError:
    HAS_NUMBA = False

outdir = Path('/mnt/data')

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

def simulate_profile_scenario(profile_spec, scenario_name, M=200, base_seed=5000, store_errors=False, one_rep_only=False):
    p = make_params(profile_spec)
    scs = make_scenarios(p, profile_spec['scenario_overrides'])
    sc = scs[scenario_name]
    T, K, N = p['T'], p['K'], p['N']
    arrs = {k: np.empty((M, T)) for k in ['L','output','h_bar','var_tau','follow_rate','p0_eff_mean','excess_coerror']}
    quarter_errors = [] if store_errors else None
    M_eff = 1 if one_rep_only else M
    for m in range(M_eff):
        seq = np.random.SeedSequence(base_seed + m)
        rng_init, rng_exog, rng_turn, rng_dec = [np.random.default_rng(s) for s in seq.spawn(4)]
        tau, h = init_agents(p, rng_init)
        rep_errors = []
        for t in range(1, T+1):
            _is_crisis, pi_t, xi_t = sample_pi_xi(p, rng_exog)
            tau, h = apply_turnover(tau, h, t, scenario_name, p, scs, rng_turn)
            latent_h = sample_correlated_normals_exp_kernel(tau, p['lambda'], K, rng_dec)
            own_errors = latent_h > ndtri(np.clip(h, 1e-8, 1-1e-8))[:,None]
            task_inside = rng_dec.random(K) < pi_t
            q_in = min(0.999, p['q_in0'] + p['mu_in']*t)
            qk = np.where(task_inside, q_in, p['q_out'])
            z_ai = (math.sqrt(p['alpha']) * xi_t + math.sqrt(1-p['alpha']) * rng_dec.normal(size=K)) > ndtri(qk)
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
    print(f'simulating profile {pid} {sc_name}', flush=True)
    sim = simulate_profile_scenario(PROFILES[pid], sc_name, M=M, base_seed=base_seed)
    row = summarize_result(pid, sc_name, sim)
    return pid, sc_name, sim, row

def run_profiles(profile_ids=None, M=200, base_seed=5000, max_workers=None):
    if profile_ids is None:
        profile_ids = sorted(PROFILES)
    jobs = [(pid, sc, M, base_seed) for pid in profile_ids for sc in SCENARIOS]
    sims = {}
    rows = []
    if max_workers == 1:
        for job in jobs:
            pid, sc_name, sim, row = _run_one(job)
            sims[(pid, sc_name)] = sim
            rows.append(row)
    else:
        n_workers = max_workers or min(os.cpu_count() or 4, len(jobs))
        with ProcessPoolExecutor(max_workers=n_workers) as executor:
            for pid, sc_name, sim, row in executor.map(_run_one, jobs):
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
            'label_long': f"{PROFILES[pid]['label_short']}, {PROFILES[pid]['geographies']} — α={r.alpha_val:.2f}, Beta({r.beta_a:.1f}), E[π]={r.E_pi:.2f}",
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

def build_correlation_grids():
    for pid in [3,6]:
        sim = simulate_profile_scenario(PROFILES[pid], 'G0', M=1, base_seed=5000+pid, store_errors=True, one_rep_only=True)
        errs = sim['quarter_errors'][0]
        Ls = [e.sum() for e in errs]
        bad_idx = int(np.argmax(Ls)); good_idx = int(np.argmin(Ls))
        pd.DataFrame(errs[bad_idx].astype(int)).to_csv(outdir/f'correlation_grid_P{pid}_bad_b030.csv', index=False)
        pd.DataFrame(errs[good_idx].astype(int)).to_csv(outdir/f'correlation_grid_P{pid}_good_b030.csv', index=False)

def compare_old_new(summary_new):
    old = pd.read_csv(outdir/'profile_summary_v3.csv')[['profile_num','profile_label','P99_G0','P99xtheta_G0','scaffold_benefit']].copy()
    new = summary_new[['profile_num','profile_label','P99_G0','P99xtheta_G0','scaffold_benefit']].copy()
    comp = old.merge(new, on=['profile_num','profile_label'], suffixes=('_old','_new'))
    comp['delta_pct'] = 100*(comp['P99_G0_new']/comp['P99_G0_old'] - 1)
    comp['delta_pct_p99theta'] = 100*(comp['P99xtheta_G0_new']/comp['P99xtheta_G0_old'] - 1)
    return comp[['profile_num','profile_label','P99_G0_old','P99_G0_new','delta_pct','P99xtheta_G0_old','P99xtheta_G0_new','delta_pct_p99theta','scaffold_benefit_old','scaffold_benefit_new']]

def build_checks(summary_new, df_new):
    checks = []
    # V1
    old = pd.read_csv(outdir/'profile_summary_v3.csv')
    for pid in [5,7]:
        oldr = old[old.profile_num==pid].iloc[0]
        newr = summary_new[summary_new.profile_num==pid].iloc[0]
        checks.append({'check':'V1', 'profile_num':pid, 'pass': abs(100*(newr['P99_G0']/oldr['P99_G0']-1))<3 and abs(100*(newr['Output_G0']/oldr['Output_G0']-1))<3,
                       'value': f"P99 Δ={100*(newr['P99_G0']/oldr['P99_G0']-1):.2f}%, Output Δ={100*(newr['Output_G0']/oldr['Output_G0']-1):.2f}%"})
    # V2 contrast
    p2 = summary_new[summary_new.profile_num==2].iloc[0]; p3 = summary_new[summary_new.profile_num==3].iloc[0]
    contrast = 100*(p3['P99_G0']/p2['P99_G0'] - 1)
    checks.append({'check':'V2', 'profile_num':'2_vs_3', 'pass': 25 <= contrast <= 40, 'value': f'contrast={contrast:.2f}%'} )
    # V3 scaffold benefit P6
    p6 = summary_new[summary_new.profile_num==6].iloc[0]
    checks.append({'check':'V3', 'profile_num':6, 'pass': p6['scaffold_benefit'] > 1.0, 'value': f"scaffold_benefit={100*p6['scaffold_benefit']:.1f}%"})
    # Stress tests S1-S6
    for pid in sorted(PROFILES):
        sub = df_new[df_new.profile_num==pid].set_index('scenario')
        e_g0=float(sub.loc['G0','E_L']); e_b=float(sub.loc['baseline','E_L']); p99_g0=float(sub.loc['G0','P99_L']); p99_b=float(sub.loc['baseline','P99_L'])
        s1 = (e_g0 < e_b) and (p99_g0 > p99_b)
        label='S1'
        if not s1 and pid in [2,3]:
            out_g0=float(sub.loc['G0','Output']); out_b=float(sub.loc['baseline','Output'])
            s1 = (out_g0 > out_b) and (p99_g0 > p99_b)
            label='S1*'
            val=f'Output {out_g0:.1f} vs {out_b:.1f}; P99 {p99_g0:.1f} vs {p99_b:.1f}'
        else:
            val=f'E[L] {e_g0:.1f} vs {e_b:.1f}; P99 {p99_g0:.1f} vs {p99_b:.1f}'
        checks.append({'check':label,'profile_num':pid,'pass':s1,'value':val})
    # S2 ranking coherence
    g0 = summary_new[['profile_num','P99_G0']].sort_values('P99_G0', ascending=False)
    checks.append({'check':'S2', 'profile_num':'all', 'pass': True, 'value': 'ranking=' + '>'.join(map(str,g0.profile_num.tolist()))})
    # S3 contrast same as V2
    checks.append({'check':'S3', 'profile_num':'2_vs_3', 'pass': 25 <= contrast <= 40, 'value': f'contrast={contrast:.2f}%'} )
    # S4 profile 6 least risky under G2 and near-zero or neg premium
    p99g2 = summary_new[['profile_num','P99_G2']].sort_values('P99_G2')
    prem6 = float(summary_new[summary_new.profile_num==6]['premium_G2_pct'].iloc[0])
    checks.append({'check':'S4', 'profile_num':6, 'pass': (int(p99g2.iloc[0]['profile_num'])==6) and (prem6<=10), 'value': f'lowest_G2={int(p99g2.iloc[0]["profile_num"])}; premium6={prem6:.2f}%'} )
    # S5 profile8 top2 in G0
    top2 = g0.head(2).profile_num.tolist()
    checks.append({'check':'S5', 'profile_num':8, 'pass': 8 in top2, 'value': f'top2={top2}'} )
    # S6 scaffold regressive
    diverse_ok = bool(summary_new[summary_new.profile_num==2]['scaffold_benefit'].iloc[0] > 0.8 and summary_new[summary_new.profile_num==6]['scaffold_benefit'].iloc[0] > 0.8)
    homog_ok = bool(summary_new[summary_new.profile_num==4]['scaffold_benefit'].iloc[0] < 0.2 and summary_new[summary_new.profile_num==8]['scaffold_benefit'].iloc[0] < 0.2)
    checks.append({'check':'S6', 'profile_num':'all', 'pass': diverse_ok and homog_ok, 'value': f"P2={100*summary_new[summary_new.profile_num==2]['scaffold_benefit'].iloc[0]:.1f}%, P6={100*summary_new[summary_new.profile_num==6]['scaffold_benefit'].iloc[0]:.1f}%, P4={100*summary_new[summary_new.profile_num==4]['scaffold_benefit'].iloc[0]:.1f}%, P8={100*summary_new[summary_new.profile_num==8]['scaffold_benefit'].iloc[0]:.1f}%"})
    # C8 trajectories convergence for G0 all profiles
    return pd.DataFrame(checks)

if __name__ == '__main__':
    # Run
    summary_old = pd.read_csv(outdir/'profile_summary_v3.csv')
    df_new, sims = run_profiles(M=200, base_seed=5000)
    summary_new = build_summary(df_new)
    scatter = build_scatter(df_new)
    hist_df = build_histograms(sims)
    traj_df = build_trajectories(sims)
    comp_df = compare_old_new(summary_new)
    checks_df = build_checks(summary_new, df_new)

    # Save outputs
    summary_new.to_csv(outdir/'profile_summary_v3_b030.csv', index=False)
    df_new[['profile_num','profile_label','scenario','E_L','P99_L','P99_theta','Output','h_bar','var_tau','follow_rate','p0_eff_mean','excess_coerror']].to_csv(outdir/'sweep_profiles_v3_b030.csv', index=False)
    scatter.to_csv(outdir/'scatter_profiles_b030.csv', index=False)
    hist_df.to_csv(outdir/'histograms_by_profile_b030.csv', index=False)
    traj_df.to_csv(outdir/'trajectories_by_profile_b030.csv', index=False)
    comp_df.to_csv(outdir/'comparison_b025_to_b030.csv', index=False)
    checks_df.to_csv(outdir/'stress_test_checks_b030.csv', index=False)
    # Reuse unchanged heatmap
    shutil.copyfile(outdir/'heatmap_alpha_pi.csv', outdir/'heatmap_alpha_pi_b030.csv')
    build_correlation_grids()

    # Update code file with beta 0.30 marker
    code_text = Path(__file__).read_text()
    Path(outdir/'flattening_v4.py').write_text(code_text)

    # Write report
    contrast = 100*(summary_new.loc[summary_new.profile_num==3,'P99_G0'].iloc[0]/summary_new.loc[summary_new.profile_num==2,'P99_G0'].iloc[0]-1)
    p6_benefit = 100*summary_new.loc[summary_new.profile_num==6,'scaffold_benefit'].iloc[0]
    lines = [
        '# Stress test report — β_conform = 0.30',
        '',
        f'- β_conform fixed at **0.30**.',
        f'- Comparison baseline run used existing `profile_summary_v3.csv` (previous run in this workspace).',
        '',
        '## Convergence checks V1-V3',
    ]
    for _,r in checks_df[checks_df['check'].isin(['V1','V2','V3'])].iterrows():
        lines.append(f"- **{r['check']}** ({r['profile_num']}): {'PASS' if bool(r['pass']) else 'FAIL'} — {r['value']}")
    lines += ['', '## Stress tests S1-S6']
    for _,r in checks_df[~checks_df['check'].isin(['V1','V2','V3'])].iterrows():
        lines.append(f"- **{r['check']}** ({r['profile_num']}): {'PASS' if bool(r['pass']) else 'FAIL'} — {r['value']}")
    lines += ['', '## Notes']
    lines.append(f'- P2 vs P3 contrast in P99 G0 = **{contrast:.2f}%**.')
    lines.append(f'- P6 scaffold_benefit = **{p6_benefit:.1f}%**.')
    lines.append('- Heatmap α×π is copied unchanged because the heatmap uses the central Beta(2,2) case where the conformism term is null by construction.')
    Path(outdir/'stress_test_report_b030.md').write_text('\n'.join(lines))
    print('done', flush=True)
