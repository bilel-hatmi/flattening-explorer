"""
make_appendix_figures.py — Appendix figures A1–A5 for "The Flattening".

A1: Three channels in dynamics (var_tau, h_bar, C_excess) — CENTRAL, G0 vs G2
A2: Tornado sensitivity chart — P99×theta under G0
A3: Heatmap ablation 8 profiles × 4 scenarios
A4: Early vs Late governance — var_tau trajectories
A5: Scaffold benefit bar chart
"""
import sys, os, copy
os.environ.setdefault('PYTHONIOENCODING', 'utf-8')
if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

from pathlib import Path
import numpy as np, pandas as pd

WORKSPACE = Path(__file__).resolve().parent
sys.path.insert(0, str(WORKSPACE))

from flattening_v5 import simulate_profile_scenario

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.ticker as ticker
import matplotlib.colors as mcolors
from matplotlib.patches import FancyArrowPatch

OUTDIR = WORKSPACE / 'exhibits'
OUTDIR.mkdir(exist_ok=True)

plt.rcParams.update({
    'font.family': 'serif', 'font.size': 10, 'axes.labelsize': 11,
    'axes.titlesize': 12, 'legend.fontsize': 9,
    'figure.dpi': 300, 'savefig.dpi': 300, 'savefig.bbox': 'tight',
    'axes.spines.top': False, 'axes.spines.right': False,
})

# ── Palette ──────────────────────────────────────────────────────────────────
C_G0   = '#B71C1C'   # bordeaux-red
C_G2   = '#2E7D32'   # dark green
C_LATE = '#E65100'   # amber/orange (G2 Late — Figure A4)
C_BASE = '#9E9E9E'   # grey

COUPLED = {'sigma_normal': 0.25, 'mu_crisis': 2.2, 'sigma_crisis': 0.3, 'kappa_normal': 60}

CENTRAL_SPEC = {
    'profile_label': 'central', 'description': '', 'geographies': '', 'label_short': '',
    'params': {
        'a_pi': 7.0, 'b_pi': 3.0, 'alpha': 0.70,
        'tau_alpha0': 2.0, 'tau_beta0': 2.0,
        'H_LO': 0.40, 'H_HI': 0.80, 'eta': 0.02, **COUPLED,
    },
    'scenario_overrides': {},
}

PROFILE_NAMES = {
    1: 'Big Four audit (Frankfurt)',
    2: 'Investment bank (London)',
    3: 'Strategy consulting (Paris)',
    4: 'Corporate legal (Brussels)',
    5: 'Tech startup (SF)',
    6: 'Creative agency (Singapore)',
    7: 'Back-office (Bangalore)',
    8: 'Central admin (Seoul/Tokyo/Paris)',
}


def _sim_central(scenario, M=200, seed=5000):
    return simulate_profile_scenario(CENTRAL_SPEC, scenario, M=M, base_seed=seed)['arrays']


def _series(arr, M=200):
    """(mean, 95%-CI half-width) across M replications, per quarter."""
    mean = arr.mean(axis=0)
    ci   = 1.96 * arr.std(axis=0) / np.sqrt(M)
    return mean, ci


# ═══════════════════════════════════════════════════════════════════════════════
# FIGURE A1 — Three channels in dynamics
# ═══════════════════════════════════════════════════════════════════════════════

def make_fig_a1():
    print('[Figure A1] Three-channel dynamics (M=200)...')
    arrs_g0 = _sim_central('G0')
    arrs_g2 = _sim_central('G2')
    M = 200
    ts = np.arange(1, 21)

    vt_g0, _ = _series(arrs_g0['var_tau'],        M)
    vt_g2, _ = _series(arrs_g2['var_tau'],        M)
    hb_g0, _ = _series(arrs_g0['h_bar'],          M)
    hb_g2, _ = _series(arrs_g2['h_bar'],          M)
    ce_g0, _ = _series(arrs_g0['excess_coerror'], M)
    ce_g2, _ = _series(arrs_g2['excess_coerror'], M)

    pct_vt = 100.0 * (vt_g0[-1] - vt_g0[0]) / (vt_g0[0] + 1e-12)
    pct_hb = 100.0 * (hb_g0[-1] - hb_g0[0]) / (hb_g0[0] + 1e-12)
    pct_ce = 100.0 * (ce_g0[-1] - ce_g0[0])  / (ce_g0[0]  + 1e-12)

    print(f'  Var(tau) G0: t=1={vt_g0[0]:.5f} -> t=20={vt_g0[-1]:.5f}  ({pct_vt:+.1f}%)')
    print(f'  h_bar    G0: t=1={hb_g0[0]:.4f} -> t=20={hb_g0[-1]:.4f}  ({pct_hb:+.1f}%)')
    print(f'  C_excess G0: t=1={ce_g0[0]:.5f} -> t=20={ce_g0[-1]:.5f}  ({pct_ce:+.1f}%)')

    print(f'\n  {"t":>3}  {"vt_G0":>9}  {"vt_G2":>9}  {"hb_G0":>8}  {"hb_G2":>8}  '
          f'{"ce_G0":>9}  {"ce_G2":>9}')
    for i, t in enumerate(ts):
        print(f'  {t:>3}  {vt_g0[i]:>9.5f}  {vt_g2[i]:>9.5f}  '
              f'{hb_g0[i]:>8.4f}  {hb_g2[i]:>8.4f}  '
              f'{ce_g0[i]:>9.5f}  {ce_g2[i]:>9.5f}')

    fig, axes = plt.subplots(3, 1, figsize=(9, 11), sharex=True)
    ax1, ax2, ax3 = axes
    fig.subplots_adjust(hspace=0.22)

    # ── Panel 1: Var(tau) ──
    ax1.plot(ts, vt_g0, color=C_G0, lw=2.0, label='G0 — Unmanaged AI')
    ax1.plot(ts, vt_g2, color=C_G2, lw=2.0, label='G2 — Active governance')
    ax1.set_ylabel('Cognitive diversity  Var(\u03c4\u209c)', fontsize=10)
    # Annotation: text left of T=20, between curves, arrow to G0 endpoint
    ax1.annotate(f'{pct_vt:.0f}% under G0',
                 xy=(20, vt_g0[-1]), xycoords='data',
                 xytext=(0.55, 0.30), textcoords='axes fraction',
                 fontsize=9, color=C_G0, ha='center',
                 arrowprops=dict(arrowstyle='->', color=C_G0, lw=1.0,
                                 connectionstyle='arc3,rad=0.0'))
    ax1.legend(fontsize=9, framealpha=0.9, edgecolor='#DDD', loc='upper right')
    ax1.spines['top'].set_visible(False)
    ax1.spines['right'].set_visible(False)

    # ── Panel 2: h_bar ──
    ax2.plot(ts, hb_g0, color=C_G0, lw=2.0)
    ax2.plot(ts, hb_g2, color=C_G2, lw=2.0)
    ax2.set_ylabel('Mean human competence  \u0127\u0304(t)', fontsize=10)
    ax2.annotate(f'{pct_hb:.0f}% under G0',
                 xy=(20, hb_g0[-1]), xycoords='data',
                 xytext=(0.60, 0.22), textcoords='axes fraction',
                 fontsize=9, color=C_G0, ha='center',
                 arrowprops=dict(arrowstyle='->', color=C_G0, lw=1.0,
                                 connectionstyle='arc3,rad=-0.15'))
    ax2.spines['top'].set_visible(False)
    ax2.spines['right'].set_visible(False)

    # ── Panel 3: C_excess ──
    ax3.plot(ts, ce_g0, color=C_G0, lw=2.0)
    ax3.plot(ts, ce_g2, color=C_G2, lw=2.0)
    ax3.set_ylabel('Error correlation excess  (C_excess)', fontsize=10)
    ax3.set_xlabel('Quarter  (t)', fontsize=10)
    ax3.annotate(f'+{pct_ce:.0f}% under G0',
                 xy=(20, ce_g0[-1]), xycoords='data',
                 xytext=(0.60, 0.78), textcoords='axes fraction',
                 fontsize=9, color=C_G0, ha='center',
                 arrowprops=dict(arrowstyle='->', color=C_G0, lw=1.0,
                                 connectionstyle='arc3,rad=0.15'))
    ax3.spines['top'].set_visible(False)
    ax3.spines['right'].set_visible(False)

    ax3.xaxis.set_major_locator(ticker.MultipleLocator(4))
    ax3.xaxis.set_minor_locator(ticker.MultipleLocator(1))
    ax3.set_xlim(0.5, 20.5)

    fig.savefig(OUTDIR / 'fig_a1.pdf')
    fig.savefig(OUTDIR / 'fig_a1.png')
    plt.close(fig)
    print('  fig_a1 saved')
    return True


# ═══════════════════════════════════════════════════════════════════════════════
# FIGURE A2 — Tornado sensitivity chart
# ═══════════════════════════════════════════════════════════════════════════════

SENSITIVITY_PARAMS = {
    r'$\alpha$':         [('alpha',       0.30), ('alpha',       1.00)],
    r'$p_{\rm crisis}$': [('p_crisis',    0.05), ('p_crisis',    0.12)],
    r'$\mu_{\rm crisis}$': [('mu_crisis', 1.50), ('mu_crisis',   2.50)],
    r'$\beta_{\rm conform}$': [('beta_conform', 0.15), ('beta_conform', 0.35)],
    r'$\eta$':           [('eta',         0.01), ('eta',         0.04)],
}
ALPHA_KEY = r'$\alpha$'


def _p99t_central(spec_mod):
    arrs = simulate_profile_scenario(spec_mod, 'G0', M=200, base_seed=5000)['arrays']
    return float(np.percentile(arrs['L'].reshape(-1), 99)) * 1.25


def make_fig_a2():
    print('[Figure A2] Tornado sensitivity chart (M=200, 11 runs)...')
    # Central reference
    central_val = _p99t_central(CENTRAL_SPEC)
    print(f'  Central P99*theta = {central_val:.1f}')

    results = {}
    for label, pairs in SENSITIVITY_PARAMS.items():
        lo_key, lo_val = pairs[0]
        hi_key, hi_val = pairs[1]
        spec_lo = copy.deepcopy(CENTRAL_SPEC)
        spec_lo['params'][lo_key] = lo_val
        spec_hi = copy.deepcopy(CENTRAL_SPEC)
        spec_hi['params'][hi_key] = hi_val
        p99_lo = _p99t_central(spec_lo)
        p99_hi = _p99t_central(spec_hi)
        results[label] = (p99_lo, p99_hi, lo_val, hi_val)
        print(f'  {label:30s} lo={lo_val} -> {p99_lo:.1f}   hi={hi_val} -> {p99_hi:.1f}')

    # Sort by max absolute deviation from central
    order = sorted(results.keys(),
                   key=lambda k: max(abs(results[k][0] - central_val),
                                     abs(results[k][1] - central_val)),
                   reverse=True)

    fig, ax = plt.subplots(figsize=(8.5, 5))
    bar_h = 0.55
    bar_color = '#546E7A'
    y_positions = {label: i for i, label in enumerate(reversed(order))}

    for label in order:
        p99_lo, p99_hi, lo_val, hi_val = results[label]
        y = y_positions[label]
        left  = min(p99_lo, central_val)
        right = max(p99_hi, central_val)
        # Low-value bar (left of center)
        ax.barh(y, p99_lo - central_val, left=central_val, height=bar_h,
                color=bar_color, alpha=0.85, zorder=3)
        # High-value bar (right of center)
        ax.barh(y, p99_hi - central_val, left=central_val, height=bar_h,
                color=bar_color, alpha=0.85, zorder=3)
        # Numeric annotations at bar ends
        offset = 12
        ax.annotate(f'{p99_lo:.0f}',
                    xy=(p99_lo, y), xytext=(-offset, 0), textcoords='offset points',
                    fontsize=7.5, ha='right', va='center', color='#333')
        ax.annotate(f'{p99_hi:.0f}',
                    xy=(p99_hi, y), xytext=(offset, 0), textcoords='offset points',
                    fontsize=7.5, ha='left', va='center', color='#333')
        # "dominant lever" — placed above the alpha bar with an arrow, well clear of numerics
        if label == ALPHA_KEY:
            ax.annotate('dominant lever',
                        xy=(p99_hi, y),
                        xytext=(p99_hi - 60, y + 1.05),
                        fontsize=8.5, fontstyle='italic', color='#37474F',
                        ha='center', va='bottom',
                        arrowprops=dict(arrowstyle='->', color='#37474F',
                                        lw=0.9, connectionstyle='arc3,rad=0.25'))

    ax.axvline(central_val, color='#333', lw=1.5, zorder=4)
    ax.text(central_val, len(order) - 0.05, f'{central_val:.0f}',
            fontsize=8, ha='center', va='bottom', color='#333')

    ax.set_yticks(list(y_positions.values()))
    ax.set_yticklabels([lbl for lbl in reversed(order)], fontsize=10)
    ax.set_xlabel('P99\u00d7\u03b8  under G0', fontsize=10)
    ax.set_xlim(min(v[0] for v in results.values()) - 150,
                max(v[1] for v in results.values()) + 200)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_visible(False)
    ax.tick_params(left=False)

    fig.savefig(OUTDIR / 'fig_a2.pdf')
    fig.savefig(OUTDIR / 'fig_a2.png')
    plt.close(fig)
    print('  fig_a2 saved')
    return True


# ═══════════════════════════════════════════════════════════════════════════════
# FIGURE A3 — Heatmap ablation 8 profiles × 4 scenarios
# ═══════════════════════════════════════════════════════════════════════════════

def make_fig_a3():
    print('[Figure A3] Heatmap 8 profiles x 4 scenarios...')
    sweep = pd.read_csv(WORKSPACE / 'data_app' / 'sweep_profiles_v3_b030.csv')
    summ  = pd.read_csv(WORKSPACE / 'data_reference' / 'profile_summary_v3_b030.csv')

    scenarios_order = ['baseline', 'G0', 'G1', 'G2']
    col_labels = ['Baseline', 'G0', 'G1', 'G2', 'Scaffold benefit']
    n_prof = 8

    # Build 8x4 matrix of P99_theta
    mat_risk = np.zeros((n_prof, 4))
    for i, pid in enumerate(range(1, 9)):
        for j, sc in enumerate(scenarios_order):
            row = sweep[(sweep.profile_num == pid) & (sweep.scenario == sc)]
            mat_risk[i, j] = float(row.P99_theta.values[0])

    # Scaffold benefit (already fractional in CSV)
    scaffold = summ.set_index('profile_num')['scaffold_benefit'].values  # shape (8,)
    scaffold_pct = scaffold * 100.0

    # Row labels
    row_labels = [PROFILE_NAMES[p] for p in range(1, 9)]

    fig, ax = plt.subplots(figsize=(11, 5.5))
    fig.subplots_adjust(left=0.28, right=0.97, top=0.92, bottom=0.12)

    # Normalise risk columns for color
    vmin_risk = mat_risk.min()
    vmax_risk = mat_risk.max()
    cmap_risk = plt.cm.Reds

    # Draw the 4 risk columns (cols 0–3)
    cell_w, cell_h = 1.0, 1.0
    gap = 0.35   # gap before scaffold column
    xs_risk = [0.5 + j * cell_w for j in range(4)]
    x_scaf  = xs_risk[-1] + cell_w + gap

    norm_risk = mcolors.Normalize(vmin=vmin_risk, vmax=vmax_risk)
    norm_scaf = mcolors.TwoSlopeNorm(vmin=min(scaffold_pct) - 5,
                                     vcenter=0,
                                     vmax=max(scaffold_pct) + 5)
    cmap_scaf = plt.cm.RdYlGn

    for i in range(n_prof):
        y_center = (n_prof - 1 - i) * cell_h + 0.5

        # Risk columns
        for j in range(4):
            val = mat_risk[i, j]
            color = cmap_risk(norm_risk(val))
            rect = plt.Rectangle((xs_risk[j] - 0.5, y_center - 0.5),
                                  cell_w, cell_h, color=color, zorder=2)
            ax.add_patch(rect)
            lum = 0.299*color[0] + 0.587*color[1] + 0.114*color[2]
            txt_color = 'white' if lum < 0.55 else '#222'
            ax.text(xs_risk[j], y_center, f'{val:.0f}',
                    ha='center', va='center', fontsize=8.5,
                    color=txt_color, fontweight='bold', zorder=3)

        # Scaffold column
        sv = scaffold_pct[i]
        color_s = cmap_scaf(norm_scaf(sv))
        rect_s = plt.Rectangle((x_scaf - 0.5, y_center - 0.5),
                                cell_w, cell_h, color=color_s, zorder=2)
        ax.add_patch(rect_s)
        lum_s = 0.299*color_s[0] + 0.587*color_s[1] + 0.114*color_s[2]
        txt_color_s = 'white' if lum_s < 0.55 else '#222'
        ax.text(x_scaf, y_center, f'{sv:+.0f}%',
                ha='center', va='center', fontsize=8.5,
                color=txt_color_s, fontweight='bold', zorder=3)

    # Separator line before scaffold column
    sep_x = x_scaf - 0.5 - gap * 0.5
    ax.axvline(sep_x, color='#666', lw=1.5, zorder=5, ymin=0.02, ymax=0.88)

    # Column headers
    for j, lbl in enumerate(col_labels[:4]):
        ax.text(xs_risk[j], n_prof + 0.15, lbl,
                ha='center', va='bottom', fontsize=9.5, fontweight='bold')
    ax.text(x_scaf, n_prof + 0.15, col_labels[4],
            ha='center', va='bottom', fontsize=9.5, fontweight='bold')

    # Row labels (profile names)
    for i, lbl in enumerate(row_labels):
        y_center = (n_prof - 1 - i) * cell_h + 0.5
        ax.text(-0.6, y_center, lbl, ha='right', va='center', fontsize=9)

    ax.set_xlim(-0.6, x_scaf + 0.55)
    ax.set_ylim(-0.55, n_prof + 0.6)
    ax.axis('off')

    fig.savefig(OUTDIR / 'fig_a3.pdf')
    fig.savefig(OUTDIR / 'fig_a3.png')
    plt.close(fig)
    print('  fig_a3 saved')
    return True


# ═══════════════════════════════════════════════════════════════════════════════
# FIGURE A4 — Early vs Late governance (var_tau trajectories)
# ═══════════════════════════════════════════════════════════════════════════════

def make_fig_a4():
    print('[Figure A4] Early vs Late governance (M=200)...')
    from run_temporal_analysis import simulate_hybrid

    arrs_early, _ = simulate_hybrid(CENTRAL_SPEC, transition_t=0,  M=200, base_seed=5000)
    arrs_late,  _ = simulate_hybrid(CENTRAL_SPEC, transition_t=10, M=200, base_seed=5000)
    arrs_never, _ = simulate_hybrid(CENTRAL_SPEC, transition_t=20, M=200, base_seed=5000)

    ts = np.arange(1, 21)
    vt_never = arrs_never['var_tau'].mean(axis=0)
    vt_early = arrs_early['var_tau'].mean(axis=0)
    vt_late  = arrs_late['var_tau'].mean(axis=0)

    pct_late_vs_never = 100.0 * (vt_late[-1] - vt_never[-1]) / (vt_never[-1] + 1e-12)
    pct_gap = 100.0 * (vt_early[-1] - vt_late[-1]) / (vt_early[0] + 1e-12)

    print(f'  G0/Never  T=20 Var(tau) = {vt_never[-1]:.5f}')
    print(f'  G2 Early  T=20 Var(tau) = {vt_early[-1]:.5f}')
    print(f'  G2 Late   T=20 Var(tau) = {vt_late[-1]:.5f}')
    print(f'  Late vs Never: {pct_late_vs_never:+.1f}%')
    print(f'  Gap (Early-Late)/Early[0]: {pct_gap:.1f}% diversity depleted')

    print(f'\n  {"t":>3}  {"Never":>9}  {"Early":>9}  {"Late":>9}')
    for i, t in enumerate(ts):
        print(f'  {t:>3}  {vt_never[i]:>9.5f}  {vt_early[i]:>9.5f}  {vt_late[i]:>9.5f}')

    fig, ax = plt.subplots(figsize=(9, 5))

    ax.plot(ts, vt_never, color=C_G0, lw=2.0, ls='-',  label='G0 — Unmanaged (Never)')
    ax.plot(ts, vt_early, color=C_G2, lw=2.0, ls='-',  label='G2 Early (governance from t=1)')
    ax.plot(ts, vt_late,  color=C_LATE, lw=2.0, ls='--', label='G2 Late (governance from t=11)')

    # Vertical dotted line at t=10
    ax.axvline(10, color='#9E9E9E', lw=1.2, ls=':', zorder=2)

    # "Governance adopted here" — via axes fraction so it stays above all curves
    ax.annotate('Governance adopted here',
                xy=(10, vt_early[9]), xycoords='data',
                xytext=(0.42, 0.97), textcoords='axes fraction',
                fontsize=8.5, ha='center', va='top', color='#555',
                arrowprops=dict(arrowstyle='->', color='#555', lw=1.0,
                                connectionstyle='arc3,rad=0.0'))

    # Annotation at T=20: Late vs Never — below the Late curve, clear of Never
    ax.annotate(f'{pct_late_vs_never:+.0f}% vs unmanaged',
                xy=(20, vt_late[-1]),
                xytext=(16.5, vt_late[-1] - 0.0030),
                fontsize=8.5, ha='center', color=C_LATE,
                arrowprops=dict(arrowstyle='->', color=C_LATE, lw=1.0))

    # Gap bracket — drawn as two horizontal tick marks + vertical line, with text
    y_early_t20 = vt_early[-1]
    y_late_t20  = vt_late[-1]
    x_brk = 21.2
    ax.annotate('', xy=(x_brk, y_early_t20), xytext=(x_brk, y_late_t20),
                arrowprops=dict(arrowstyle='<->', color='#444', lw=1.5,
                                mutation_scale=10))
    ax.text(x_brk + 0.3, (y_early_t20 + y_late_t20) / 2,
            f'Late governance:\n{pct_gap:.0f}% diversity\nalready depleted',
            fontsize=8.5, ha='left', va='center', color='#444', fontstyle='italic')

    ax.set_xlabel('Quarter  (t)', fontsize=10)
    ax.set_ylabel('Cognitive diversity  Var(\u03c4\u209c)', fontsize=10)
    ax.xaxis.set_major_locator(ticker.MultipleLocator(4))
    ax.xaxis.set_minor_locator(ticker.MultipleLocator(1))
    ax.set_xlim(0.5, 25)
    ax.legend(fontsize=9, framealpha=0.9, edgecolor='#DDD', loc='upper right')
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)

    fig.savefig(OUTDIR / 'fig_a4.pdf')
    fig.savefig(OUTDIR / 'fig_a4.png')
    plt.close(fig)
    print('  fig_a4 saved')
    return True


# ═══════════════════════════════════════════════════════════════════════════════
# FIGURE A5 — Scaffold benefit bar chart
# ═══════════════════════════════════════════════════════════════════════════════

def make_fig_a5():
    print('[Figure A5] Scaffold benefit bar chart...')
    summ = pd.read_csv(WORKSPACE / 'data_reference' / 'profile_summary_v3_b030.csv')
    summ = summ.sort_values('scaffold_benefit', ascending=False).reset_index(drop=True)

    labels = [PROFILE_NAMES[int(r.profile_num)] for _, r in summ.iterrows()]
    values = (summ['scaffold_benefit'] * 100.0).values  # in %

    fig, ax = plt.subplots(figsize=(9, 5))

    INSIDE_THRESH = 60   # if |val| > threshold, put label inside bar (white text)

    for i, (lbl, val) in enumerate(zip(labels, values)):
        color = '#2E7D32' if val >= 0 else '#B71C1C'
        ax.barh(i, val, color=color, alpha=0.80, height=0.65, zorder=3)

        if abs(val) > INSIDE_THRESH:
            # Label inside the bar — white text, centred
            ax.text(val / 2, i, f'{val:+.0f}%',
                    ha='center', va='center', fontsize=8.5,
                    color='white', fontweight='bold')
        else:
            # Label outside bar end
            ha   = 'left'  if val >= 0 else 'right'
            xoff = 3 if val >= 0 else -3
            ax.text(val + xoff, i, f'{val:+.0f}%',
                    ha=ha, va='center', fontsize=8.5, color='#222')

    ax.axvline(0, color='#222', lw=1.5, zorder=4)
    ax.set_yticks(range(len(labels)))
    ax.set_yticklabels(labels, fontsize=9)
    ax.invert_yaxis()   # highest positive (London) at top
    ax.set_xlabel('Scaffold benefit  (%)', fontsize=10)

    # Annotation — bottom right, well below all bars
    ax.text(0.98, 0.04,
            'Governance amplifies existing diversity\n\u2014 it cannot substitute for it',
            transform=ax.transAxes, fontsize=8.5, fontstyle='italic',
            color='#777', ha='right', va='bottom')

    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_visible(False)
    ax.tick_params(left=False)

    fig.savefig(OUTDIR / 'fig_a5.pdf')
    fig.savefig(OUTDIR / 'fig_a5.png')
    plt.close(fig)
    print('  fig_a5 saved')
    return True


# ═══════════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════════

if __name__ == '__main__':
    import time
    t0 = time.time()
    r1 = make_fig_a1()
    r2 = make_fig_a2()
    r3 = make_fig_a3()
    r4 = make_fig_a4()
    r5 = make_fig_a5()
    elapsed = time.time() - t0
    results = {f'A{i+1}': r for i, r in enumerate([r1, r2, r3, r4, r5])}
    summary = ', '.join(f'{k}={"PASS" if v else "FAIL"}' for k, v in results.items())
    print(f'\n{summary}  ({elapsed:.1f}s)')
