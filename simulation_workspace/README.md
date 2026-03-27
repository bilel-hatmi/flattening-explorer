# The Flattening

Agent-level Monte Carlo simulation accompanying the Cambridge-McKinsey Risk Prize 2026 submission "The Flattening: How AI Delegation Compresses Organizational Hierarchies and Concentrates Tail Risk."

## Model overview

The model simulates **200 agents × 10 decisions × 20 quarters × 200 replications** under **8 organizational profiles** and **4 governance scenarios**. Each agent maintains a private competence level that evolves through AI delegation, conformity pressure, and deskilling. Quarterly losses aggregate across agents and decisions; the key output is the P99 tail loss and its interaction with governance-induced oversight premiums (P99×θ).

## Key result

AI delegation produces a *paradox*: expected losses fall while P99 tail losses rise sharply. The benefit of active governance (scaffold_benefit) is highly heterogeneous across profiles — positive for high-autonomy knowledge workers (P2 London +146%, P3 Paris +77%), near-zero or negative for routine back-office roles (P7 Bangalore −26%, P5 San Francisco −36%).

## Dependencies

```
numpy >= 1.24
scipy >= 1.10
pandas >= 2.0
matplotlib >= 3.7
```

Optional (for speed): `numba >= 0.57`

Install with:
```bash
pip install numpy scipy pandas matplotlib
```

## Quick start

```bash
python generate_csv_suite.py    # → outputs/  (~15 min, produces all CSVs)
python make_exhibits.py         # → exhibits/ (Exhibits 1–4, essay + app versions)
python make_appendix_figures.py # → exhibits/ (Appendix Figures A1–A5)
```

> The grid search used to calibrate model parameters can be re-run with `python run_grid_search.py` but is not required to reproduce exhibits.

## Validation

`data_reference/` contains the frozen baseline outputs from the validated run (β=0.30, M=200, 8 profiles × 4 scenarios). `generate_csv_suite.py` automatically checks all P99 values within ±1% of this baseline before proceeding. If any check fails the script stops and reports the discrepancy.

## Key parameters

| Parameter | Value | Description |
|---|---|---|
| `beta_conform` | 0.30 | Conformity pressure (calibrated) |
| `mu_crisis` | 2.2 | Mean log-loss in crisis quarter |
| `sigma_crisis` | 0.30 | Volatility in crisis quarter |
| `sigma_normal` | 0.25 | Volatility in normal quarter |
| `p_crisis` | 0.08 | Quarterly crisis probability |
| `N` | 200 | Agents per organization |
| `T` | 20 | Quarters per simulation |
| `K` | 10 | Decisions per agent per quarter |

## Profiles

| ID | City | Sector | α | E[L] baseline |
|---|---|---|---|---|
| P1 | Frankfurt | Finance / Audit | 0.75 | 601 |
| P2 | London | Investment banking | 0.40 | 401 |
| P3 | Paris | Strategy consulting | 0.40 | 402 |
| P4 | Brussels | Corporate legal | 0.85 | 802 |
| P5 | San Francisco | Tech startup | 0.70 | 653 |
| P6 | Singapore | Creative agency | 0.80 | 802 |
| P7 | Bangalore | Back-office | 0.90 | 1102 |
| P8 | Seoul | Central admin | 0.90 | 851 |

α = initial human competence (higher = more capable workforce at t=0).

## Governance scenarios

| Scenario | θ (oversight premium) | p₀ (AI delegation rate) | Description |
|---|---|---|---|
| baseline | 1.00 | 0.00 | No AI delegation |
| G0 | 1.25 | 0.70–0.85 (profile-specific) | Unmanaged AI adoption |
| G1 | 1.20 | profile-specific (lower) | Partial governance |
| G2 | 1.10–1.18 (profile-specific) | profile-specific (lowest) | Active governance + audit |

## Output file index

| File in `outputs/` | Used in |
|---|---|
| `ablation_results.csv` | Exhibit 1 / Appendix A3 |
| `exhibit_2_frontier.csv` | Exhibit 2 |
| `histograms_by_profile_b030.csv` | Exhibit 3 |
| `trajectories_by_profile_b030.csv` | Exhibit 4 |
| `heatmap_alpha_pi_b030.csv` | Appendix A2 |
| `sweep_dimensions.csv` | Appendix A2 (tornado — central) |
| `sweep_dimensions_by_profile.csv` | Appendix A2 (tornado — by profile) |
| `sweep_profiles_v3_b030.csv` | Appendix A3 |
| `profile_summary_v3_b030.csv` | Appendix A5 / Table 1 |
| `scatter_profiles_b030.csv` | Appendix A5 |
| `correlation_grids_P3_50q.csv` | Appendix A1 |
| `ten_replications_P3_G0.csv` | Supplemental |
