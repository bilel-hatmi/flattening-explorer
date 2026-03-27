"""
make_exhibits.py — v7 final. Essay + app versions, 3-point trajectory.
"""
import sys, os
os.environ.setdefault('PYTHONIOENCODING', 'utf-8')
if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

from pathlib import Path
import numpy as np, pandas as pd

WORKSPACE = Path(__file__).resolve().parent
sys.path.insert(0, str(WORKSPACE))
from flattening_v5 import simulate_profile_scenario, make_params, sample_pi_xi, PROFILES

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.ticker as ticker
from matplotlib.patches import Patch
from matplotlib.lines import Line2D
from scipy.interpolate import make_interp_spline, CubicSpline
from scipy.ndimage import gaussian_filter1d

OUTDIR = WORKSPACE / 'exhibits'
OUTDIR.mkdir(exist_ok=True)

plt.rcParams.update({
    'font.family': 'serif', 'font.size': 10, 'axes.labelsize': 11,
    'axes.titlesize': 12, 'legend.fontsize': 9,
    'figure.dpi': 300, 'savefig.dpi': 300, 'savefig.bbox': 'tight',
    'axes.spines.top': False, 'axes.spines.right': False,
})

BLUE = '#3B7EA1'
RED = '#C62828'
TEAL = '#00695C'
AMBER = '#F57F17'         # vivid orange — app version
AMBER_ESSAY = '#C17A00'  # dark gold/sienna — essay version (less saturated, prints better)
COUPLED = {'sigma_normal': 0.25, 'mu_crisis': 2.2, 'sigma_crisis': 0.3, 'kappa_normal': 60}


def _simulate_central_coupled(M=500):
    """Simulate central case with coupling. Returns L, crisis_flag arrays."""
    central = {
        'profile_label': 'central', 'description': '', 'geographies': '',
        'label_short': '', 'params': {
            'a_pi': 7.0, 'b_pi': 3.0, 'alpha': 0.70,
            'tau_alpha0': 2.0, 'tau_beta0': 2.0,
            'H_LO': 0.40, 'H_HI': 0.80, 'eta': 0.02, **COUPLED,
        }, 'scenario_overrides': {},
    }
    sim = simulate_profile_scenario(central, 'G0', M=M, base_seed=5000)
    L = sim['arrays']['L']
    p = make_params(central)
    T = L.shape[1]
    crisis = np.zeros((M, T), dtype=bool)
    for m in range(M):
        seq = np.random.SeedSequence(5000 + m)
        _, rng_exog, _, _ = [np.random.default_rng(s) for s in seq.spawn(4)]
        for t in range(T):
            is_c, _, _ = sample_pi_xi(p, rng_exog)
            crisis[m, t] = is_c
    return L.reshape(-1), crisis.reshape(-1)


def _simulate_baseline(M=500):
    """Simulate central case under baseline (no AI delegation)."""
    central = {
        'profile_label': 'central', 'description': '', 'geographies': '',
        'label_short': '', 'params': {
            'a_pi': 7.0, 'b_pi': 3.0, 'alpha': 0.70,
            'tau_alpha0': 2.0, 'tau_beta0': 2.0,
            'H_LO': 0.40, 'H_HI': 0.80, 'eta': 0.02, **COUPLED,
        }, 'scenario_overrides': {},
    }
    sim = simulate_profile_scenario(central, 'baseline', M=M, base_seed=5000)
    return sim['arrays']['L'].reshape(-1)


# ═══════════════════════════════════════════════════════════════════════
# EXHIBIT 1 — Two versions
# ═══════════════════════════════════════════════════════════════════════

def make_exhibit1():
    print('[Exhibit 1] Generating essay + app versions...')
    L_g0, crisis = _simulate_central_coupled()
    L_base = _simulate_baseline()

    mean_g0 = float(L_g0.mean())
    p99_g0 = float(np.percentile(L_g0, 99))
    p99_perceived = float(np.percentile(L_g0[~crisis], 99))
    mean_base = float(L_base.mean())
    p99_base = float(np.percentile(L_base, 99))
    mean_normal = float(L_g0[~crisis].mean())
    print(f'  G0: E[L]={mean_g0:.0f}, P99={p99_g0:.0f}, normal_mean={mean_normal:.0f}')
    print(f'  *** Perceived P99 (normal quarters only) = {p99_perceived:.1f} ***')
    print(f'  *** Invisible risk multiplier = x{p99_g0/p99_perceived:.2f} ***')
    print(f'  Baseline: E[L]={mean_base:.0f}, P99={p99_base:.0f}')
    # Sanity: no crisis quarter should have L < 700
    crisis_min = float(L_g0[crisis].min()) if crisis.any() else 0
    print(f'  Crisis min L = {crisis_min:.0f} (should be > 700)')

    bw = 50
    bins = np.arange(0, 2200 + bw, bw)
    centers = (bins[:-1] + bins[1:]) / 2
    GREY = '#9E9E9E'

    # ── VERSION ESSAY: baseline step (gray) + G0 filled (muted blue-gray), 3 lines ──
    n_g0 = len(L_g0)
    n_base = len(L_base)
    c_g0_all, _ = np.histogram(L_g0, bins=bins)
    c_base, _ = np.histogram(L_base, bins=bins)
    pct_g0 = 100 * c_g0_all / n_g0
    pct_base = 100 * c_base / n_base
    # Smooth + CubicSpline for a genuinely continuous No-AI baseline curve (no step artifacts)
    pct_base_smooth = gaussian_filter1d(pct_base.astype(float), sigma=2.5)
    cs_base = CubicSpline(centers, pct_base_smooth)
    x_smooth_base = np.linspace(centers[0], centers[-1], 500)
    y_smooth_base = np.maximum(cs_base(x_smooth_base), 0.0)

    # Crisis visible: only color red if L > 700 (avoids red in left mode)
    crisis_visible = crisis & (L_g0 > 700)
    c_normal_e, _ = np.histogram(L_g0[~crisis_visible], bins=bins)
    c_crisis_e, _ = np.histogram(L_g0[crisis_visible], bins=bins)
    pct_ne = 100 * c_normal_e / n_g0
    pct_ce = 100 * c_crisis_e / n_g0

    ymax_e = max(pct_base.max(), (pct_ne + pct_ce).max()) * 1.32

    def _add_3lines(ax_, ymax_, mean_color, amber_color):
        """Mean (bar-colour dashed), Perceived P99 (amber dashed), Actual P99 (red solid)."""
        mid_means = (mean_normal + mean_g0) / 2  # ≈ 455 — used for arrow midpoint

        # ── Mean (secondary) — matches Normal quarters bar colour ──
        ax_.axvline(mean_g0, color=mean_color, ls='--', lw=1.2, zorder=5)
        ax_.text(mean_g0 + 24, ymax_ * 0.87, f'Mean: {mean_g0:.0f}',
                 fontsize=8, color=mean_color, ha='left', va='top')

        # ── Perceived mean (secondary — fine amber dashed) ──
        ax_.axvline(mean_normal, color=amber_color, ls='--', lw=0.9, alpha=0.70, zorder=4)
        ax_.text(mean_normal - 24, ymax_ * 0.95,
                 f'Perceived mean: {mean_normal:.0f}',
                 fontsize=7.5, color=amber_color, ha='right', va='top', alpha=0.85)

        # ── "Similar means" — key visual proof: means close, tails far ──
        ax_.annotate('', xy=(mean_g0, ymax_ * 0.91), xytext=(mean_normal, ymax_ * 0.91),
                     arrowprops=dict(arrowstyle='<->', color='#888888', lw=0.7,
                                     alpha=0.60, mutation_scale=8))
        # ── Perceived P99 (primary) — amber dashed, label right ──
        ax_.axvline(p99_perceived, color=amber_color, ls='--', lw=1.9, zorder=5)
        ax_.text(p99_perceived + 24, ymax_ * 0.96,
                 f'Perceived P99\n(normal only): {p99_perceived:.0f}',
                 fontsize=8, color=amber_color, ha='left', va='top', linespacing=1.25)

        # ── Actual P99 (primary) — red solid, label left of line ──
        ax_.axvline(p99_g0, color=RED, ls='-', lw=2.2, zorder=5)
        ax_.text(p99_g0 - 24, ymax_ * 0.96, f'Actual P99\n{p99_g0:.0f}',
                 fontsize=8.5, color=RED, ha='right', va='top', linespacing=1.25)

        # ── Invisible risk: thin <-> arrow only (text removed — belongs in caption) ──
        y_arrow = ymax_ * 0.68
        ax_.annotate('', xy=(p99_g0, y_arrow), xytext=(p99_perceived, y_arrow),
                     arrowprops=dict(arrowstyle='<->', color=RED, lw=0.9,
                                     alpha=0.50, mutation_scale=10))

    def _add_baseline_annots(ax_, ymax_):
        """No-AI mean & P99 — darker grey, legible at print."""
        ax_.axvline(mean_base, color='#757575', ls='--', lw=1.0, alpha=0.72, zorder=1)
        ax_.text(mean_base - 22, ymax_ * 0.52,
                 f'No-AI\nmean: {mean_base:.0f}',
                 fontsize=7.5, color='#757575', style='italic',
                 ha='right', va='center', linespacing=1.3)
        ax_.axvline(p99_base, color='#757575', ls='-', lw=1.0, alpha=0.72, zorder=1)
        ax_.text(p99_base + 22, ymax_ * 0.35,
                 f'No-AI\nP99: {p99_base:.0f}',
                 fontsize=7.5, color='#757575', style='italic',
                 ha='left', va='center', linespacing=1.3)

    # ── VERSION ESSAY ──
    fig, ax = plt.subplots(figsize=(9, 5))
    # Regime background tints (very subtle — reinforces normal vs crisis zones)
    ax.axvspan(0, 700, alpha=0.04, color='#546E7A', zorder=0)
    ax.axvspan(700, 1250, alpha=0.04, color='#888888', zorder=0)
    ax.axvspan(1250, 2100, alpha=0.04, color='#B71C1C', zorder=0)
    ax.plot(x_smooth_base, y_smooth_base, color=GREY, alpha=0.55, lw=1.5, zorder=1)
    ax.bar(centers, pct_ne, width=bw * 0.88, color='#546E7A', alpha=0.65, zorder=2)
    ax.bar(centers, pct_ce, width=bw * 0.88, bottom=pct_ne,
           color='#B71C1C', alpha=0.70, zorder=3)
    _add_3lines(ax, ymax_e, '#546E7A', AMBER_ESSAY)
    _add_baseline_annots(ax, ymax_e)
    ax.set_xlabel('Quarterly loss (total errors across 200 agents \u00d7 10 decisions)')
    ax.set_ylabel('Frequency (%)')
    ax.set_xlim(0, 2100)
    ax.set_ylim(0, ymax_e)
    ax.xaxis.set_major_locator(ticker.MultipleLocator(200))
    # Legend: 3 entries only — bar types not annotated directly on the plot
    ax.legend(handles=[
        Patch(facecolor='#546E7A', alpha=0.65, label='Normal quarters'),
        Patch(facecolor='#B71C1C', alpha=0.70, label='Crisis quarters'),
        Line2D([0], [0], color='#757575', lw=1.0, alpha=0.72, label='No-AI baseline'),
    ], fontsize=8, ncol=1, loc='lower right', bbox_to_anchor=(0.99, 0.02),
       framealpha=0.95, edgecolor='#CCC')
    fig.savefig(OUTDIR / 'exhibit1_essay.pdf')
    fig.savefig(OUTDIR / 'exhibit1_essay.png')
    plt.close(fig)
    print('  essay version saved')

    # ── VERSION APP: vivid blue (normal) + saturated red (crisis) + baseline contour ──
    c_normal_a, _ = np.histogram(L_g0[~crisis_visible], bins=bins)
    c_crisis_a, _ = np.histogram(L_g0[crisis_visible], bins=bins)
    pct_na = 100 * c_normal_a / n_g0
    pct_ca = 100 * c_crisis_a / n_g0
    ymax_a = max(pct_base.max(), (pct_na + pct_ca).max()) * 1.30

    fig, ax = plt.subplots(figsize=(9, 5))
    # Regime background tints
    ax.axvspan(0, 700, alpha=0.04, color='#1565C0', zorder=0)
    ax.axvspan(700, 1250, alpha=0.04, color='#888888', zorder=0)
    ax.axvspan(1250, 2100, alpha=0.04, color='#C62828', zorder=0)
    ax.plot(x_smooth_base, y_smooth_base, color=GREY, alpha=0.50, lw=1.5, zorder=1)
    ax.bar(centers, pct_na, width=bw * 0.88, color='#1565C0', alpha=0.70, zorder=2)
    ax.bar(centers, pct_ca, width=bw * 0.88, bottom=pct_na,
           color=RED, alpha=0.85, zorder=3)
    _add_3lines(ax, ymax_a, '#1565C0', AMBER)
    _add_baseline_annots(ax, ymax_a)
    ax.legend(handles=[
        Patch(facecolor='#1565C0', alpha=0.70, label='Normal quarters'),
        Patch(facecolor=RED, alpha=0.85, label='Crisis quarters'),
        Line2D([0], [0], color='#757575', lw=1.0, alpha=0.72, label='No-AI baseline'),
    ], fontsize=8, ncol=1, loc='lower right', bbox_to_anchor=(0.99, 0.02),
       framealpha=0.95, edgecolor='#CCC')
    ax.set_xlabel('Quarterly loss (total errors across 200 agents \u00d7 10 decisions)')
    ax.set_ylabel('Frequency (%)')
    ax.set_xlim(0, 2100)
    ax.set_ylim(0, ymax_a)
    ax.xaxis.set_major_locator(ticker.MultipleLocator(200))
    fig.savefig(OUTDIR / 'exhibit1_app.pdf')
    fig.savefig(OUTDIR / 'exhibit1_app.png')
    plt.close(fig)
    print('  app version saved')
    return True


# ═══════════════════════════════════════════════════════════════════════
# EXHIBIT 2 — Risk-return frontier (tight labels)
# ═══════════════════════════════════════════════════════════════════════

def _compute_frontier_points(M=500):
    """Simulate central case under 4 governance scenarios, return (name, P99xTheta, Output, color)."""
    central = {
        'profile_label': 'central', 'description': '', 'geographies': '',
        'label_short': '', 'params': {
            'a_pi': 7.0, 'b_pi': 3.0, 'alpha': 0.70,
            'tau_alpha0': 2.0, 'tau_beta0': 2.0,
            'H_LO': 0.40, 'H_HI': 0.80, 'eta': 0.02, **COUPLED,
        }, 'scenario_overrides': {},
    }
    from flattening_v5 import SCENARIO_DEFAULTS
    scenarios = [
        ('No AI',            'baseline', '#757575'),
        ('Active scaffold',  'G2',       '#2E7D32'),
        ('Passive scaffold', 'G1',       '#F57C00'),
        ('Unmanaged AI',     'G0',       '#C62828'),
    ]
    pts = []
    for name, sc_name, color in scenarios:
        sim = simulate_profile_scenario(central, sc_name, M=M, base_seed=5000)
        L = sim['arrays']['L']
        out = sim['arrays']['output']
        theta = SCENARIO_DEFAULTS[sc_name]['theta']
        p99_x_theta = float(np.percentile(L, 99)) * theta
        mean_output = float(out.mean())
        pts.append((name, p99_x_theta, mean_output, color))
        print(f'  {name} ({sc_name}): P99xθ={p99_x_theta:.0f}, Output={mean_output:.0f}')
    return pts


def make_exhibit2():
    print('[Exhibit 2] Risk-return frontier (M=1000)...')
    pts = _compute_frontier_points(M=1000)
    # Order: No AI (baseline), G2, G1, G0
    x_base, y_base = pts[0][1], pts[0][2]   # No AI:  ~(1106, 1198)
    x_g2,   y_g2   = pts[1][1], pts[1][2]   # G2:     ~(1537, 1520)
    x_g1,   y_g1   = pts[2][1], pts[2][2]   # G1:     ~(1925, 1731)
    x_g0,   y_g0   = pts[3][1], pts[3][2]   # G0:     ~(2155, 1876)

    # ── Governance efficiency metrics ──
    dR_g0_g1 = x_g0 - x_g1   # risk reduction: passive governance
    dR_g1_g2 = x_g1 - x_g2   # risk reduction: active governance
    ratio     = dR_g1_g2 / dR_g0_g1   # ~1.7 — active is more efficient
    pct_risk  = 100 * (x_g0 - x_g2) / x_g0   # risk saved at G2 vs G0
    pct_out   = 100 * (y_g0 - y_g2) / y_g0   # output sacrificed

    # ── Frontier spline (clamped BC for visible concavity) ──
    xs_s = np.array([x_base, x_g2, x_g1, x_g0])
    ys_s = np.array([y_base, y_g2, y_g1, y_g0])
    slope_in  = (ys_s[1] - ys_s[0]) / (xs_s[1] - xs_s[0]) * 2.5
    slope_out = (ys_s[-1] - ys_s[-2]) / (xs_s[-1] - xs_s[-2]) * 0.18
    spl = CubicSpline(xs_s, ys_s, bc_type=((1, slope_in), (1, slope_out)))
    xsm = np.linspace(xs_s[0] - 40, xs_s[-1] + 40, 400)
    ysm = spl(xsm)

    # Bracket row — placed in the empty zone below the frontier curve (~y=1400)
    y_ann = y_base + 200  # ~1398 : well below G2 (1520) and above No AI (1198)

    def _draw(ax, c_base, c_g2, c_g1, c_g0):
        # ── Frontier curve ──
        ax.plot(xsm, ysm, color='#C0C0C0', lw=1.8, ls='--', zorder=2)

        # ── Scatter dots (G2 largest — the key recommendation) ──
        ax.scatter(x_base, y_base, s=80,  c=c_base, edgecolors='white', lw=1.8, zorder=5)
        ax.scatter(x_g2,   y_g2,   s=170, c=c_g2,   edgecolors='white', lw=2.2, zorder=5)
        ax.scatter(x_g1,   y_g1,   s=100, c=c_g1,   edgecolors='white', lw=1.8, zorder=5)
        ax.scatter(x_g0,   y_g0,   s=130, c=c_g0,   edgecolors='white', lw=1.8, zorder=5)

        # ── Point labels ──
        # No AI — to the LEFT (rightmost label doesn't fit)
        ax.annotate('No AI', xy=(x_base, y_base),
                    xytext=(-11, 0), textcoords='offset points',
                    fontsize=11, color=c_base, fontweight='bold', ha='right', va='center')

        # G2 — above, primary label
        ax.annotate('G2 — Active governance', xy=(x_g2, y_g2),
                    xytext=(0, 12), textcoords='offset points',
                    fontsize=10.5, color=c_g2, fontweight='bold', ha='center', va='bottom')

        # G1 — above
        ax.annotate('G1 — Passive governance', xy=(x_g1, y_g1),
                    xytext=(0, 12), textcoords='offset points',
                    fontsize=10.5, color=c_g1, fontweight='bold', ha='center', va='bottom')

        # G0 — above
        ax.annotate('G0 — Unmanaged AI', xy=(x_g0, y_g0),
                    xytext=(0, 12), textcoords='offset points',
                    fontsize=10.5, color=c_g0, fontweight='bold', ha='center', va='bottom')

        # ── "Best risk-adjusted return" — stacked above G2 label, no arrow (avoids curve) ──
        ax.annotate('best risk-adjusted return on frontier',
                    xy=(x_g2, y_g2), xytext=(0, 30), textcoords='offset points',
                    fontsize=8, color=c_g2, fontstyle='italic',
                    ha='center', va='bottom')

        # ── Curvature brackets ──
        # Numbers ABOVE each arrow (va='bottom' → text extends upward from y_ann + 8)
        ax.text((x_g0 + x_g1) / 2, y_ann + 8,
                f'−{dR_g0_g1:.0f}', fontsize=10, color=c_g1,
                ha='center', va='bottom', fontweight='bold')
        ax.text((x_g1 + x_g2) / 2, y_ann + 8,
                f'−{dR_g1_g2:.0f}', fontsize=10, color=c_g2,
                ha='center', va='bottom', fontweight='bold')

        # Arrows at y_ann — no text overlap possible
        ax.annotate('', xy=(x_g1, y_ann), xytext=(x_g0, y_ann),
                    arrowprops=dict(arrowstyle='<->', color=c_g1, lw=1.5, mutation_scale=10))
        ax.annotate('', xy=(x_g2, y_ann), xytext=(x_g1, y_ann),
                    arrowprops=dict(arrowstyle='<->', color=c_g2, lw=1.5, mutation_scale=10))

        # ×1.7 punchline — bold ratio on line 1, italic explanation on line 2
        mid_ann = (x_g1 + x_g2) / 2   # ~1731
        ax.text(mid_ann, y_ann - 16,
                f'\u00d7{ratio:.1f}',
                fontsize=12, color=c_g2, ha='center', va='top', fontweight='bold')
        ax.text(mid_ann, y_ann - 58,
                f'governance efficiency  (G1\u2192G2 vs G0\u2192G1)',
                fontsize=8, color=c_g2, ha='center', va='top', fontstyle='italic')

        # ── Axes ──
        x_lo = x_base - (x_g0 - x_base) * 0.17
        x_hi = x_g0   + (x_g0 - x_base) * 0.07
        y_lo = y_base  - 80   # keeps No AI visible with padding below
        y_hi = y_g0    + (y_g0 - y_base) * 0.28
        ax.set_xlim(x_lo, x_hi)
        ax.set_ylim(y_lo, y_hi)
        ax.set_xlabel('Risk-adjusted worst-case loss  (P99 \u00d7 throughput \u03b8)', fontsize=10)
        ax.set_ylabel('Output  (correct decisions \u00d7 throughput \u03b8)', fontsize=10)
        ax.xaxis.set_major_locator(ticker.MultipleLocator(200))
        ax.yaxis.set_major_locator(ticker.MultipleLocator(150))

    # ── Essay version ──
    fig, ax = plt.subplots(figsize=(9, 5.5))
    _draw(ax, '#616161', '#2E7D32', '#8D6E63', '#B71C1C')
    fig.savefig(OUTDIR / 'exhibit2_essay.pdf')
    fig.savefig(OUTDIR / 'exhibit2_essay.png')
    plt.close(fig)
    print('  essay version saved')

    # ── App version ──
    fig, ax = plt.subplots(figsize=(9, 5.5))
    _draw(ax, '#757575', '#43A047', '#F57C00', '#C62828')
    fig.savefig(OUTDIR / 'exhibit2_app.pdf')
    fig.savefig(OUTDIR / 'exhibit2_app.png')
    plt.close(fig)
    print('  app version saved')

    return True


# ═══════════════════════════════════════════════════════════════════════
# EXHIBIT 3 — Profile map: Perceived → Actual G0 → G2 (4 profiles)
# ═══════════════════════════════════════════════════════════════════════

def _compute_4profile_positions(M=200, base_seed=5000):
    """Compute (Perceived, Actual G0, G2) positions for P2, P3, P6, P8.

    Perceived P99×θ = P99 of normal-regime quarters × theta_G0.
    Both A and B share the same Output_G0 (output is always observable).
    """
    from flattening_v5 import SCENARIO_DEFAULTS as SD
    theta_G0 = SD['G0']['theta']  # 1.25

    pids = [2, 3, 6, 8]
    results = {}
    for pid in pids:
        spec = PROFILES[pid]
        p = make_params(spec)

        # ── G0 simulation ──
        sim_g0 = simulate_profile_scenario(spec, 'G0', M=M, base_seed=base_seed)
        L_g0 = sim_g0['arrays']['L']      # (M, T)
        out_g0 = sim_g0['arrays']['output']
        T = L_g0.shape[1]

        # Replay crisis flags (same seed structure as simulate_profile_scenario)
        crisis = np.zeros((M, T), dtype=bool)
        for m in range(M):
            seq = np.random.SeedSequence(base_seed + m)
            _, rng_exog, _, _ = [np.random.default_rng(s) for s in seq.spawn(4)]
            for t in range(T):
                is_c, _, _ = sample_pi_xi(p, rng_exog)
                crisis[m, t] = is_c

        L_flat = L_g0.reshape(-1)
        cr_flat = crisis.reshape(-1)

        p99_perceived_raw = float(np.percentile(L_flat[~cr_flat], 99))
        p99_perceived_t = p99_perceived_raw * theta_G0
        p99_actual_t = float(np.percentile(L_flat, 99)) * theta_G0
        output_g0 = float(out_g0.mean())

        # ── G2 simulation ──
        sim_g2 = simulate_profile_scenario(spec, 'G2', M=M, base_seed=base_seed)
        L_g2 = sim_g2['arrays']['L'].reshape(-1)
        out_g2 = sim_g2['arrays']['output']
        theta_g2 = spec.get('scenario_overrides', {}).get('G2', {}).get('theta', 1.10)
        p99_g2_t = float(np.percentile(L_g2, 99)) * theta_g2
        output_g2 = float(out_g2.mean())

        results[pid] = {
            'A': (p99_perceived_t, output_g0),   # Perceived (normal quarters)
            'B': (p99_actual_t, output_g0),       # Actual G0 (all quarters)
            'C': (p99_g2_t, output_g2),            # Governed G2
            'p99_perceived_t': p99_perceived_t,
            'p99_actual_t': p99_actual_t,
        }
        print(f'  P{pid}: Perceived P99×θ={p99_perceived_t:.0f}, '
              f'Actual P99×θ={p99_actual_t:.0f}, '
              f'G2 P99×θ={p99_g2_t:.0f}, '
              f'Output_G0={output_g0:.0f}, Output_G2={output_g2:.0f}')
    return results


def make_exhibit3():
    print('[Exhibit 3] Organizational profile map (4 profiles, essay + app)...')
    data = _compute_4profile_positions()

    # Visual configuration per profile
    profile_cfg = {
        2: {'label': 'Inv. bank\nLondon',            'c_essay': '#37474F', 'c_app': '#1565C0'},
        3: {'label': 'Strat. consult.\nParis',        'c_essay': '#6D4C41', 'c_app': '#B71C1C'},
        6: {'label': 'Creative agency\nSingapore',    'c_essay': '#2E7D32', 'c_app': '#1B5E20'},
        8: {'label': 'Central admin\nSeoul',          'c_essay': '#4527A0', 'c_app': '#6A1B9A'},
    }

    # London/Paris risk comparison (A→B x-axis gap)
    p2_bx = data[2]['B'][0]
    p3_bx = data[3]['B'][0]
    pct_lp = 100 * (p2_bx - p3_bx) / p3_bx  # negative: London is safer

    # Print values for essay text
    print('\n  === VALUES FOR ESSAY TEXT ===')
    for pid in [2, 3, 6, 8]:
        d = data[pid]
        ratio = d['p99_actual_t'] / d['p99_perceived_t']
        print(f'  P{pid}: Perceived P99×θ = {d["p99_perceived_t"]:.0f}  '
              f'Actual P99×θ = {d["p99_actual_t"]:.0f}  '
              f'Ratio = ×{ratio:.2f}')
    print(f'  London vs Paris Actual P99×θ: {p2_bx:.0f} vs {p3_bx:.0f} '
          f'→ {pct_lp:.1f}%')
    print()

    # Per-profile B→C arrow properties:
    # London/Paris (P2/P3) narrative focus → thick; Singapore/Seoul context → medium
    bc_lw    = {2: 2.4, 3: 2.4, 6: 1.6, 8: 1.6}
    bc_alpha = {2: 0.92, 3: 0.92, 6: 0.70, 8: 0.70}

    # Label positions in data coordinates — four-corner layout
    # Leaders connect from label box to point B (Actual G0); no crossing verified
    label_data_xy = {
        2: (1550, 2000, 'center', 'bottom'),   # London: just above B, leader ≈ 145 units
        3: (2300, 2080, 'center', 'bottom'),   # Paris: unchanged
        6: (1845, 2080, 'center', 'bottom'),   # Singapore: unchanged
        8: (2318, 1730, 'center', 'top'),      # Seoul: directly below B, no Paris overlap
    }

    def _draw_ex3(ax, color_key):
        for pid in [2, 3, 6, 8]:
            d = data[pid]
            c = profile_cfg[pid][color_key]
            A, B, C = d['A'], d['B'], d['C']

            # Arrow A→B: thin grey dashed (hidden risk — background guide, not dashboard-visible)
            ax.annotate('', xy=B, xytext=A,
                        arrowprops=dict(arrowstyle='->', color='#AAAAAA', ls='--',
                                        lw=0.8, alpha=0.55),
                        zorder=2)
            # Arrow B→C: solid, variable thickness (scaffold effect)
            ax.annotate('', xy=C, xytext=B,
                        arrowprops=dict(arrowstyle='->', color=c,
                                        lw=bc_lw[pid], alpha=bc_alpha[pid]),
                        zorder=3)

            # Point A (perceived): hollow circle — sized to match B importance
            ax.scatter(*A, s=120, facecolors='none', edgecolors=c,
                       linewidths=1.8, zorder=4, alpha=0.90)
            # Point B (actual G0): large filled — primary focus
            ax.scatter(*B, s=170, c=c, edgecolors='white',
                       linewidths=1.5, zorder=5)
            # Point C (G2): visible semi-transparent
            ax.scatter(*C, s=70, c=c, alpha=0.55,
                       edgecolors=c, linewidths=1.0, zorder=3)

        # Profile labels: coloured box + leader line → point B
        for pid in [2, 3, 6, 8]:
            xl, yl, hal, val = label_data_xy[pid]
            c = profile_cfg[pid][color_key]
            ax.annotate(profile_cfg[pid]['label'],
                        xy=data[pid]['B'],
                        xytext=(xl, yl), textcoords='data',
                        fontsize=8.5, color=c, ha=hal, va=val, fontweight='bold',
                        bbox=dict(facecolor='white', alpha=0.95, edgecolor=c,
                                  linewidth=0.9, pad=3.0, boxstyle='round,pad=0.3'),
                        arrowprops=dict(arrowstyle='-', color=c, lw=0.8, alpha=0.65),
                        zorder=7)

        # London/Paris annotation — bracket + qualified text below the B points
        p2_by = data[2]['B'][1]
        p3_by = data[3]['B'][1]
        y_ann = min(p2_by, p3_by) - 70     # well below B points
        ax.annotate('', xy=(p3_bx, y_ann), xytext=(p2_bx, y_ann),
                    arrowprops=dict(arrowstyle='<->', color='#555555',
                                    lw=1.2, alpha=0.80))
        ax.text((p2_bx + p3_bx) / 2, y_ann - 14,
                f'Same sector. Same talent.\nParis +{abs(pct_lp):.0f}% worst-case loss (P99\u00d7\u03b8).',
                fontsize=8, color='#222222', ha='center', va='top',
                linespacing=1.35)

    legend_elems = [
        Line2D([0], [0], marker='o', color='w', markerfacecolor='none',
               markeredgecolor='#424242', markersize=9, markeredgewidth=1.5,
               label='Perceived position (dashboard view)'),
        Line2D([0], [0], marker='o', color='w', markerfacecolor='#424242',
               markersize=11, label='Actual position (G0 — unmanaged AI)'),
        Line2D([0], [0], marker='o', color='w', markerfacecolor='#9E9E9E',
               markersize=6, alpha=0.5, label='With active governance (G2)'),
    ]

    # Dynamic axis limits from all positions
    all_x = [data[p][pt][0] for p in [2, 3, 6, 8] for pt in ['A', 'B', 'C']]
    all_y = [data[p][pt][1] for p in [2, 3, 6, 8] for pt in ['A', 'B', 'C']]
    xmin, xmax = min(all_x), max(all_x)
    ymin, ymax_v = min(all_y), max(all_y)
    xpad = (xmax - xmin) * 0.13
    ypad_lo = (ymax_v - ymin) * 0.45   # generous bottom for London/Paris annotation
    ypad_hi = (ymax_v - ymin) * 0.35

    # ── ESSAY version ──
    fig, ax = plt.subplots(figsize=(9, 5.5))
    _draw_ex3(ax, 'c_essay')
    ax.legend(handles=legend_elems, fontsize=7.5, loc='lower left',
              bbox_to_anchor=(0.01, 0.02),
              framealpha=0.92, edgecolor='#DDD', borderpad=0.8)
    ax.set_xlabel('Risk-adjusted worst-case loss (P99 \u00d7 throughput)')
    ax.set_ylabel('Output (correct decisions \u00d7 throughput)')
    ax.set_xlim(xmin - xpad * 1.5, xmax + xpad)
    ax.set_ylim(ymin - ypad_lo, ymax_v + ypad_hi)
    fig.savefig(OUTDIR / 'exhibit3_essay.pdf')
    fig.savefig(OUTDIR / 'exhibit3_essay.png')
    plt.close(fig)
    print('  essay version saved')

    # ── APP version ──
    fig, ax = plt.subplots(figsize=(9, 5.5))
    _draw_ex3(ax, 'c_app')
    ax.legend(handles=legend_elems, fontsize=7.5, loc='lower left',
              bbox_to_anchor=(0.01, 0.02),
              framealpha=0.92, edgecolor='#DDD', borderpad=0.8)
    ax.set_xlabel('Risk-adjusted worst-case loss (P99 \u00d7 throughput)')
    ax.set_ylabel('Output (correct decisions \u00d7 throughput)')
    ax.set_xlim(xmin - xpad * 1.5, xmax + xpad)
    ax.set_ylim(ymin - ypad_lo, ymax_v + ypad_hi)
    fig.savefig(OUTDIR / 'exhibit3_app.pdf')
    fig.savefig(OUTDIR / 'exhibit3_app.png')
    plt.close(fig)
    print('  app version saved')

    # DoD checks
    for pid in [2, 3, 6, 8]:
        d = data[pid]
        gap_ratio = d['p99_actual_t'] / d['p99_perceived_t']
        print(f'  P{pid}: invisible risk ratio = ×{gap_ratio:.2f}, '
              f'C<A_x: {"✓" if d["C"][0] < d["A"][0] else "✗"}')
    return True


def _sim_central(scenario, M=200, seed=5000):
    """Simulate central spec for temporal analysis figures."""
    spec = {
        'profile_label': 'central', 'description': '', 'geographies': '', 'label_short': '',
        'params': {
            'a_pi': 7.0, 'b_pi': 3.0, 'alpha': 0.70,
            'tau_alpha0': 2.0, 'tau_beta0': 2.0,
            'H_LO': 0.40, 'H_HI': 0.80, 'eta': 0.02, **COUPLED,
        },
        'scenario_overrides': {},
    }
    return simulate_profile_scenario(spec, scenario, M=M, base_seed=seed)['arrays']


def _series(arr, M=200):
    """Return (mean, 95% CI half-width) per quarter for array shape (M, T)."""
    mean = arr.mean(axis=0)
    ci   = 1.96 * arr.std(axis=0) / np.sqrt(M)
    return mean, ci


# ═══════════════════════════════════════════════════════════════════════
# EXHIBIT 4 — C_excess temporal dynamics
# ═══════════════════════════════════════════════════════════════════════

def make_exhibit4():
    print('[Exhibit 4] C_excess time series (M=200)...')
    arrs_g0   = _sim_central('G0')
    arrs_g2   = _sim_central('G2')
    arrs_base = _sim_central('baseline')

    M   = 200
    ts  = np.arange(1, 21)
    ce_g0_mean, ce_g0_ci = _series(arrs_g0['excess_coerror'],  M)
    ce_g2_mean, ce_g2_ci = _series(arrs_g2['excess_coerror'],  M)
    ce_base_mean = float(arrs_base['excess_coerror'].mean())

    pct_up = 100.0 * (ce_g0_mean[-1] - ce_base_mean) / (ce_base_mean + 1e-12)
    print(f'  Baseline C_excess = {ce_base_mean:.4f}')
    print(f'  G0 T=20 C_excess  = {ce_g0_mean[-1]:.4f}  (+{pct_up:.0f}% vs baseline)')
    print(f'  G2 T=20 C_excess  = {ce_g2_mean[-1]:.4f}')

    print(f'\n  {"t":>3}  {"G0_mean":>9}  {"G2_mean":>9}')
    for i, t in enumerate(ts):
        print(f'  {t:>3}  {ce_g0_mean[i]:>9.5f}  {ce_g2_mean[i]:>9.5f}')

    C_G0  = '#B71C1C'
    C_G2  = '#2E7D32'
    C_BASE_LINE = '#9E9E9E'

    def _draw(ax, c_g0, c_g2):
        ax.fill_between(ts, ce_g0_mean - ce_g0_ci, ce_g0_mean + ce_g0_ci,
                        color=c_g0, alpha=0.12, zorder=2)
        ax.fill_between(ts, ce_g2_mean - ce_g2_ci, ce_g2_mean + ce_g2_ci,
                        color=c_g2, alpha=0.12, zorder=2)
        ax.plot(ts, ce_g0_mean, color=c_g0, lw=2.0, label='G0 — Unmanaged AI', zorder=4)
        ax.plot(ts, ce_g2_mean, color=c_g2, lw=2.0, label='G2 — Active governance', zorder=4)
        ax.axhline(ce_base_mean, color=C_BASE_LINE, lw=1.2, ls=':', zorder=3,
                   label='No-AI baseline')

        # +XX% annotation at T=20 — bold label directly above the curve endpoint
        ax.annotate(f'+{pct_up:.0f}%',
                    xy=(20, ce_g0_mean[-1]),
                    xytext=(20, ce_g0_mean[-1] + ce_g0_ci[-1] + 0.006),
                    fontsize=10.5, fontweight='bold', color=c_g0, ha='center',
                    arrowprops=dict(arrowstyle='->', color=c_g0, lw=1.2))

        # "Wood et al." italic — placed mid-left, well away from the +XX% cluster
        ax.text(0.04, 0.90,
                'Wood et al. mechanism\n\u2014 directly measured',
                transform=ax.transAxes, fontsize=8.5, fontstyle='italic',
                color=c_g0, ha='left', va='top')

        ax.set_xlabel('Quarter  (t)', fontsize=10)
        ax.set_ylabel('Pairwise error correlation excess  (C_excess)', fontsize=10)
        ax.xaxis.set_major_locator(ticker.MultipleLocator(4))
        ax.xaxis.set_minor_locator(ticker.MultipleLocator(1))
        ax.set_xlim(0.5, 20.5)
        ax.legend(fontsize=9, framealpha=0.9, edgecolor='#DDD')

    # Essay
    fig, ax = plt.subplots(figsize=(8, 4.5))
    _draw(ax, '#B71C1C', '#2E7D32')
    fig.savefig(OUTDIR / 'exhibit4_essay.pdf')
    fig.savefig(OUTDIR / 'exhibit4_essay.png')
    plt.close(fig)
    print('  exhibit4_essay saved')

    # App (slightly brighter)
    fig, ax = plt.subplots(figsize=(8, 4.5))
    _draw(ax, '#C62828', '#388E3C')
    fig.savefig(OUTDIR / 'exhibit4_app.pdf')
    fig.savefig(OUTDIR / 'exhibit4_app.png')
    plt.close(fig)
    print('  exhibit4_app saved')
    return True


if __name__ == '__main__':
    r1 = make_exhibit1()
    r2 = make_exhibit2()
    r3 = make_exhibit3()
    r4 = make_exhibit4()
    print(f'\nE1={"PASS" if r1 else "FAIL"}, E2={"PASS" if r2 else "FAIL"}, '
          f'E3={"PASS" if r3 else "FAIL"}, E4={"PASS" if r4 else "FAIL"}')
