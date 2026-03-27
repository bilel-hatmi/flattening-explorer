"""
run_grid_search.py — Recalibration grid search for The Flattening v5.

Pass 1: Group A (mu_crisis × sigma_crisis × sigma_normal, 36 combos, M=100)
        Fixed: beta_conform=0.35, P6 p0_G0=0.75, P5 theta_G2=1.06
        Metrics: C1 (paradox), C2 (bimodality), S1 (ratio alpha)

Pass 2: Sequential sub-passes on top Pass-1 candidates, M=200
        2A: Group B (beta_conform) — checks C1+C2+C4
        2B: Group C (P6 p0_G0, P5 theta_G2) — checks C3+C5+C6
        2C: Group D (P3/P2 alpha) — checks C3+C4

All overrides applied IN MEMORY only. flattening_v5.py not modified.
"""
import sys, os, copy, time
os.environ.setdefault('PYTHONIOENCODING', 'utf-8')
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

from pathlib import Path
from concurrent.futures import ProcessPoolExecutor
import numpy as np
import pandas as pd

WORKSPACE = Path(__file__).resolve().parent
sys.path.insert(0, str(WORKSPACE))

from flattening_v5 import (
    PROFILES, SCENARIOS, SCENARIO_DEFAULTS, BASE_PARAMS,
    simulate_profile_scenario, make_params, make_scenarios,
)

OUTDIR = WORKSPACE / 'outputs'
OUTDIR.mkdir(exist_ok=True)
BASE_SEED = 5000
N_WORKERS = min(os.cpu_count() or 4, 16)

# ── Central case (make_exhibits spec — do not modify) ────────────────────────
CENTRAL_BASE = {
    'profile_label': 'central', 'description': '', 'geographies': '',
    'label_short': 'Central',
    'params': {
        'a_pi': 7.0, 'b_pi': 3.0, 'alpha': 0.70,
        'tau_alpha0': 2.0, 'tau_beta0': 2.0,
        'H_LO': 0.40, 'H_HI': 0.80, 'eta': 0.02,
    },
    'scenario_overrides': {},
}

# ── Search grids ──────────────────────────────────────────────────────────────
MU_VALS    = [1.2, 1.4, 1.6, 1.8]
SIGC_VALS  = [0.20, 0.25, 0.30]
SIGN_VALS  = [0.20, 0.25, 0.30]

BETA_CONF_VALS = [0.28, 0.30, 0.33, 0.35]
P6_P0_VALS     = [0.72, 0.75, 0.78]
P5_THETA_VALS  = [1.04, 1.06, 1.08]
P3_ALPHA_VALS  = [0.90, 0.93, 0.95]
P2_ALPHA_VALS  = [0.40, 0.45]

PASS1_BETA_CONFORM = 0.35
PASS1_P6_P0        = 0.75
PASS1_P5_THETA     = 1.06


# ════════════════════════════════════════════════════════════════════════════════
# HELPERS
# ════════════════════════════════════════════════════════════════════════════════

def make_central_spec(bp_overrides):
    """Deep copy + embed BASE_PARAMS overrides into central spec."""
    spec = copy.deepcopy(CENTRAL_BASE)
    spec['params'].update(bp_overrides)
    return spec


def make_profile_spec(pid, bp_overrides, profile_overrides=None):
    """Deep copy profile + embed BP overrides + profile-level overrides."""
    spec = copy.deepcopy(PROFILES[pid])
    spec['params'].update(bp_overrides)
    if profile_overrides:
        po = profile_overrides.get(pid, {})
        spec['params'].update(po.get('params', {}))
        for sc, ov in po.get('scenario_overrides', {}).items():
            spec['scenario_overrides'].setdefault(sc, {}).update(ov)
    return spec


def get_metrics(sim):
    L   = sim['arrays']['L'].reshape(-1)
    out = sim['arrays']['output'].reshape(-1)
    sc  = sim['scenario_meta']
    P99 = float(np.percentile(L, 99))
    return {
        'E_L': float(L.mean()),
        'P99': P99,
        'P99theta': P99 * sc['theta'],
        'Output': float(out.mean()),
    }


def gap_pct(sim):
    L = sim['arrays']['L'].reshape(-1)
    return float(100.0 * np.sum((L >= 600) & (L < 1200)) / len(L))


def scaffold_benefit(P99t_G0, P99t_G2):
    """(P99×θ_G0 − P99×θ_G2) / P99×θ_G0 × 100"""
    if P99t_G0 <= 0:
        return float('nan')
    return (P99t_G0 - P99t_G2) / P99t_G0 * 100.0


def g1_effect(P99t_G0, P99t_G1):
    if P99t_G0 <= 0:
        return float('nan')
    return (P99t_G0 - P99t_G1) / P99t_G0 * 100.0


def check_c1(dEL, dP99):
    return (-40 <= dEL <= -33) and (45 <= dP99 <= 65)


def check_c2(gp):
    return gp < 8.0


def check_s1(ratio):
    return 1.8 <= ratio <= 3.0


# ════════════════════════════════════════════════════════════════════════════════
# PASS 1 WORKERS
# ════════════════════════════════════════════════════════════════════════════════

def _pass1_worker(args):
    mu_c, sig_c, sig_n = args
    bp = {
        'mu_crisis': mu_c, 'sigma_crisis': sig_c, 'sigma_normal': sig_n,
        'beta_conform': PASS1_BETA_CONFORM,
    }
    spec = make_central_spec(bp)

    # 1. Central baseline M=100
    s_bl  = simulate_profile_scenario(spec, 'baseline', M=100, base_seed=BASE_SEED)
    m_bl  = get_metrics(s_bl)

    # 2. Central G0 M=100
    s_g0  = simulate_profile_scenario(spec, 'G0', M=100, base_seed=BASE_SEED)
    m_g0  = get_metrics(s_g0)

    # 3. Gap G0 M=200 for C2
    s_gap = simulate_profile_scenario(spec, 'G0', M=200, base_seed=BASE_SEED)
    gp    = gap_pct(s_gap)

    # 4-5. Alpha ablation alpha=0.30 and alpha=0.90 (G0, M=100)
    spec30 = make_central_spec({**bp, 'alpha': 0.30})
    spec90 = make_central_spec({**bp, 'alpha': 0.90})
    s_a30  = simulate_profile_scenario(spec30, 'G0', M=100, base_seed=BASE_SEED)
    s_a90  = simulate_profile_scenario(spec90, 'G0', M=100, base_seed=BASE_SEED)
    P99_30 = np.percentile(s_a30['arrays']['L'].reshape(-1), 99)
    P99_90 = np.percentile(s_a90['arrays']['L'].reshape(-1), 99)
    ratio  = float(P99_90 / P99_30) if P99_30 > 0 else float('nan')

    dEL  = (m_g0['E_L']  - m_bl['E_L'])  / m_bl['E_L']  * 100
    dP99 = (m_g0['P99']  - m_bl['P99'])  / m_bl['P99']  * 100

    return {
        'mu_crisis': mu_c, 'sigma_crisis': sig_c, 'sigma_normal': sig_n,
        'dEL': round(dEL, 1), 'dP99': round(dP99, 1),
        'gap_pct': round(gp, 1), 'ratio_alpha': round(ratio, 2),
        'C1': check_c1(dEL, dP99), 'C2': check_c2(gp), 'S1': check_s1(ratio),
        'n_pass': int(check_c1(dEL, dP99)) + int(check_c2(gp)) + int(check_s1(ratio)),
        'P99_bl': m_bl['P99'], 'E_L_g0': m_g0['E_L'], 'P99_g0': m_g0['P99'],
    }


# ════════════════════════════════════════════════════════════════════════════════
# PASS 2 WORKERS
# ════════════════════════════════════════════════════════════════════════════════

def _pass2_central_worker(args):
    """Central case only: C1 + C2 + S1. For sub-pass 2A."""
    config_id, bp, M = args
    spec = make_central_spec(bp)

    s_bl  = simulate_profile_scenario(spec, 'baseline', M=M, base_seed=BASE_SEED)
    s_g0  = simulate_profile_scenario(spec, 'G0',      M=M, base_seed=BASE_SEED)
    m_bl  = get_metrics(s_bl)
    m_g0  = get_metrics(s_g0)
    gp    = gap_pct(s_g0)

    spec30 = make_central_spec({**bp, 'alpha': 0.30})
    spec90 = make_central_spec({**bp, 'alpha': 0.90})
    s30    = simulate_profile_scenario(spec30, 'G0', M=M, base_seed=BASE_SEED)
    s90    = simulate_profile_scenario(spec90, 'G0', M=M, base_seed=BASE_SEED)
    P30    = float(np.percentile(s30['arrays']['L'].reshape(-1), 99))
    P90    = float(np.percentile(s90['arrays']['L'].reshape(-1), 99))

    dEL  = (m_g0['E_L'] - m_bl['E_L']) / m_bl['E_L']  * 100
    dP99 = (m_g0['P99'] - m_bl['P99']) / m_bl['P99']  * 100
    ratio = P90 / P30 if P30 > 0 else float('nan')

    return {
        'config_id': config_id,
        'dEL': round(dEL, 1), 'dP99': round(dP99, 1),
        'gap_pct': round(gp, 1), 'ratio_alpha': round(ratio, 2),
        'C1': check_c1(dEL, dP99), 'C2': check_c2(gp), 'S1': check_s1(ratio),
    }


def _pass2_profile_worker(args):
    """One profile × one scenario, with full bp + profile overrides."""
    config_id, pid, sc_name, bp, profile_overrides, M = args
    spec = make_profile_spec(pid, bp, profile_overrides)
    sim  = simulate_profile_scenario(spec, sc_name, M=M, base_seed=BASE_SEED)
    m    = get_metrics(sim)
    return {
        'config_id': config_id, 'pid': pid, 'scenario': sc_name,
        'E_L': m['E_L'], 'P99': m['P99'],
        'P99theta': m['P99theta'], 'Output': m['Output'],
    }


# ════════════════════════════════════════════════════════════════════════════════
# PASS 1 — GROUP A
# ════════════════════════════════════════════════════════════════════════════════

def run_pass1():
    print('\n' + '═'*60)
    print('PASSE 1 — Groupe A (36 combos, M=100)')
    print(f'  Fixed: beta_conform={PASS1_BETA_CONFORM}, P6 p0={PASS1_P6_P0}, '
          f'P5 theta_G2={PASS1_P5_THETA}')
    print('═'*60)

    jobs = [(mu, sc, sn) for mu in MU_VALS for sc in SIGC_VALS for sn in SIGN_VALS]

    t0 = time.time()
    with ProcessPoolExecutor(max_workers=N_WORKERS) as ex:
        results = list(ex.map(_pass1_worker, jobs))
    print(f'  Completed in {time.time()-t0:.1f}s')

    df = pd.DataFrame(results).sort_values('n_pass', ascending=False)

    # Header
    print(f'\n{"mu_c":5s} {"sig_c":5s} {"sig_n":5s} '
          f'{"ΔE[L]%":7s} {"ΔP99%":6s} {"Gap%":5s} {"rα":5s} '
          f'{"C1":2s} {"C2":2s} {"S1":2s} {"#✓":3s}')
    print('─'*60)
    for _, r in df.iterrows():
        c1 = '✓' if r.C1 else '✗'
        c2 = '✓' if r.C2 else '✗'
        s1 = '✓' if r.S1 else '✗'
        print(f'{r.mu_crisis:5.2f} {r.sigma_crisis:5.2f} {r.sigma_normal:5.2f} '
              f'{r.dEL:7.1f} {r.dP99:6.1f} {r.gap_pct:5.1f} {r.ratio_alpha:5.2f} '
              f'{c1:2s} {c2:2s} {s1:2s} {int(r.n_pass):3d}')

    df.to_csv(OUTDIR / 'grid_search_pass1.csv', index=False)
    print(f'\n  Saved: outputs/grid_search_pass1.csv')

    # Top candidates (C1 + C2 required; S1 preferred)
    top_c1c2 = df[df.C1 & df.C2]
    if len(top_c1c2) == 0:
        print('  ⚠ No combo satisfies C1+C2. Relaxing to C1 only.')
        top_c1c2 = df[df.C1]
    if len(top_c1c2) == 0:
        print('  ⚠ No combo satisfies C1. Selecting top 5 by n_pass.')
        top_c1c2 = df.head(5)

    top = top_c1c2.sort_values(['S1', 'ratio_alpha'], ascending=[False, False]).head(5)
    print(f'\n  Top {len(top)} candidates retained:')
    for _, r in top.iterrows():
        print(f'    mu={r.mu_crisis:.2f} sig_c={r.sigma_crisis:.2f} sig_n={r.sigma_normal:.2f} '
              f'| ΔP99={r.dP99:.1f}% Gap={r.gap_pct:.1f}% rα={r.ratio_alpha:.2f} '
              f'[C1={"✓" if r.C1 else "✗"} C2={"✓" if r.C2 else "✗"} S1={"✓" if r.S1 else "✗"}]')

    return top.to_dict('records')


# ════════════════════════════════════════════════════════════════════════════════
# PASS 2 — SUB-PASSES A/B/C
# ════════════════════════════════════════════════════════════════════════════════

def _run_full_profiles(config_id, bp, profile_overrides, M=200):
    """Run all 8 profiles × 4 scenarios. Returns dict keyed (pid, sc)."""
    jobs = [
        (config_id, pid, sc, bp, profile_overrides, M)
        for pid in sorted(PROFILES) for sc in SCENARIOS
    ]
    with ProcessPoolExecutor(max_workers=N_WORKERS) as ex:
        rows = list(ex.map(_pass2_profile_worker, jobs))

    res = {}
    for r in rows:
        res[(r['pid'], r['scenario'])] = r
    return res


def _compute_profile_metrics(res):
    """Compute C3-C7, S3 from profile simulation results."""
    P99t = {(pid, sc): res[(pid, sc)]['P99theta']
            for pid in sorted(PROFILES) for sc in SCENARIOS}
    EL   = {(pid, sc): res[(pid, sc)]['E_L']
            for pid in sorted(PROFILES) for sc in SCENARIOS}
    Out  = {(pid, sc): res[(pid, sc)]['Output']
            for pid in sorted(PROFILES) for sc in SCENARIOS}

    # scaffold_benefit, G1_effect per profile
    sb = {}
    g1 = {}
    prem = {}
    for pid in sorted(PROFILES):
        P0t = P99t[(pid, 'baseline')]
        Gt  = P99t[(pid, 'G0')]
        G1t = P99t[(pid, 'G1')]
        G2t = P99t[(pid, 'G2')]
        sb[pid]   = scaffold_benefit(Gt, G2t)
        g1[pid]   = g1_effect(Gt, G1t)
        prem[pid] = (Gt - P0t) / P0t * 100 if P0t > 0 else float('nan')

    # C3: P8 max, P6 min, P7 > P3
    P99t_G0 = {pid: P99t[(pid, 'G0')] for pid in sorted(PROFILES)}
    max_pid  = max(P99t_G0, key=P99t_G0.get)
    min_pid  = min(P99t_G0, key=P99t_G0.get)
    c3 = (max_pid == 8) and (min_pid == 6) and (P99t_G0[7] > P99t_G0[3])

    # C4: (P3 - P2) / P2
    c4_val = (P99t_G0[3] - P99t_G0[2]) / P99t_G0[2] * 100 if P99t_G0[2] > 0 else float('nan')
    c4 = 20 <= c4_val <= 35

    # C5: scaffold P5 ≤ +5%
    c5 = sb[5] <= 5.0

    # C6: P6 scaffold > all others
    c6 = all(sb[6] > sb[pid] for pid in sorted(PROFILES) if pid != 6)

    # C7: G1_effect mean < 12%
    g1_mean = float(np.mean([g1[pid] for pid in sorted(PROFILES)]))
    c7 = g1_mean < 12.0

    # S3: premium P3 > 130%, P2 > 130%
    s3 = (prem[3] > 130) and (prem[2] > 130)

    return {
        'C3': c3, 'C4': c4, 'C5': c5, 'C6': c6, 'C7': c7,
        'C4_val': round(c4_val, 1),
        'sb': {pid: round(sb[pid], 1) for pid in sorted(PROFILES)},
        'g1_mean': round(g1_mean, 1),
        'prem_P2': round(prem[2], 1), 'prem_P3': round(prem[3], 1),
        'P99t_G0': {pid: round(v, 1) for pid, v in P99t_G0.items()},
        'max_pid': max_pid, 'min_pid': min_pid,
        'P7_vs_P3': round(P99t_G0[7] - P99t_G0[3], 1),
        'S3': s3, 'g1_eff_by_profile': {pid: round(g1[pid], 1) for pid in sorted(PROFILES)},
    }


def subpass_2A(top_candidates, M=200):
    """Group B: beta_conform. Returns best (bp_base, beta_conform) per candidate."""
    print('\n─'*60)
    print('Sous-passe 2A — Groupe B (beta_conform)')
    print('─'*60)
    best_per_cand = []

    for cand in top_candidates:
        bp_a = {
            'mu_crisis': cand['mu_crisis'],
            'sigma_crisis': cand['sigma_crisis'],
            'sigma_normal': cand['sigma_normal'],
        }
        print(f'\n  Candidat: mu={bp_a["mu_crisis"]:.2f} sig_c={bp_a["sigma_crisis"]:.2f} '
              f'sig_n={bp_a["sigma_normal"]:.2f}')

        results_bc = []
        for bc in BETA_CONF_VALS:
            bp = {**bp_a, 'beta_conform': bc}
            config_id = f'A{cand["mu_crisis"]:.2f}_bc{bc:.2f}'

            # Central case check (C1/C2/S1)
            cent_res = _pass2_central_worker((config_id, bp, M))

            # Profile runs (C3-C7, S3)
            res = _run_full_profiles(config_id, bp, profile_overrides={}, M=M)
            pm  = _compute_profile_metrics(res)

            n_hard = sum([cent_res['C1'], cent_res['C2'], pm['C3'], pm['C4'], pm['C5'], pm['C6'], pm['C7']])
            results_bc.append({
                'beta_conform': bc, 'config_id': config_id,
                'dEL': cent_res['dEL'], 'dP99': cent_res['dP99'],
                'gap_pct': cent_res['gap_pct'], 'ratio_alpha': cent_res['ratio_alpha'],
                'C1': cent_res['C1'], 'C2': cent_res['C2'],
                'C4_val': pm['C4_val'], 'g1_mean': pm['g1_mean'],
                'prem_P2': pm['prem_P2'], 'prem_P3': pm['prem_P3'],
                **{f'C{i}': pm[f'C{i}'] for i in [3,4,5,6,7]},
                'S1': cent_res['S1'], 'S3': pm['S3'],
                'n_hard': n_hard, 'pm': pm, 'bp': bp,
            })
            print(f'    β={bc:.2f}: ΔP99={cent_res["dP99"]:.1f}% gap={cent_res["gap_pct"]:.1f}% '
                  f'C4={pm["C4_val"]:.1f}% g1={pm["g1_mean"]:.1f}% '
                  f'| C1{"✓" if cent_res["C1"] else "✗"} C2{"✓" if cent_res["C2"] else "✗"} '
                  f'C3{"✓" if pm["C3"] else "✗"} C4{"✓" if pm["C4"] else "✗"} '
                  f'C7{"✓" if pm["C7"] else "✗"} → {n_hard}/7')

        best = max(results_bc, key=lambda x: (x['n_hard'], x['S1']))
        best_per_cand.append(best)
        print(f'  → Meilleur beta_conform={best["beta_conform"]:.2f} ({best["n_hard"]}/7 hard)')

    return best_per_cand


def subpass_2B(candidates_2A, M=200):
    """Group C: P6 p0_G0 × P5 theta_G2. Returns best per candidate."""
    print('\n─'*60)
    print('Sous-passe 2B — Groupe C (P6 p0_G0 × P5 theta_G2)')
    print('─'*60)
    best_per_cand = []

    for cand in candidates_2A:
        bp = cand['bp']
        print(f'\n  Config: mu={bp["mu_crisis"]:.2f} bc={bp["beta_conform"]:.2f}')

        results_c = []
        for p6p0 in P6_P0_VALS:
            for p5th in P5_THETA_VALS:
                profile_overrides = {
                    6: {'scenario_overrides': {'G0': {'p0': p6p0}}},
                    5: {'scenario_overrides': {'G2': {'theta': p5th}}},
                }
                config_id = f'C_mu{bp["mu_crisis"]:.1f}_bc{bp["beta_conform"]:.2f}_p6{p6p0:.2f}_p5{p5th:.2f}'

                res = _run_full_profiles(config_id, bp, profile_overrides, M=M)
                pm  = _compute_profile_metrics(res)
                n_hard = sum([pm[f'C{i}'] for i in [3,4,5,6,7]])
                results_c.append({
                    'p6_p0': p6p0, 'p5_theta': p5th,
                    'config_id': config_id, 'n_hard_c': n_hard,
                    'C3': pm['C3'], 'C4': pm['C4'], 'C5': pm['C5'],
                    'C6': pm['C6'], 'C7': pm['C7'],
                    'C4_val': pm['C4_val'], 'g1_mean': pm['g1_mean'],
                    'sb_P5': pm['sb'][5], 'sb_P6': pm['sb'][6],
                    'min_pid': pm['min_pid'], 'max_pid': pm['max_pid'],
                    'pm': pm, 'bp': bp, 'profile_overrides': profile_overrides,
                })
                print(f'    P6p0={p6p0:.2f} P5θ={p5th:.2f}: '
                      f'min={pm["min_pid"]} sb5={pm["sb"][5]:.1f}% sb6={pm["sb"][6]:.1f}% '
                      f'C3{"✓" if pm["C3"] else "✗"} C5{"✓" if pm["C5"] else "✗"} '
                      f'C6{"✓" if pm["C6"] else "✗"} → {n_hard}/5')

        best = max(results_c, key=lambda x: (x['n_hard_c'], x['C6'], x['C5']))
        best_per_cand.append({**cand, **best})
        print(f'  → Meilleur P6p0={best["p6_p0"]:.2f} P5θ={best["p5_theta"]:.2f} '
              f'({best["n_hard_c"]}/5 C3-C7)')

    return best_per_cand


def subpass_2C(candidates_2B, M=200):
    """Group D: P3 alpha × P2 alpha. Returns best per candidate."""
    print('\n─'*60)
    print('Sous-passe 2C — Groupe D (P3 alpha × P2 alpha)')
    print('─'*60)
    best_per_cand = []

    for cand in candidates_2B:
        bp = cand['bp']
        po_base = cand.get('profile_overrides', {})
        print(f'\n  Config: mu={bp["mu_crisis"]:.2f} bc={bp["beta_conform"]:.2f} '
              f'P6p0={cand["p6_p0"]:.2f} P5θ={cand["p5_theta"]:.2f}')

        results_d = []
        for p3a in P3_ALPHA_VALS:
            for p2a in P2_ALPHA_VALS:
                po = copy.deepcopy(po_base)
                po.setdefault(3, {}).setdefault('params', {})['alpha'] = p3a
                po.setdefault(2, {}).setdefault('params', {})['alpha'] = p2a

                config_id = f'D_a{p3a:.2f}_{p2a:.2f}'
                res = _run_full_profiles(config_id, bp, po, M=M)
                pm  = _compute_profile_metrics(res)
                n_hard = sum([pm[f'C{i}'] for i in [3,4,5,6,7]])
                results_d.append({
                    'p3_alpha': p3a, 'p2_alpha': p2a,
                    'config_id': config_id, 'n_hard_d': n_hard,
                    'C3': pm['C3'], 'C4': pm['C4'], 'C4_val': pm['C4_val'],
                    'C5': pm['C5'], 'C6': pm['C6'], 'C7': pm['C7'],
                    'g1_mean': pm['g1_mean'], 'prem_P2': pm['prem_P2'], 'prem_P3': pm['prem_P3'],
                    'P7_vs_P3': pm['P7_vs_P3'], 'P99t_G0': pm['P99t_G0'],
                    'pm': pm, 'bp': bp, 'profile_overrides': po,
                })
                print(f'    P3α={p3a:.2f} P2α={p2a:.2f}: '
                      f'C4={pm["C4_val"]:.1f}% C3{"✓" if pm["C3"] else "✗"} '
                      f'C4{"✓" if pm["C4"] else "✗"} → {n_hard}/5')

        best = max(results_d, key=lambda x: (x['n_hard_d'], x['C4']))
        best_per_cand.append({**cand, **best})
        print(f'  → Meilleur P3α={best["p3_alpha"]:.2f} P2α={best["p2_alpha"]:.2f} '
              f'({best["n_hard_d"]}/5 C3-C7 | C4={best["C4_val"]:.1f}%)')

    return best_per_cand


# ════════════════════════════════════════════════════════════════════════════════
# RAPPORT FINAL
# ════════════════════════════════════════════════════════════════════════════════

def report_best(final_candidates, pass1_top):
    """Find overall best and print full report."""
    # Score = n_hard C1-C7 + n_soft S1/S3
    def score(cand):
        pm   = cand.get('pm', {})
        cent = cand.get('C1', False)  # from 2A result
        hard = (int(cand.get('C1', False)) + int(cand.get('C2', False)) +
                int(pm.get('C3', False)) + int(pm.get('C4', False)) +
                int(pm.get('C5', False)) + int(pm.get('C6', False)) +
                int(pm.get('C7', False)))
        soft = int(cand.get('S1', False)) + int(pm.get('S3', False))
        return hard * 10 + soft

    best = max(final_candidates, key=score)
    bp   = best['bp']
    pm   = best['pm']
    po   = best.get('profile_overrides', {})

    print('\n' + '═'*66)
    print('BEST COMBINATION FOUND')
    print('═'*66)

    print('\nModified parameters vs current values:')
    print(f'  mu_crisis    : 2.2 → {bp["mu_crisis"]:.2f}')
    print(f'  sigma_crisis : 0.3 → {bp["sigma_crisis"]:.2f}')
    print(f'  sigma_normal : 0.25 → {bp["sigma_normal"]:.2f}')
    print(f'  beta_conform : 0.30 → {bp["beta_conform"]:.2f}')
    p6p0 = (po.get(6, {}).get('scenario_overrides', {}).get('G0', {}).get('p0', 'unchanged'))
    p5th = (po.get(5, {}).get('scenario_overrides', {}).get('G2', {}).get('theta', 'unchanged'))
    p3a  = po.get(3, {}).get('params', {}).get('alpha', 'unchanged')
    p2a  = po.get(2, {}).get('params', {}).get('alpha', 'unchanged')
    print(f'  P6 p0_G0     : 0.80 → {p6p0}')
    print(f'  P5 theta_G2  : 1.08 → {p5th}')
    print(f'  P3 alpha     : 0.90 → {p3a}')
    print(f'  P2 alpha     : 0.40 → {p2a}')

    print('\nTargets C1-C7:')
    print(f'  C1 Paradox   ΔE[L]={best.get("dEL","?"):.1f}% ΔP99={best.get("dP99","?"):.1f}% : {"✓" if best.get("C1") else "✗"}')
    print(f'  C2 Bimod.    Gap={best.get("gap_pct","?"):.1f}%                        : {"✓" if best.get("C2") else "✗"}')
    print(f'  C3 Hierarch. P8=max({pm["max_pid"]}?), P6=min({pm["min_pid"]}?), P7>P3({pm["P7_vs_P3"]:.0f}) : {"✓" if pm["C3"] else "✗"}')
    print(f'  C4 Paris-London {pm["C4_val"]:+.1f}% (target +20% to +35%)   : {"✓" if pm["C4"] else "✗"}')
    print(f'  C5 Scaffold P5 {pm["sb"][5]:+.1f}% (target ≤ +5%)            : {"✓" if pm["C5"] else "✗"}')
    print(f'  C6 Scaffold P6 {pm["sb"][6]:+.1f}% = max?                   : {"✓" if pm["C6"] else "✗"}')
    print(f'  C7 G1_eff mean {pm["g1_mean"]:.1f}% (target < 12%)           : {"✓" if pm["C7"] else "✗"}')

    print('\nSoft targets:')
    print(f'  S1 ratio α  = {best.get("ratio_alpha","?"):.2f}× (target 1.8-3.0): {"✓" if best.get("S1") else "✗"}')
    print(f'  S3 premium P2={pm["prem_P2"]:.0f}%, P3={pm["prem_P3"]:.0f}% (target >130%): {"✓" if pm["S3"] else "✗"}')

    total_hard = sum([best.get('C1',False), best.get('C2',False),
                      pm['C3'], pm['C4'], pm['C5'], pm['C6'], pm['C7']])
    print(f'\n  Hard score: {total_hard}/7')

    print('\nP99×θ G0 by profile:')
    labels = {1:'Frankfurt',2:'London',3:'Paris',4:'Brussels',
              5:'SF',6:'Singapore',7:'Bangalore',8:'Seoul'}
    for pid in sorted(PROFILES):
        print(f'  P{pid} {labels[pid]:12s}: {pm["P99t_G0"][pid]:.1f}')

    print('\nScaffold_benefit by profile:')
    for pid in sorted(PROFILES):
        print(f'  P{pid} {labels[pid]:12s}: {pm["sb"][pid]:+.1f}%')

    # Save pass2 results
    rows = []
    for cand in final_candidates:
        pm_c = cand.get('pm', {})
        po_c = cand.get('profile_overrides', {})
        bp_c = cand.get('bp', {})
        rows.append({
            'mu_crisis':    bp_c.get('mu_crisis'),
            'sigma_crisis': bp_c.get('sigma_crisis'),
            'sigma_normal': bp_c.get('sigma_normal'),
            'beta_conform': bp_c.get('beta_conform'),
            'p6_p0': po_c.get(6, {}).get('scenario_overrides', {}).get('G0', {}).get('p0'),
            'p5_theta': po_c.get(5, {}).get('scenario_overrides', {}).get('G2', {}).get('theta'),
            'p3_alpha': po_c.get(3, {}).get('params', {}).get('alpha'),
            'p2_alpha': po_c.get(2, {}).get('params', {}).get('alpha'),
            'dEL': cand.get('dEL'), 'dP99': cand.get('dP99'),
            'gap_pct': cand.get('gap_pct'), 'ratio_alpha': cand.get('ratio_alpha'),
            'C4_val': pm_c.get('C4_val'), 'g1_mean': pm_c.get('g1_mean'),
            'sb_P5': pm_c.get('sb', {}).get(5), 'sb_P6': pm_c.get('sb', {}).get(6),
            **{f'C{i}': pm_c.get(f'C{i}') for i in range(1,8)},
            'S1': cand.get('S1'), 'S3': pm_c.get('S3'),
        })
    pd.DataFrame(rows).to_csv(OUTDIR / 'grid_search_pass2.csv', index=False)
    print(f'\n  Saved: outputs/grid_search_pass2.csv')

    return best


# ════════════════════════════════════════════════════════════════════════════════
# MAIN
# ════════════════════════════════════════════════════════════════════════════════

if __name__ == '__main__':
    t_start = time.time()
    print('═'*66)
    print('  GRID SEARCH RECALIBRATION — The Flattening v5')
    print(f'  N_WORKERS={N_WORKERS}')
    print('═'*66)

    # ── PASSE 1 ──────────────────────────────────────────────────────────────
    top_candidates = run_pass1()

    # ── PASS 2 ───────────────────────────────────────────────────────────────
    print('\n' + '═'*60)
    print('PASS 2 — Groups B/C/D on top candidates (M=200)')
    print('═'*60)

    cands_2A = subpass_2A(top_candidates, M=200)
    cands_2B = subpass_2B(cands_2A, M=200)
    cands_2C = subpass_2C(cands_2B, M=200)

    best = report_best(cands_2C, top_candidates)

    print(f'\n{"═"*66}')
    print(f'  GRID SEARCH COMPLETED in {time.time()-t_start:.1f}s')
    print('═'*66)
