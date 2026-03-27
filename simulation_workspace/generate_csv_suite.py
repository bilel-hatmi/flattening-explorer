"""
generate_csv_suite.py -- NorthStar v11 complete CSV generation
The Flattening -- Cambridge-McKinsey Risk Prize 2026

Generates all required CSVs for the paper and explorer app.
Uses flattening_v5.py as the simulation engine with inline profile definitions
(NorthStar v11 parameters, no per-profile theta overrides for G2).

Sprint 1 (blocking): ablation_results.csv, exhibit_2_frontier.csv
Sprint 2: histograms, trajectories, heatmap, sweep_dimensions, three profile CSVs
Sprint 3: correlation grids, ten_replications
"""

import copy
import sys
import io
import numpy as np
import pandas as pd
from pathlib import Path

# Force UTF-8 output on Windows (cp1252 terminals can't print some chars)
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
else:
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from flattening_v5 import simulate_profile_scenario, BASE_PARAMS, SCENARIO_DEFAULTS

WORKSPACE = Path(__file__).parent
DATA_APP  = WORKSPACE / 'outputs'
DATA_APP.mkdir(exist_ok=True)

# ---------------------------------------------------------------------------
# Shared constants
# ---------------------------------------------------------------------------

COUPLED = {
    'sigma_normal': 0.25,
    'mu_crisis':    2.2,
    'sigma_crisis': 0.3,
    'kappa_normal': 60,
}

THETA = {'baseline': 1.00, 'G0': 1.25, 'G1': 1.20, 'G2': 1.10}

# ---------------------------------------------------------------------------
# Profile definitions -- NorthStar v11 (with per-profile G2 theta overrides)
# ---------------------------------------------------------------------------

PROFILES_V11 = {
    'P1': dict(
        profile_label='frankfurt_bigfour', city='Frankfurt', country='Germany',
        sector='Finance/Audit',
        params=dict(a_pi=5.0, b_pi=5.0, alpha=0.70, tau_alpha0=3.5, tau_beta0=3.5,
                    H_LO=0.55, H_HI=0.85, eta=0.02, **COUPLED),
        scenario_overrides={'G0': {'p0': 0.75}, 'G1': {'p0': 0.65}, 'G2': {'p0': 0.50, 'theta': 1.12}},
    ),
    'P2': dict(
        profile_label='london_bank', city='London', country='UK',
        sector='Investment banking',
        params=dict(a_pi=5.5, b_pi=4.5, alpha=0.40, tau_alpha0=1.5, tau_beta0=1.5,
                    H_LO=0.65, H_HI=0.95, eta=0.02, **COUPLED),
        scenario_overrides={'G0': {'p0': 0.70}, 'G1': {'p0': 0.55}, 'G2': {'p0': 0.42, 'theta': 1.18}},
    ),
    'P3': dict(
        profile_label='paris_consulting', city='Paris', country='France',
        sector='Strategy consulting',
        params=dict(a_pi=5.5, b_pi=4.5, alpha=0.90, tau_alpha0=4.0, tau_beta0=4.0,
                    H_LO=0.65, H_HI=0.95, eta=0.02, **COUPLED),
        scenario_overrides={'G0': {'p0': 0.70}, 'G1': {'p0': 0.55}, 'G2': {'p0': 0.42, 'theta': 1.18}},
    ),
    'P4': dict(
        profile_label='brussels_legal', city='Brussels', country='Belgium',
        sector='Corporate legal',
        params=dict(a_pi=4.5, b_pi=5.5, alpha=0.90, tau_alpha0=3.0, tau_beta0=3.0,
                    H_LO=0.40, H_HI=0.80, eta=0.01, **COUPLED),
        scenario_overrides={'G0': {'p0': 0.80}, 'G1': {'p0': 0.70}, 'G2': {'p0': 0.55}},
    ),
    'P5': dict(
        profile_label='sf_startup', city='San Francisco', country='USA',
        sector='Tech startup',
        params=dict(a_pi=7.0, b_pi=3.0, alpha=0.60, tau_alpha0=2.5, tau_beta0=2.5,
                    H_LO=0.50, H_HI=0.85, eta=0.03, **COUPLED),
        scenario_overrides={'G0': {'p0': 0.80}, 'G1': {'p0': 0.75}, 'G2': {'p0': 0.70, 'theta': 1.08}},
    ),
    'P6': dict(
        profile_label='singapore_creative', city='Singapore', country='Singapore',
        sector='Creative agency',
        params=dict(a_pi=8.5, b_pi=1.5, alpha=0.30, tau_alpha0=1.5, tau_beta0=1.5,
                    H_LO=0.40, H_HI=0.80, eta=0.01, **COUPLED),
        scenario_overrides={'G0': {'p0': 0.80}, 'G1': {'p0': 0.70}, 'G2': {'p0': 0.55}},
    ),
    'P7': dict(
        profile_label='bangalore_backoffice', city='Bangalore', country='India',
        sector='Back-office',
        params=dict(a_pi=7.5, b_pi=2.5, alpha=0.70, tau_alpha0=2.0, tau_beta0=2.0,
                    H_LO=0.30, H_HI=0.60, eta=0.04, **COUPLED),
        scenario_overrides={'G0': {'p0': 0.85}, 'G1': {'p0': 0.80}, 'G2': {'p0': 0.78, 'theta': 1.03}},
    ),
    'P8': dict(
        profile_label='seoul_admin', city='Seoul', country='S. Korea',
        sector='Central admin',
        params=dict(a_pi=6.0, b_pi=4.0, alpha=0.95, tau_alpha0=4.5, tau_beta0=4.5,
                    H_LO=0.40, H_HI=0.75, eta=0.01, **COUPLED),
        scenario_overrides={'G0': {'p0': 0.80}, 'G1': {'p0': 0.70}, 'G2': {'p0': 0.55}},
    ),
}

CENTRAL_SPEC = dict(
    profile_label='central', description='', geographies='', label_short='',
    params=dict(a_pi=7.0, b_pi=3.0, alpha=0.70, tau_alpha0=2.0, tau_beta0=2.0,
                H_LO=0.40, H_HI=0.80, eta=0.02, **COUPLED),
    scenario_overrides={},
)

# NorthStar v11 reference values (G0 scenario, M=200, seed=5000)
NORTHSTAR_REF = {
    'P1': {'el': 572.9,  'p99': 1699.0, 'p99t': 2124.0, 'output': 1784.0},
    'P2': {'el': 507.4,  'p99': 1334.0, 'p99t': 1668.0, 'output': 1866.0},
    'P3': {'el': 480.8,  'p99': 1633.0, 'p99t': 2041.0, 'output': 1899.0},
    'P4': {'el': 597.2,  'p99': 1803.0, 'p99t': 2254.0, 'output': 1754.0},
    'P5': {'el': 467.7,  'p99': 1723.0, 'p99t': 2154.0, 'output': 1915.0},
    'P6': {'el': 440.3,  'p99': 1476.0, 'p99t': 1845.0, 'output': 1950.0},
    'P7': {'el': 509.8,  'p99': 1848.0, 'p99t': 2310.0, 'output': 1863.0},
    'P8': {'el': 479.8,  'p99': 1854.0, 'p99t': 2318.0, 'output': 1900.0},
}

COUNTERPRODUCTIVE = {'P1', 'P4', 'P5', 'P7', 'P8'}

PROFILE_COLORS = {
    'P1': '#D85A30', 'P2': '#378ADD', 'P3': '#B5403F', 'P4': '#534AB7',
    'P5': '#639922', 'P6': '#1D9E75', 'P7': '#BA7517', 'P8': '#888780',
}

# ---------------------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------------------

def _sim(spec, scenario, M=200, seed=5000, **kwargs):
    """Run simulate_profile_scenario, return arrays dict."""
    return simulate_profile_scenario(spec, scenario, M=M, base_seed=seed, **kwargs)['arrays']


def _sim_full(spec, scenario, M=200, seed=5000, **kwargs):
    """Run simulate_profile_scenario, return full result dict."""
    return simulate_profile_scenario(spec, scenario, M=M, base_seed=seed, **kwargs)


def _get_theta(scenario, spec=None):
    """Return theta for scenario, using per-profile override if present."""
    base = THETA[scenario]
    if spec is not None and scenario != 'baseline':
        base = spec.get('scenario_overrides', {}).get(scenario, {}).get('theta', base)
    return base


def _metrics(arrs, scenario, spec=None):
    """Return (el, p99_brut, p99_theta, output_mean) from arrays dict."""
    L_flat   = arrs['L'].reshape(-1)
    out_flat = arrs['output'].reshape(-1)
    el          = float(L_flat.mean())
    p99_brut    = float(np.percentile(L_flat, 99))
    p99_theta   = p99_brut * _get_theta(scenario, spec)
    output_mean = float(out_flat.mean())
    return el, p99_brut, p99_theta, output_mean


def deep_copy_with(spec, param_override=None, scenario_g0_override=None):
    """Return a modified deep copy of spec."""
    s = copy.deepcopy(spec)
    if param_override:
        s['params'].update(param_override)
    if scenario_g0_override:
        s['scenario_overrides'].setdefault('G0', {}).update(scenario_g0_override)
    return s


def _print_validation(label, el, el_ref, p99t, p99t_ref, out, out_ref):
    e1 = abs(el   - el_ref)   / el_ref
    e2 = abs(p99t - p99t_ref) / p99t_ref
    e3 = abs(out  - out_ref)  / out_ref
    st1 = '[OK]' if e1 < 0.02 else '[WARN]'
    st2 = '[OK]' if e2 < 0.02 else '[WARN]'
    st3 = '[OK]' if e3 < 0.02 else '[WARN]'
    print(f"  {label}:")
    print(f"    E[L]={el:.1f}  ref={el_ref:.1f}  err={e1:.1%}  {st1}")
    print(f"    P99xtheta={p99t:.1f}  ref={p99t_ref:.1f}  err={e2:.1%}  {st2}")
    print(f"    Output={out:.1f}  ref={out_ref:.1f}  err={e3:.1%}  {st3}")


def _scaffold_benefit_from_arrs(arrs_g0, arrs_g2, arrs_bl, spec=None):
    """Canonical scaffold_benefit formula (mirrors flattening_v5 enrich_profile_table).
    premium uses raw P99_L (no theta), gain uses theta-embedded Output."""
    _, p99b_g0, _, out_g0 = _metrics(arrs_g0, 'G0',       spec)
    _, p99b_g2, _, out_g2 = _metrics(arrs_g2, 'G2',       spec)
    _, p99b_bl, _, out_bl = _metrics(arrs_bl, 'baseline',  spec)
    gain_g0 = (out_g0 - out_bl) / out_bl * 100
    gain_g2 = (out_g2 - out_bl) / out_bl * 100
    prem_g0 = (p99b_g0 / p99b_bl - 1) * 100  # raw P99 ratio, no theta
    prem_g2 = (p99b_g2 / p99b_bl - 1) * 100
    if prem_g0 == 0:
        return 0.0
    ratio_g0 = gain_g0 / prem_g0
    ratio_g2 = gain_g2 / prem_g2 if prem_g2 != 0 else 0.0
    return float((ratio_g2 - ratio_g0) / ratio_g0)


# ---------------------------------------------------------------------------
# Step 0 -- validate BASE_PARAMS
# ---------------------------------------------------------------------------

def step0_validate_params():
    print("=" * 60)
    print("STEP 0 -- BASE_PARAMS validation")
    print(f"  beta_conform  = {BASE_PARAMS['beta_conform']}")
    print(f"  mu_crisis     = {BASE_PARAMS['mu_crisis']}")
    print(f"  sigma_crisis  = {BASE_PARAMS['sigma_crisis']}")
    print(f"  sigma_normal  = {BASE_PARAMS['sigma_normal']}")
    print(f"  p_crisis      = {BASE_PARAMS['p_crisis']}")
    print(f"  N={BASE_PARAMS['N']}, T={BASE_PARAMS['T']}, K={BASE_PARAMS['K']}")

    assert BASE_PARAMS['beta_conform'] == 0.30,  f"beta_conform={BASE_PARAMS['beta_conform']} != 0.30"
    assert BASE_PARAMS['mu_crisis']    == 2.2,   f"mu_crisis={BASE_PARAMS['mu_crisis']} != 2.2"
    assert BASE_PARAMS['sigma_normal'] == 0.25,  f"sigma_normal={BASE_PARAMS['sigma_normal']} != 0.25"
    assert BASE_PARAMS['p_crisis']     == 0.08,  f"p_crisis={BASE_PARAMS['p_crisis']} != 0.08"
    print("  [OK] All BASE_PARAMS confirmed\n")


# ---------------------------------------------------------------------------
# Step 0-bis -- quick validation run
# ---------------------------------------------------------------------------

def step0bis_quick_validation(M=50, seed=5000):
    print("STEP 0-bis -- Quick validation run (M=50, central G0)")
    arrs = _sim(CENTRAL_SPEC, 'G0', M=M, seed=seed)
    el, p99b, p99t, out = _metrics(arrs, 'G0')
    targets = {
        'E[L]':   (el,   499,  0.05),
        'P99xtheta':  (p99t, 2135, 0.05),
        'Output': (out,  1876, 0.05),
    }
    ok = True
    for name, (val, ref, tol) in targets.items():
        err = abs(val - ref) / ref
        status = '[OK]' if err <= tol else '[FAIL]'
        print(f"  {status} {name} = {val:.1f}  (ref {ref}, err {err:.1%})")
        if err > tol:
            ok = False
    if not ok:
        raise RuntimeError("Step 0-bis FAILED -- model may not match expected parameters. Stopping.")
    print("  -> Step 0-bis PASSED\n")


# ---------------------------------------------------------------------------
# RUN 1 -- ablation_results.csv (48 rows)
# ---------------------------------------------------------------------------

def run1_ablation(M=200, seed=5000):
    print("=" * 60)
    print("RUN 1 -- ablation_results.csv")
    rows = []
    full_p99t = {}

    # Pre-compute full reference P99 for delta calculations
    print("  Pre-computing 'full' references...")
    for pid, spec in PROFILES_V11.items():
        arrs = _sim(spec, 'G0', M=M, seed=seed)
        _, _, p99t, _ = _metrics(arrs, 'G0')
        full_p99t[pid] = p99t

    print("  Running all ablation conditions...")
    for pid, spec in PROFILES_V11.items():
        p99t_full = full_p99t[pid]

        conditions = [
            ('full',       spec,                                                                              'G0'),
            ('no_screen',  deep_copy_with(spec, scenario_g0_override={'gamma_eff': 0.0}),                    'G0'),
            ('no_conform', deep_copy_with(spec, param_override={'beta_conform': 0.0}),                       'G0'),
            ('div_stack',  deep_copy_with(spec, param_override={'alpha': 0.30}),                             'G0'),
            ('no_deskill', deep_copy_with(spec, param_override={'eta': 0.0}),                                'G0'),
            ('G2',         spec,                                                                              'G2'),
        ]
        for ablation, mod_spec, scenario in conditions:
            arrs = _sim(mod_spec, scenario, M=M, seed=seed)
            el, p99b, p99t, out = _metrics(arrs, scenario, mod_spec)
            delta = (p99t / p99t_full - 1) * 100 if ablation != 'full' else 0.0
            rows.append({
                'profile_id':   pid,
                'city':         spec['city'],
                'ablation':     ablation,
                'p99_theta':    round(p99t, 4),
                'p99_brut':     round(p99b, 4),
                'mean_loss':    round(el, 4),
                'output_mean':  round(out, 4),
                'delta_vs_full': round(delta, 4),
            })

    df = pd.DataFrame(rows)

    print("\n  Validation vs NorthStar (full condition):")
    all_pass = True
    for pid, ref in NORTHSTAR_REF.items():
        full_val = df[(df.profile_id == pid) & (df.ablation == 'full')]['p99_theta'].values[0]
        err = abs(full_val - ref['p99t']) / ref['p99t']
        status = '[OK]' if err < 0.02 else '[WARN] WARNING'
        print(f"    {pid}: p99theta={full_val:.0f}  ref={ref['p99t']:.0f}  err={err:.1%}  {status}")
        if err >= 0.02:
            all_pass = False
    if not all_pass:
        print("  [WARN] Some profiles exceed +/-2% -- report to user if delivering")

    df.to_csv(DATA_APP / 'ablation_results.csv', index=False)
    print(f"\n  [OK] RUN 1 saved: {len(df)} rows -> outputs/ablation_results.csv\n")
    return df


# ---------------------------------------------------------------------------
# RUN 2 -- exhibit_2_frontier.csv (4 rows, M=1000)
# ---------------------------------------------------------------------------

def run2_frontier(M=1000, seed=5000):
    print("=" * 60)
    print(f"RUN 2 -- exhibit_2_frontier.csv  (M={M})")
    rows = []
    for sc in ['baseline', 'G0', 'G1', 'G2']:
        print(f"  Simulating scenario={sc}...")
        arrs = _sim(CENTRAL_SPEC, sc, M=M, seed=seed)
        el, p99b, p99t, out = _metrics(arrs, sc)
        rows.append({
            'scenario':    sc,
            'output_mean': round(out, 4),
            'p99_theta':   round(p99t, 4),
            'mean_loss':   round(el, 4),
            'p99_brut':    round(p99b, 4),
        })

    df = pd.DataFrame(rows, columns=['scenario', 'output_mean', 'p99_theta', 'mean_loss', 'p99_brut'])

    vals = {r['scenario']: r['p99_theta'] for r in rows}
    saut_g0_g1 = vals['G0'] - vals['G1']
    saut_g1_g2 = vals['G1'] - vals['G2']
    ratio = saut_g1_g2 / saut_g0_g1 if saut_g0_g1 != 0 else float('nan')
    print(f"\n  Curvature ratio (G1-G2)/(G0-G1) = {ratio:.3f}  (target >= 1.5)")
    if ratio < 1.5:
        print("  [WARN] WARNING: ratio < 1.5 -- report to user before delivering")
    else:
        print("  [OK] Curvature condition met")

    print(f"\n  Reference values (M={M}):")
    ref = {'baseline': (801.7, 1097), 'G0': (498.9, 2135), 'G1': (556.8, 1913), 'G2': (618.0, 1521)}
    for sc, row in zip(['baseline', 'G0', 'G1', 'G2'], rows):
        el_ref, p99t_ref = ref[sc]
        print(f"    {sc}: E[L]={row['mean_loss']:.1f} (ref~{el_ref}), P99xtheta={row['p99_theta']:.1f} (ref~{p99t_ref})")

    df.to_csv(DATA_APP / 'exhibit_2_frontier.csv', index=False)
    print(f"\n  [OK] RUN 2 saved: {len(df)} rows -> outputs/exhibit_2_frontier.csv\n")
    return df


# ---------------------------------------------------------------------------
# RUN 3 -- histograms_by_profile_b030.csv (608 rows)
# ---------------------------------------------------------------------------

BIN_EDGES = np.arange(0, 2000, 100)   # 19 bins: [0,100), ..., [1800,1900)


def run3_histograms(M_hist=500, M_met=200, seed=5000):
    print("=" * 60)
    print(f"RUN 3 -- histograms_by_profile_b030.csv  (M_hist={M_hist}, M_met={M_met})")
    rows = []
    crisis_pct = float(BASE_PARAMS['p_crisis'])   # 0.08, constant across profiles/scenarios

    for pid, spec in PROFILES_V11.items():
        for sc in ['baseline', 'G0', 'G1', 'G2']:
            print(f"  {pid} {sc}...")
            # Metrics from M=200
            arrs_m = _sim(spec, sc, M=M_met, seed=seed)
            el, p99b, p99t, out = _metrics(arrs_m, sc, spec)
            tail_ratio = p99b / el if el > 0 else 0.0

            # Histogram from M=500
            arrs_h = _sim(spec, sc, M=M_hist, seed=seed)
            L_flat_h = arrs_h['L'].reshape(-1)
            counts, _ = np.histogram(L_flat_h, bins=BIN_EDGES)
            total = len(L_flat_h)

            for i, cnt in enumerate(counts):
                rows.append({
                    'profile_id':   pid,
                    'city':         spec['city'],
                    'scenario':     sc,
                    'bin_lo':       int(BIN_EDGES[i]),
                    'bin_hi':       int(BIN_EDGES[i + 1]),
                    'count':        int(cnt),
                    'density':      round(cnt / total / 100, 8),
                    'mean_loss':    round(el, 4),
                    'p99_brut':     round(p99b, 4),
                    'p99_theta':    round(p99t, 4),
                    'tail_ratio':   round(tail_ratio, 4),
                    'output_mean':  round(out, 4),
                    'crisis_pct':   crisis_pct,
                })

    df = pd.DataFrame(rows)
    p3g0 = df[(df.profile_id == 'P3') & (df.scenario == 'G0')].iloc[0]
    _print_validation('P3 Paris G0', p3g0.mean_loss, 480.8, p3g0.p99_theta, 2041.0, p3g0.output_mean, 1899.0)

    df.to_csv(DATA_APP / 'histograms_by_profile_b030.csv', index=False)
    print(f"\n  [OK] RUN 3 saved: {len(df)} rows -> outputs/histograms_by_profile_b030.csv  (expected 608)\n")
    return df


# ---------------------------------------------------------------------------
# RUN 4 -- trajectories_by_profile_b030.csv (640 rows)
# ---------------------------------------------------------------------------

def run4_trajectories(M=200, seed=5000):
    print("=" * 60)
    print(f"RUN 4 -- trajectories_by_profile_b030.csv  (M={M})")
    rows = []

    for pid, spec in PROFILES_V11.items():
        for sc in ['baseline', 'G0', 'G1', 'G2']:
            print(f"  {pid} {sc}...")
            arrs = _sim(spec, sc, M=M, seed=seed)

            # Per-quarter means (axis=0 over M replications -> shape T)
            L_t   = arrs['L'].mean(axis=0)
            P99_t = np.percentile(arrs['L'], 99, axis=0)
            vt    = arrs['var_tau'].mean(axis=0)
            hb    = arrs['h_bar'].mean(axis=0)
            fr    = arrs['follow_rate'].mean(axis=0)
            ce    = arrs['excess_coerror'].mean(axis=0)
            theta = _get_theta(sc, spec)
            P99t_t = P99_t * theta

            # Normalise (t=1 as reference)
            vt_norm = vt / vt[0]  if vt[0]  > 0 else np.ones_like(vt)
            hb_norm = hb / hb[0]  if hb[0]  > 0 else np.ones_like(hb)
            # follow_rate: normalise to final quarter (meaningful only for G0/G1/G2)
            fr_norm = fr / fr[-1] if fr[-1] > 0 else np.zeros_like(fr)

            for t in range(20):
                rows.append({
                    'profile_id':       pid,
                    'city':             spec['city'],
                    'scenario':         sc,
                    't':                t + 1,
                    'mean_loss':        round(float(L_t[t]),   4),
                    'p99_brut':         round(float(P99_t[t]), 4),
                    'p99_theta':        round(float(P99t_t[t]), 4),
                    'tail_ratio':       round(float(P99_t[t] / L_t[t]), 4) if L_t[t] > 0 else 0.0,
                    'var_tau':          round(float(vt[t]),    6),
                    'h_bar':            round(float(hb[t]),    6),
                    'follow_rate':      round(float(fr[t]),    6),
                    'c_excess':         round(float(ce[t]),    6),
                    'var_tau_norm':     round(float(vt_norm[t]), 6),
                    'h_bar_norm':       round(float(hb_norm[t]), 6),
                    'follow_rate_norm': round(float(fr_norm[t]), 6),
                })

    df = pd.DataFrame(rows)

    # Validation: P3 Paris G0 at t=20
    p3g0t20 = df[(df.profile_id == 'P3') & (df.scenario == 'G0') & (df.t == 20)].iloc[0]
    p3g0t1  = df[(df.profile_id == 'P3') & (df.scenario == 'G0') & (df.t == 1)].iloc[0]
    vt_drop = (p3g0t20.var_tau - p3g0t1.var_tau) / p3g0t1.var_tau * 100
    print(f"\n  P3 Paris G0 at t=20:")
    print(f"    var_tau={p3g0t20.var_tau:.4f}  (t=1: {p3g0t1.var_tau:.4f}, drop={vt_drop:.0f}%, ref ~-30%)")
    print(f"    h_bar={p3g0t20.h_bar:.4f}  c_excess={p3g0t20.c_excess:.4f}  (ref c_excess ~0.064)")
    df.to_csv(DATA_APP / 'trajectories_by_profile_b030.csv', index=False)

    # Validation: mean_loss and p99_theta at t=20 (output not applicable for per-quarter)
    p3g0_t20 = df[(df.profile_id == 'P3') & (df.scenario == 'G0') & (df.t == 20)].iloc[0]
    err_el  = abs(p3g0_t20.mean_loss  - 480.8) / 480.8
    err_p99 = abs(p3g0_t20.p99_theta  - 2041.0) / 2041.0
    print(f"  P3 G0 t=20 validation: E[L]={p3g0_t20.mean_loss:.1f} (err={err_el:.1%}) | P99xtheta={p3g0_t20.p99_theta:.1f} (err={err_p99:.1%})")

    print(f"\n  [OK] RUN 4 saved: {len(df)} rows -> outputs/trajectories_by_profile_b030.csv  (expected 640)\n")
    return df


# ---------------------------------------------------------------------------
# RUN 5 -- heatmap_alpha_pi_b030.csv (~119 rows)
# ---------------------------------------------------------------------------

ALPHAS = [0.10, 0.20, 0.30, 0.45, 0.60, 0.70, 0.85, 0.95]
EPIS   = [0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 0.90]


def _central_spec_variant(alpha, epi):
    s = copy.deepcopy(CENTRAL_SPEC)
    s['params']['alpha'] = alpha
    s['params']['a_pi']  = round(epi * 10, 4)
    s['params']['b_pi']  = round((1 - epi) * 10, 4)
    return s


def run5_heatmap(M=200, seed=5000):
    print("=" * 60)
    print(f"RUN 5 -- heatmap_alpha_pi_b030.csv  (M={M})")
    rows = []

    # Baseline rows: alpha-independent (run once per E[pi] with alpha=0.70)
    print("  Baseline rows (7 x alpha=0.70)...")
    bl_p99t_by_epi = {}
    for epi in EPIS:
        arrs = _sim(_central_spec_variant(0.70, epi), 'baseline', M=M, seed=seed)
        el, p99b, p99t, out = _metrics(arrs, 'baseline')
        bl_p99t_by_epi[epi] = p99t
        rows.append({
            'alpha': 0.70, 'epi_mean': epi, 'scenario': 'baseline',
            'p99_brut': round(p99b, 4), 'p99_theta': round(p99t, 4),
            'mean_loss': round(el, 4), 'output_mean': round(out, 4),
            'premium_pct': 0.0,
        })

    # G0 + G2 full grid: 8alpha x 7E[pi]
    total = len(ALPHAS) * len(EPIS) * 2
    done  = 0
    for sc in ['G0', 'G2']:
        for alpha in ALPHAS:
            for epi in EPIS:
                done += 1
                if done % 20 == 0:
                    print(f"  Grid progress: {done}/{total}")
                spec = _central_spec_variant(alpha, epi)
                arrs = _sim(spec, sc, M=M, seed=seed)
                el, p99b, p99t, out = _metrics(arrs, sc)
                bl_ref = bl_p99t_by_epi[epi]
                prem = (p99t / bl_ref - 1) * 100 if bl_ref > 0 else 0.0
                rows.append({
                    'alpha': alpha, 'epi_mean': epi, 'scenario': sc,
                    'p99_brut': round(p99b, 4), 'p99_theta': round(p99t, 4),
                    'mean_loss': round(el, 4), 'output_mean': round(out, 4),
                    'premium_pct': round(prem, 4),
                })

    df = pd.DataFrame(rows)

    # Validation: alpha=0.70, epi=0.70, G0 -> p99_theta ~ 2135
    ck = df[(df.alpha == 0.70) & (df.epi_mean == 0.70) & (df.scenario == 'G0')].iloc[0]
    err = abs(ck.p99_theta - 2135) / 2135
    st  = '[OK]' if err < 0.02 else '[WARN]'
    print(f"\n  Central check (alpha=0.70, E[pi]=0.70, G0): p99_theta={ck.p99_theta:.0f}  err={err:.1%}  {st}")

    df.to_csv(DATA_APP / 'heatmap_alpha_pi_b030.csv', index=False)
    print(f"\n  [OK] RUN 5 saved: {len(df)} rows -> outputs/heatmap_alpha_pi_b030.csv  (expected 119)\n")
    return df


# ---------------------------------------------------------------------------
# RUN 6 -- sweep_dimensions.csv (5 rows)
# ---------------------------------------------------------------------------

def run6_sweep_dimensions(M=200, seed=5000):
    print("=" * 60)
    print(f"RUN 6 -- sweep_dimensions.csv  (M={M})")

    # P3 Paris central reference
    arrs_central = _sim(PROFILES_V11['P3'], 'G0', M=M, seed=seed)
    _, _, central_p99, _ = _metrics(arrs_central, 'G0')
    print(f"  P3 Paris central G0: p99_theta = {central_p99:.1f}  (ref ~2041)")

    # Base params for all sweeps: P3 Paris
    BASE_P3 = dict(
        a_pi=5.5, b_pi=4.5, alpha=0.90,
        tau_alpha0=4.0, tau_beta0=4.0,
        H_LO=0.65, H_HI=0.95, eta=0.02,
        **COUPLED
    )

    def _p3_spec_with(**overrides):
        s = copy.deepcopy(PROFILES_V11['P3'])
        s['params'].update(overrides)
        return s

    sweeps = [
        ('alpha',   'alpha',                  0.30, 0.90,
         {},                                  {}),
        ('epi',     'E[pi]',                  0.40, 0.80,
         {'a_pi': 4.0, 'b_pi': 6.0},          {'a_pi': 8.0, 'b_pi': 2.0}),
        ('beta_a',  'tau (homogeneity)',       1.5,  4.5,
         {'tau_alpha0': 1.5, 'tau_beta0': 1.5}, {'tau_alpha0': 4.5, 'tau_beta0': 4.5}),
        ('h_range', 'h range',                None, None,
         {'H_LO': 0.40, 'H_HI': 0.70},       {'H_LO': 0.70, 'H_HI': 0.95}),
        ('eta',     'eta (deskilling)',        0.00, 0.04,
         {'eta': 0.00},                        {'eta': 0.04}),
    ]

    rows = []
    for dim, label, lo_val, hi_val, lo_override, hi_override in sweeps:
        print(f"  Sweep: {dim}...")
        spec_lo = _p3_spec_with(**lo_override) if dim != 'alpha' else _p3_spec_with(alpha=0.30)
        spec_hi = _p3_spec_with(**hi_override) if dim != 'alpha' else _p3_spec_with(alpha=0.90)
        if dim == 'epi':
            spec_lo = _p3_spec_with(a_pi=4.0, b_pi=6.0)
            spec_hi = _p3_spec_with(a_pi=8.0, b_pi=2.0)
        elif dim == 'beta_a':
            spec_lo = _p3_spec_with(tau_alpha0=1.5, tau_beta0=1.5)
            spec_hi = _p3_spec_with(tau_alpha0=4.5, tau_beta0=4.5)
        elif dim == 'h_range':
            spec_lo = _p3_spec_with(H_LO=0.40, H_HI=0.70)
            spec_hi = _p3_spec_with(H_LO=0.70, H_HI=0.95)
        elif dim == 'eta':
            spec_lo = _p3_spec_with(eta=0.00)
            spec_hi = _p3_spec_with(eta=0.04)

        arrs_lo = _sim(spec_lo, 'G0', M=M, seed=seed)
        arrs_hi = _sim(spec_hi, 'G0', M=M, seed=seed)
        _, _, p99_lo, _ = _metrics(arrs_lo, 'G0')
        _, _, p99_hi, _ = _metrics(arrs_hi, 'G0')
        range_pct = (abs(p99_hi - p99_lo) / central_p99) * 100

        param_lo_str = str(lo_val) if lo_val is not None else str(lo_override)
        param_hi_str = str(hi_val) if hi_val is not None else str(hi_override)

        rows.append({
            'dimension':   dim,
            'param_lo':    param_lo_str,
            'param_hi':    param_hi_str,
            'p99_at_lo':   round(p99_lo, 1),
            'p99_at_hi':   round(p99_hi, 1),
            'central_p99': round(central_p99, 1),
            'range_pct':   round(range_pct, 2),
            'scenario':    'G0',
        })
        print(f"    lo={p99_lo:.0f}  hi={p99_hi:.0f}  range={range_pct:.1f}%")

    df = pd.DataFrame(rows)
    df_sorted = df.sort_values('range_pct', ascending=False)
    print(f"\n  Dimension ranking by range_pct:\n{df_sorted[['dimension','range_pct']].to_string(index=False)}")
    print(f"  (Expected order: alpha > epi > beta_a > h_range > eta)")

    df.to_csv(DATA_APP / 'sweep_dimensions.csv', index=False)
    print(f"\n  [OK] RUN 6 saved: {len(df)} rows -> outputs/sweep_dimensions.csv\n")
    return df


# ---------------------------------------------------------------------------
# RUN 7 -- Three profile CSVs
# ---------------------------------------------------------------------------

def run7_profiles(M=200, seed=5000):
    print("=" * 60)
    print(f"RUN 7 -- Three profile CSVs  (M={M})")

    # Cache all 8x4 simulations
    arrs_cache = {}
    for pid, spec in PROFILES_V11.items():
        for sc in ['baseline', 'G0', 'G1', 'G2']:
            print(f"  Simulating {pid} {sc}...")
            arrs_cache[(pid, sc)] = _sim(spec, sc, M=M, seed=seed)

    # --- sweep_profiles_v3_b030.csv (32 rows) ---
    sweep_rows = []
    for pid, spec in PROFILES_V11.items():
        arrs_bl  = arrs_cache[(pid, 'baseline')]
        arrs_g0  = arrs_cache[(pid, 'G0')]
        arrs_g2  = arrs_cache[(pid, 'G2')]
        sb = _scaffold_benefit_from_arrs(arrs_g0, arrs_g2, arrs_bl, spec)
        for sc in ['baseline', 'G0', 'G1', 'G2']:
            arrs = arrs_cache[(pid, sc)]
            el, p99b, p99t, out = _metrics(arrs, sc, spec)
            sweep_rows.append({
                'profile_id':      pid,
                'city':            spec['city'],
                'color':           PROFILE_COLORS[pid],
                'scenario':        sc,
                'p99_theta':       round(p99t, 4),
                'p99_brut':        round(p99b, 4),
                'output_mean':     round(out, 4),
                'mean_loss':       round(el, 4),
                'scaffold_benefit': round(sb, 6),
            })

    sweep_df = pd.DataFrame(sweep_rows)
    sweep_df.to_csv(DATA_APP / 'sweep_profiles_v3_b030.csv', index=False)
    print(f"\n  [OK] sweep_profiles_v3_b030.csv: {len(sweep_df)} rows")

    # --- scatter_profiles_b030.csv (32 rows) ---
    scatter_rows = []
    for pid, spec in PROFILES_V11.items():
        arrs_bl = arrs_cache[(pid, 'baseline')]
        arrs_g0 = arrs_cache[(pid, 'G0')]
        arrs_g2 = arrs_cache[(pid, 'G2')]
        sb = _scaffold_benefit_from_arrs(arrs_g0, arrs_g2, arrs_bl, spec)
        _, p99b_bl, p99t_bl, out_bl = _metrics(arrs_bl, 'baseline', spec)
        for sc in ['baseline', 'G0', 'G1', 'G2']:
            arrs = arrs_cache[(pid, sc)]
            el, p99b, p99t, out = _metrics(arrs, sc, spec)
            tail_ratio = p99b / el if el > 0 else 0.0
            premium_pct = (p99t / p99t_bl - 1) * 100 if p99t_bl > 0 else 0.0
            scatter_rows.append({
                'profile_id':       pid,
                'scenario':         sc,
                'p99_theta':        round(p99t, 4),
                'output_mean':      round(out, 4),
                'mean_loss':        round(el, 4),
                'tail_ratio':       round(tail_ratio, 4),
                'scaffold_benefit': round(sb, 6),
                'premium_pct':      round(premium_pct, 4),
                'city':             spec['city'],
                'sector':           spec['sector'],
                'counterproductive': pid in COUNTERPRODUCTIVE,
            })

    scatter_df = pd.DataFrame(scatter_rows)
    scatter_df.to_csv(DATA_APP / 'scatter_profiles_b030.csv', index=False)
    print(f"  [OK] scatter_profiles_b030.csv: {len(scatter_df)} rows")

    # --- profile_summary_v3_b030.csv (8 rows) ---
    summary_rows = []
    for pid, spec in PROFILES_V11.items():
        arrs_bl = arrs_cache[(pid, 'baseline')]
        arrs_g0 = arrs_cache[(pid, 'G0')]
        arrs_g1 = arrs_cache[(pid, 'G1')]
        arrs_g2 = arrs_cache[(pid, 'G2')]

        el_bl, p99b_bl, p99t_bl, out_bl = _metrics(arrs_bl, 'baseline', spec)
        el_g0, p99b_g0, p99t_g0, out_g0 = _metrics(arrs_g0, 'G0',       spec)
        el_g1, p99b_g1, p99t_g1, out_g1 = _metrics(arrs_g1, 'G1',       spec)
        el_g2, p99b_g2, p99t_g2, out_g2 = _metrics(arrs_g2, 'G2',       spec)

        gain_g0 = (out_g0 - out_bl) / out_bl * 100
        gain_g2 = (out_g2 - out_bl) / out_bl * 100
        prem_g0 = (p99b_g0 / p99b_bl - 1) * 100  # raw P99_L ratio, no theta
        prem_g2 = (p99b_g2 / p99b_bl - 1) * 100
        ratio_g0 = gain_g0 / prem_g0 if prem_g0 != 0 else 0.0
        ratio_g2 = gain_g2 / prem_g2 if prem_g2 != 0 else 0.0
        sb = (ratio_g2 - ratio_g0) / ratio_g0 if ratio_g0 != 0 else 0.0

        p0_eff_g0 = float(arrs_g0['p0_eff_mean'].mean())

        summary_rows.append({
            'profile_id':     pid,
            'city':           spec['city'],
            'sector':         spec['sector'],
            'E_L_baseline':   round(el_bl,   4),
            'E_L_G0':         round(el_g0,   4),
            'P99_baseline':   round(p99b_bl, 4),
            'P99_G0':         round(p99b_g0, 4),
            'P99_G1':         round(p99b_g1, 4),
            'P99_G2':         round(p99b_g2, 4),
            'P99xtheta_G0':   round(p99t_g0, 4),
            'P99xtheta_G1':   round(p99t_g1, 4),
            'P99xtheta_G2':   round(p99t_g2, 4),
            'Output_baseline': round(out_bl, 4),
            'Output_G0':      round(out_g0,  4),
            'Output_G1':      round(out_g1,  4),
            'Output_G2':      round(out_g2,  4),
            'premium_G0_pct': round(prem_g0, 4),
            'premium_G2_pct': round(prem_g2, 4),
            'ratio_G0':       round(ratio_g0, 6),
            'ratio_G2':       round(ratio_g2, 6),
            'scaffold_benefit': round(sb, 6),
            'p0_eff_mean_G0': round(p0_eff_g0, 6),
        })

    summary_df = pd.DataFrame(summary_rows)
    summary_df.to_csv(DATA_APP / 'profile_summary_v3_b030.csv', index=False)
    print(f"  [OK] profile_summary_v3_b030.csv: {len(summary_df)} rows")

    # Validation P3 Paris
    p3 = summary_df[summary_df.profile_id == 'P3'].iloc[0]
    _print_validation('P3 Paris G0', p3.E_L_G0, 480.8, p3.P99xtheta_G0, 2041.0, p3.Output_G0, 1899.0)

    # Print scaffold_benefit table
    print("\n  Scaffold benefit summary:")
    for _, row in summary_df.iterrows():
        sign = '+' if row.scaffold_benefit >= 0 else ''
        print(f"    {row.profile_id} {row.city}: {sign}{row.scaffold_benefit*100:.0f}%")
    print(f"\n  [OK] RUN 7 saved: 3 CSVs in outputs/\n")
    return summary_df


# ---------------------------------------------------------------------------
# RUN 8 -- Correlation grids (Sprint 3)
# ---------------------------------------------------------------------------

def run8_correlation_grids():
    print("=" * 60)
    print("RUN 8 -- Correlation grids for P3 Paris")
    p3_spec = PROFILES_V11['P3']

    for quarter_type, seed in [('good', 42), ('bad', 99)]:
        print(f"  Simulating P3 Paris G0 with seed={seed} (store_errors=True)...")
        result = _sim_full(
            p3_spec, 'G0', M=1, seed=seed,
            store_errors=True, one_rep_only=True
        )
        errs = result['quarter_errors'][0]   # list of T=20 quarters, each (N, K)
        L_by_quarter = [e.sum() for e in errs]

        if quarter_type == 'good':
            q_idx = int(np.argmin(L_by_quarter))
        else:
            q_idx = int(np.argmax(L_by_quarter))

        err_matrix = errs[q_idx].astype(int)   # shape (N, K) = (200, 10)
        N, K = err_matrix.shape
        total_errors = err_matrix.sum()
        print(f"  Selected quarter t={q_idx+1} ({quarter_type}): {total_errors}/{N*K} errors")

        rows = []
        for agent_id in range(N):
            for dec_id in range(K):
                rows.append({
                    'agent_id':       agent_id,
                    'decision_id':    dec_id,
                    'error':          int(err_matrix[agent_id, dec_id]),
                    'quarter_type':   quarter_type,
                    'quarter_t':      q_idx + 1,
                    'replication_id': 0,
                })

        df = pd.DataFrame(rows)
        fname = DATA_APP / f'correlation_grid_P3_{quarter_type}.csv'
        df.to_csv(fname, index=False)
        print(f"  [OK] {fname.name}: {len(df)} rows")

        # Verify bad quarter has high column-wise correlation (>=3 cols with >150 errors)
        if quarter_type == 'bad':
            col_sums = err_matrix.sum(axis=0)
            dominant_cols = (col_sums > 150).sum()
            print(f"  Columns with >150/200 errors: {dominant_cols}  (target >= 3)")

    print()


# ---------------------------------------------------------------------------
# RUN 9 -- ten_replications_P3_G0.csv (Sprint 3)
# ---------------------------------------------------------------------------

def run9_ten_replications(M=200, seed=5000):
    print("=" * 60)
    print(f"RUN 9 -- ten_replications_P3_G0.csv  (M={M})")
    p3_spec = PROFILES_V11['P3']
    result = _sim_full(p3_spec, 'G0', M=M, seed=seed, store_errors=True)
    arrs = result['arrays']
    qe   = result['quarter_errors']   # list of M replications

    # Count crises per replication from is_crisis (use L>threshold as proxy)
    # Use p_crisis threshold: any quarter where the replication's L exceeds the 85th percentile
    # is considered "crisis-like". Or use the store_errors data to count high-loss quarters.
    # Simpler: flag quarters as crisis if L > 1.5 x mean_L
    mean_L_total = float(arrs['L'].mean())
    crisis_threshold = mean_L_total * 1.5

    selected = []
    for m in range(M):
        L_rep = arrs['L'][m, :]   # shape (T,)
        n_crisis = int((L_rep > crisis_threshold).sum())
        if 1 <= n_crisis <= 3:
            selected.append(m)
    selected = selected[:10]
    print(f"  Found {len(selected)} replications with 1-3 crisis quarters")

    rows = []
    for rep_idx, m in enumerate(selected):
        L_rep = arrs['L'][m, :]
        for t in range(20):
            rows.append({
                'replication_id': rep_idx + 1,
                'original_m':     m,
                't':              t + 1,
                'total_loss':     round(float(L_rep[t]), 4),
                'is_crisis':      int(L_rep[t] > crisis_threshold),
            })

    df = pd.DataFrame(rows)
    df.to_csv(DATA_APP / 'ten_replications_P3_G0.csv', index=False)
    print(f"  [OK] RUN 9 saved: {len(df)} rows -> outputs/ten_replications_P3_G0.csv\n")
    return df


# ---------------------------------------------------------------------------
# Cross-CSV consistency checks
# ---------------------------------------------------------------------------

def cross_csv_checks():
    print("=" * 60)
    print("CROSS-CSV CONSISTENCY CHECKS")

    try:
        ablation  = pd.read_csv(DATA_APP / 'ablation_results.csv')
        histograms = pd.read_csv(DATA_APP / 'histograms_by_profile_b030.csv')
        sweep     = pd.read_csv(DATA_APP / 'sweep_profiles_v3_b030.csv')
        summary   = pd.read_csv(DATA_APP / 'profile_summary_v3_b030.csv')
        scatter   = pd.read_csv(DATA_APP / 'scatter_profiles_b030.csv')
        frontier  = pd.read_csv(DATA_APP / 'exhibit_2_frontier.csv')
    except FileNotFoundError as e:
        print(f"  Skipping: {e}")
        return

    tol = 0.02

    # Check 1: P3 Paris G0 p99_theta across files
    p3_abl  = ablation[(ablation.profile_id == 'P3') & (ablation.ablation == 'full')]['p99_theta'].values[0]
    p3_hist = histograms[(histograms.profile_id == 'P3') & (histograms.scenario == 'G0')]['p99_theta'].values[0]
    p3_swp  = sweep[(sweep.profile_id == 'P3') & (sweep.scenario == 'G0')]['p99_theta'].values[0]
    p3_sum  = summary[summary.profile_id == 'P3']['P99xtheta_G0'].values[0]
    ref_p3  = 2041.0
    print(f"\n  Check 1 -- P3 G0 p99_theta consistency (ref {ref_p3}):")
    for name, val in [('ablation', p3_abl), ('histograms', p3_hist), ('sweep', p3_swp), ('summary', p3_sum)]:
        err = abs(val - ref_p3) / ref_p3
        st  = '[OK]' if err < tol else '[WARN]'
        print(f"    {st} {name}: {val:.1f}  ({err:.1%})")

    # Check 2: scaffold_benefit consistency for P2 London
    p2_swp = sweep[(sweep.profile_id == 'P2') & (sweep.scenario == 'G0')]['scaffold_benefit'].values[0]
    p2_sum = summary[summary.profile_id == 'P2']['scaffold_benefit'].values[0]
    p2_sct = scatter[(scatter.profile_id == 'P2') & (scatter.scenario == 'G0')]['scaffold_benefit'].values[0]
    print(f"\n  Check 2 -- P2 London scaffold_benefit consistency:")
    print(f"    sweep: {p2_swp*100:+.1f}%  summary: {p2_sum*100:+.1f}%  scatter: {p2_sct*100:+.1f}%")
    print(f"    (All should be identical / NorthStar ref: +146%)")

    # Check 3: baseline p99_theta vs exhibit_2 baseline
    p3_hist_bl = histograms[(histograms.profile_id == 'P3') & (histograms.scenario == 'baseline')]['p99_theta'].values[0]
    ex2_bl = frontier[frontier.scenario == 'baseline']['p99_theta'].values[0]
    print(f"\n  Check 3 -- Baseline P99xtheta (P3 hist={p3_hist_bl:.0f} vs central frontier={ex2_bl:.0f})")
    print(f"    (Different profiles so values differ -- informational only)")

    print()


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

if __name__ == '__main__':
    print("\n" + "=" * 60)
    print(" GENERATE CSV SUITE -- The Flattening NorthStar v11")
    print("=" * 60 + "\n")

    step0_validate_params()
    step0bis_quick_validation(M=50)

    # Sprint 1 -- blocking
    print("\n### SPRINT 1 -- BLOCKING ###\n")
    run1_ablation(M=200)
    run2_frontier(M=1000)

    # Sprint 2
    print("\n### SPRINT 2 ###\n")
    run3_histograms(M_hist=500, M_met=200)
    run4_trajectories(M=200)
    run5_heatmap(M=200)
    run6_sweep_dimensions(M=200)
    run7_profiles(M=200)

    # Sprint 3
    print("\n### SPRINT 3 ###\n")
    run8_correlation_grids()
    run9_ten_replications(M=200)

    # Cross-CSV consistency
    cross_csv_checks()

    print("\n" + "=" * 60)
    print(" ALL DONE -- check outputs/ for all CSVs")
    print("=" * 60)
