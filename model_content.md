# model_content.md — Static Content for The Flattening Explorer
## Source: orchestrateur modélisateur — 25 March 2026
## Feeds: Hero animation, About page, Calibration page, Callout boxes, Links
## All equations validated for KaTeX syntax

---

## BLOC 1 — HERO

```
delta_EL:    "-38%"
delta_P99:   "+56%"
tail_ratio:  "×2.5"

tagline: "AI optimises the mean and detonates the tail."
```

---

## BLOC 2 — ABOUT

### The mechanism

Two independent channels drive the same failure. The first operates before any decision is made. Algorithmic hiring filters compress the distribution of cognitive profiles in the workforce — selecting for conformity, eliminating the dissenters who would question AI outputs. When every employee reasons through the same narrow pipeline, a wrong AI recommendation propagates without friction. This is the screening channel.

The second channel operates continuously after adoption. Employees who retain independent judgment progressively surrender it to AI-generated recommendations. Shaw and Nave (2026) document surrender rates above 79% under realistic time pressure. Dell'Acqua et al. (2026) show that AI compresses the skill distribution: the bottom half gains substantially, the top loses its edge relative to the frontier. Both effects reduce the diversity of *errors* — not their frequency, but their independence. An organisation where 80% of employees follow the same model makes one large correlated bet per quarter, not two hundred small independent ones.

These two channels converge on a single quantity: mean pairwise error correlation $\bar{\rho}$. The catastrophe follows from an algebraic identity. Page (2007) and Krogh & Vedelsby (1995) established that collective prediction error decomposes into average individual error minus the variance of predictions across agents. Wood et al. (JMLR, 2023) extended this to the loss distribution of a decision portfolio. When $\bar{\rho}$ rises, improvements in individual accuracy are overwhelmed by the co-movement of errors. The mean improves. The tail explodes.

---

### Key equations

$$\text{Var}(L) = NK\,\bar{p}(1-\bar{p})\bigl[1 + (NK-1)\,\bar{\rho}\bigr]$$

When AI reduces average errors ($\downarrow\bar{p}$) but surrender increases pairwise error correlation ($\uparrow\bar{\rho}$), aggregate loss variance scales with the second term. For $N=200$ agents, $K=10$ decisions, the multiplier $(NK-1) = 1999$ amplifies any increase in $\bar{\rho}$ by three orders of magnitude. The mean falls. The tail explodes.

The Vasicek single-factor structure encodes why errors correlate. Each quarter, all employees sharing the same AI model are exposed to the same systematic shock $\xi_t$:

$$Z_{\text{AI},k} = \sqrt{\alpha}\,\xi_t + \sqrt{1-\alpha}\,\varepsilon_k$$

Employee $i$ overrides the AI on decision $k$ if their independent skill $h_i$ exceeds the AI's recommendation threshold. Under unmanaged adoption, $\alpha = 0.70$ — decisions within a centralised AI stack share 70% of their error variance. In a crisis quarter, $\xi_t \sim \mathcal{N}(2.2,\, 0.3)$: every follower fails on correlated decisions simultaneously.

The conformism pressure term links workforce homogeneity to effective surrender rate:

$$p_0^{\text{eff}}(t) = p_0 \cdot \left[1 + \beta_{\text{conform}} \cdot \frac{\text{Var}_{\text{ref}} - \text{Var}(\tau(t))}{\text{Var}_{\text{ref}}}\right]$$

where $\text{Var}(\tau)$ measures the variance of cognitive profiles in the workforce. As screening compresses $\text{Var}(\tau)$, fewer dissenters remain — Asch (1951) shows a single dissenter reduces conformity from 37% to 5%. Without dissenters, $p_0^{\text{eff}}$ rises toward 1. With $\beta_{\text{conform}} = 0.30$, a 30% reduction in cognitive diversity produces a 9-percentage-point increase in the effective surrender rate.

The scaffold benefit metric measures whether governance earns its velocity cost:

$$\text{scaffold\_benefit} = \frac{r_{G2} - r_{G0}}{r_{G0}}, \quad r = \frac{\Delta\text{Output\%}}{\Delta\text{P99}\%}$$

A positive value means governance improves the output-to-risk ratio. Negative means governance degrades it — the velocity cost of forming independent judgment before consulting AI exceeds the risk reduction. London: $+1.46$. San Francisco: $-0.36$.

---

### Simulation setup

The model places 200 agents in an organisation over 20 quarters (five years), with 10 decisions per agent per quarter and 200 Monte Carlo replications per configuration. Environmental exposure $\pi_t$ is drawn from a two-regime mixture: 92% normal quarters with mean frontier exposure 0.73, and 8% crisis quarters with mean exposure 0.35. Crisis quarters couple with a high systematic shock ($\xi_t \sim \mathcal{N}(2.2, 0.3)$), producing the bimodal loss distribution that characterises the model. Eight organisational archetypes — anchored on documented labour market and procurement structures — span the full parameter space from Seoul's centralised national administration ($\alpha = 0.95$, $\text{Beta}(4.5)$) to Singapore's diversified creative agency ($\alpha = 0.30$, $\text{Beta}(1.5)$).

---

### What the model does not capture

- **The D→H bridge remains an inference.** Keck & Tang (2020) document error decorrelation in cognitively diverse groups in the laboratory. No field study has measured pairwise error correlations before and after ATS deployment. The causal chain from screening to surrender operates through $\beta_{\text{conform}}$ — a calibrated parameter, not an observed relationship.
- **The feedback loop from deskilling to surrender is absent.** Employees who lose independent judgment competence likely defer to AI more readily. This boucle is omitted; all dynamic estimates are therefore conservative.
- **External labour market dynamics are not modelled.** The pool of candidates is treated as fixed and infinite. Peng & Garg (NeurIPS 2024) show monoculture reinforces itself as more firms adopt the same tools — an omitted amplification.
- **The Nash equilibrium is qualitative.** The model generates output differentials that create competitive pressure toward G0. The precise equilibrium depends on market structure, which the intra-firm model does not calibrate.
- **The scaffold efficiency is asymmetric by design.** The model captures the velocity cost of active governance (θ drops from 1.25 to 1.10) but does not model the full organisational cost of implementing cognitive forcing functions.

---

### Validation

Six dynamic verifications (V1–V6) confirmed the model's behavioural properties beyond the central paradox. V1 measured pairwise error correlation directly — C_excess rises from 0.045 to 0.064 under G0 over 20 quarters (+44%), validating the Wood et al. mechanism as a measured trajectory, not an algebraic assumption. V2 confirmed bimodality is causally pure: 99.7% of quarters above the catastrophe threshold have crisis_flag=True. V5 verified that the paradox holds without exception across p_crisis ∈ {0.04, 0.15}. Two independent implementations — one O(N³) Gaussian copula, one O(N) Ornstein–Uhlenbeck approximation — converge to within ±2% on E[L] and ±5% on P99 for M=200. Scaffold benefit directions are 8/8 identical across implementations; magnitudes are consistent within Monte Carlo noise.

---

## BLOC 3 — CALIBRATION

### Base parameters

| Parameter | Symbol | Value | Anchor | Confidence |
|-----------|--------|-------|--------|------------|
| Agents | $N$ | 200 | Mid-market stylised | — |
| Quarters | $T$ | 20 | BLS JOLTS tenure 3.5–5.7 yrs | ★★★★★ |
| Decisions per quarter | $K$ | 10 | Granularity parameter | — |
| Replications | $M$ | 200 (500 for histograms) | P99 convergence | — |
| Quarterly turnover | $\delta$ | 0.04 | BLS JOLTS ~15%/yr | ★★★★★ |
| Base surrender rate G0 | $p_0$ | 0.80 | Shaw & Nave 79.8% | ★★★★★ |
| AI accuracy inside frontier | $q_{\text{in}}(t)$ | 0.92 + 0.002t | Dell'Acqua +40% inside | ★★★★★ |
| AI accuracy outside frontier | $q_{\text{out}}$ | 0.55 | Dell'Acqua outside ~60% error | ★★★★★ |
| Conformism coefficient | $\beta_{\text{conform}}$ | 0.30 | Asch, Lorenz, Shaw & Nave | ★★★ |
| Reference variance | $\text{Var}_{\text{ref}}$ | 0.050 | Beta(2,2) | — |
| Pressure amplification | $\lambda$ | 8.0 | Keck & Tang adjusted | ★★★ |
| Conformity amplification | $\gamma$ | 5.0 | Wilson & Caliskan 85.1% | ★★★★ |
| Deskilling rate (default) | $\eta$ | 0.02/qtr | Budzyń −6pp, Arthur meta | ★★★★ |
| Crisis frequency | $p_{\text{crisis}}$ | 0.08 | Flyvbjerg PMJ 2025 | ★★★ |
| E[π] in crisis | $E[\pi_{\text{crisis}}]$ | 0.35 | Dell'Acqua outside stress | ★★★★ |
| Crisis shock mean | $\mu_{\text{crisis}}$ | 2.2 | Basel II analogy, grid search | ★★ |
| Crisis shock std | $\sigma_{\text{crisis}}$ | 0.3 | Grid search for bimodality | ★ |
| Normal shock std | $\sigma_{\text{normal}}$ | 0.25 | Low-default portfolio analogy | ★★ |
| Vasicek concentration | $\alpha$ (default) | 0.70 | CrowdStrike, Menlo 88% | ★★★ |

---

### Scenario parameters

| Parameter | Baseline | G0 | G1 | G2 |
|-----------|----------|----|----|-----|
| $p_0$ (surrender) | 0.0 | 0.80 | 0.70 | 0.55 |
| $\gamma_{\text{eff}}$ (conformity pressure) | 0.0 | 5.0 | 3.5 | 1.5 |
| $\eta_{\text{mult}}$ (deskilling multiplier) | 0.0 | 1.0 | 1.0 | 0.5 |
| $\theta$ (throughput multiplier) | 1.00 | 1.25 | 1.20 | 1.10 |
| Diversity quota | — | — | — | 10% |
| Velocity cost vs G0 | N/A | reference | −4.2% | −12% |

---

### Profile parameters (8 organisational archetypes)

| Profile | City | Sector | $E[\pi]$ | $\alpha$ | Beta($a$,$a$) | $h$ range | $p_0$ G0 | $\eta$ |
|---------|------|--------|----------|----------|----------------|-----------|---------|--------|
| P1 | Frankfurt | Big Four audit | 0.50 | 0.70 | 3.5 | U(0.55, 0.85) | 0.75 | 0.02 |
| P2 | London | Investment bank | 0.55 | 0.40 | 1.5 | U(0.65, 0.95) | 0.70 | 0.02 |
| P3 | Paris | Strategy consulting | 0.55 | 0.90 | 4.0 | U(0.65, 0.95) | 0.70 | 0.02 |
| P4 | Brussels | Corporate legal | 0.45 | 0.90 | 3.0 | U(0.40, 0.80) | 0.80 | 0.01 |
| P5 | San Francisco | Tech startup | 0.70 | 0.60 | 2.5 | U(0.50, 0.85) | 0.80 | 0.03 |
| P6 | Singapore | Creative agency | 0.85 | 0.30 | 1.5 | U(0.40, 0.80) | 0.80 | 0.01 |
| P7 | Bangalore | Back-office | 0.75 | 0.70 | 2.0 | U(0.30, 0.60) | 0.85 | 0.04 |
| P8 | Seoul | Central admin | 0.60 | 0.95 | 4.5 | U(0.40, 0.75) | 0.80 | 0.01 |

Beta($a$,$a$) encodes labour market cognitive homogeneity. $a = 1.5$: internationally diversified hub (London, Singapore). $a = 4.0$–$4.5$: national competitive examination pipeline (Paris grandes écoles, Korean civil service). All Beta parameters are stylised from labour market proxies (Bourdieu 1989, HESA, MOM Singapore, PISA 2022) — not econometric estimates.

---

### Reference results (M=200, β_conform=0.30, π–ξ coupling active)

| Profile | E[L] G0 | P99 brut G0 | P99×θ G0 | Output G0 | Scaffold benefit |
|---------|---------|-------------|---------|-----------|-----------------|
| Central case | 498.9 | 1708 | 2135 | 1876 | — |
| P1 Frankfurt | 572.9 | 1699 | 2124 | 1784 | −3% |
| P2 London | 507.4 | 1334 | 1668 | 1866 | +146% |
| P3 Paris | 480.8 | 1633 | 2041 | 1899 | +77% |
| P4 Brussels | 597.2 | 1803 | 2254 | 1754 | −8% |
| P5 S.F. | 467.7 | 1723 | 2154 | 1915 | −36% |
| P6 Singapore | 440.3 | 1476 | 1845 | 1950 | +40% |
| P7 Bangalore | 509.8 | 1848 | 2310 | 1863 | −26% |
| P8 Seoul | 479.8 | 1854 | 2318 | 1900 | −6% |

---

## BLOC 4 — MEMORABLE RESULTS (callout boxes — verbatim)

```
result_1: "AI reduces average decision errors by 38% while increasing worst-case quarterly losses by 56%."

result_2: "The mean lies in a gap where almost no actual quarter lands. Monitoring the average is monitoring a regime that does not exist."

result_3: "Pairwise error correlation rises 44% over five years under unmanaged adoption. The Wood et al. mechanism is not a theoretical conjecture — it is a measured trajectory."

result_4: "Active governance captures half the productivity gain at half the tail risk. It is the most efficient point on the risk-return frontier — and it cannot be sustained without regulation."

result_5: "Paris and London — same sector, same talent tier. Stack architecture and labour market structure alone drive a 22% gap in tail risk. Neither is a management choice."
```

---

## BLOC 5 — QUESTIONNAIRE (5 questions — scroll-embedded)

### Q1 — Domain exposure

**Question:** "What is your organisation's primary AI use domain?"

| Option | Display label | Model mapping | Profile pointer |
|--------|--------------|---------------|----------------|
| A | Strategy, M&A, legal reasoning | $E[\pi] = 0.45–0.55$ (outside-heavy) | → P3, P4 |
| B | Analytics, audit, risk management | $E[\pi] = 0.55–0.65$ (balanced) | → P1, P2 |
| C | Tech, operations, product | $E[\pi] = 0.65–0.75$ (inside-leaning) | → P5, P7 |
| D | Creative, marketing, content | $E[\pi] = 0.80–0.90$ (inside-dominant) | → P6 |

*Placed: between A2 and B3 (after the paradox is established, before the mechanisms).*

---

### Q2 — Stack architecture

**Question:** "How is your AI stack organised?"

| Option | Display label | Model mapping | Profile pointer |
|--------|--------------|---------------|----------------|
| A | One model for everyone, centrally procured | $\alpha = 0.85–0.95$ | → P4, P8 |
| B | One main model, some team-level alternatives | $\alpha = 0.65–0.75$ | → P1, P7 |
| C | Each team selects its own tools | $\alpha = 0.50–0.65$ | → P5 |
| D | Deliberately diversified, multiple providers by layer | $\alpha = 0.25–0.45$ | → P2, P6 |

*Placed: between C2 and C3 (after the stack chart C2 shows α as the dominant lever).*

---

### Q3 — Talent pipeline

**Question:** "Where does your primary talent come from?"

| Option | Display label | Model mapping | Profile pointer |
|--------|--------------|---------------|----------------|
| A | National competitive examination (France, Korea, Japan…) | Beta($a$,$a$), $a = 4.0–4.5$ | → P3, P8 |
| B | National university system (Germany, Italy, Spain…) | Beta($a$,$a$), $a = 3.0–3.5$ | → P1, P4 |
| C | Competitive national + some international | Beta($a$,$a$), $a = 2.0–2.5$ | → P5, P7 |
| D | International hub, 20+ nationalities | Beta($a$,$a$), $a = 1.5$ | → P2, P6 |

*Placed: between C5 and C6 (after the regressivity slope chart shows Beta as the second lever).*

---

### Q4 — Talent tier

**Question:** "What best describes your team's expertise level?"

| Option | Display label | Model mapping | Profile pointer |
|--------|--------------|---------------|----------------|
| A | Elite — top-decile hires, independent judgment strong | $h \sim U(0.65, 0.95)$, $p_0 = 0.70$ | → P2, P3 |
| B | Standard professional — solid execution, some AI reliance | $h \sim U(0.50, 0.85)$, $p_0 = 0.75–0.80$ | → P1, P4, P5 |
| C | Operational / technical — structured tasks, process-driven | $h \sim U(0.30, 0.60)$, $p_0 = 0.85$ | → P7 |

*Placed: between C6 and C-WI (completing the profile portrait before the what-if).*

---

### Q5 — Organisation size

**Question:** "What is your organisation's size?"

| Option | Display label | Model mapping | Risk implication |
|--------|--------------|---------------|-----------------|
| A | Startup (1–50) | Tail risk externalised — absorbed by clients and ecosystem | Nash: G0 rational |
| B | Mid-market (50–500) | ~60% of tail risk absorbed internally | Governance viable |
| C | Corporate (500+) | Full tail risk absorption + supplier contagion | Regulation target |

*Placed: between D2-BIS and D-NASH (after supply chain risk is established, before the governance trap).*

---

### Profile matching logic (for Claude Code)

After Q1–Q4, match to nearest profile by Manhattan distance on 4 dimensions. Q5 modulates the narrative frame (risk absorption), not the profile assignment.

```javascript
// src/data/questionnaire.js — matching logic

const PROFILE_COORDS = {
  P1: { epi: 0.50, alpha: 0.70, beta: 3.5, h: 0.70 },
  P2: { epi: 0.55, alpha: 0.40, beta: 1.5, h: 0.80 },
  P3: { epi: 0.55, alpha: 0.90, beta: 4.0, h: 0.80 },
  P4: { epi: 0.45, alpha: 0.90, beta: 3.0, h: 0.60 },
  P5: { epi: 0.70, alpha: 0.60, beta: 2.5, h: 0.68 },
  P6: { epi: 0.85, alpha: 0.30, beta: 1.5, h: 0.60 },
  P7: { epi: 0.75, alpha: 0.70, beta: 2.0, h: 0.45 },
  P8: { epi: 0.60, alpha: 0.95, beta: 4.5, h: 0.58 },
};

// Normalisation ranges for each axis
const RANGES = {
  epi:   { min: 0.45, max: 0.85 },
  alpha: { min: 0.30, max: 0.95 },
  beta:  { min: 1.5,  max: 4.5  },
  h:     { min: 0.45, max: 0.80 },
};

// Map answer indices (0-3) to normalised values
const Q_TO_VALUE = {
  Q1: [0.50, 0.60, 0.70, 0.85],  // epi
  Q2: [0.90, 0.70, 0.58, 0.35],  // alpha
  Q3: [4.25, 3.25, 2.25, 1.50],  // beta
  Q4: [0.80, 0.67, 0.45, null],  // h (Q4 has 3 options)
};

function matchProfile(answers) {
  // answers = { Q1: 0-3, Q2: 0-3, Q3: 0-3, Q4: 0-2 }
  const user = {
    epi:   Q_TO_VALUE.Q1[answers.Q1],
    alpha: Q_TO_VALUE.Q2[answers.Q2],
    beta:  Q_TO_VALUE.Q3[answers.Q3],
    h:     Q_TO_VALUE.Q4[answers.Q4],
  };
  
  let bestProfile = 'P3';
  let minDist = Infinity;
  
  for (const [id, coords] of Object.entries(PROFILE_COORDS)) {
    const dist = ['epi', 'alpha', 'beta', 'h'].reduce((sum, dim) => {
      const norm = (v) => (v - RANGES[dim].min) / (RANGES[dim].max - RANGES[dim].min);
      return sum + Math.abs(norm(user[dim]) - norm(coords[dim]));
    }, 0);
    if (dist < minDist) { minDist = dist; bestProfile = id; }
  }
  
  return bestProfile;
}
```

---

## BLOC 6 — FLOATING CARD (#8 — profil flottant)

### Template exact

```
┌─────────────────────────────────────────────┐
│  Your profile                               │
│  ─────────────────────────────────────────  │
│  Closest to: [PROFILE_NAME] · [CITY]        │
│                                             │
│  P99 risk index: [P99_THETA_G0]             │
│  ↑ [PREMIUM_PCT]% above pre-AI baseline     │
│                                             │
│  [RADAR 5 AXES — see spec below]            │
│                                             │
│  [STACK_LABEL] · [TALENT_LABEL]             │
│  [DOMAIN_LABEL] · [DIVERSITY_LABEL]         │
└─────────────────────────────────────────────┘
```

### Variables template

| Variable | Source | Example (P3 Paris) |
|----------|--------|-------------------|
| `PROFILE_NAME` | PROFILES[id].name | "Strategy consulting" |
| `CITY` | PROFILES[id].city | "Paris" |
| `P99_THETA_G0` | PROFILES[id].p99G0 | "2,041" |
| `PREMIUM_PCT` | (p99G0 / 1097 − 1) × 100 | "+86%" |
| `STACK_LABEL` | see label map below | "Centralised stack" |
| `TALENT_LABEL` | see label map below | "Elite talent" |
| `DOMAIN_LABEL` | see label map below | "Outside-frontier domain" |
| `DIVERSITY_LABEL` | see label map below | "Homogeneous pipeline" |

### Radar axes (5 dimensions, normalised 0→1, higher = more risk)

```javascript
// src/data/radarAxes.js

export const RADAR_AXES = [
  {
    key:   'stack',
    label: 'Stack concentration',
    value: (p) => p.alpha,           // already 0–1
    tooltip: 'α — share of decisions routed through a single AI provider',
  },
  {
    key:   'domain',
    label: 'Outside-frontier exposure',
    value: (p) => 1 - p.epi,         // invert: high epi = low risk
    tooltip: 'E[π] — fraction of decisions outside AI training distribution',
  },
  {
    key:   'homogeneity',
    label: 'Cognitive homogeneity',
    value: (p) => (p.beta - 1.5) / 3.0,  // normalise Beta 1.5→4.5 to 0→1
    tooltip: 'Beta(a,a) — labour market pipeline concentration',
  },
  {
    key:   'talent',
    label: 'Elite talent exposure',
    value: (p) => p.p99G0 > 2100 ? 0.85 :
                  p.p99G0 > 1900 ? 0.60 : 0.35,
    // Proxy: elite talent + concentrated stack = maximum relative loss
    tooltip: 'h — independent judgment competence vs AI outside-frontier accuracy',
  },
  {
    key:   'governance',
    label: 'Governance effectiveness',
    value: (p) => Math.max(0, -p.scaffold),  // negative scaffold = governance fails
    tooltip: 'scaffold_benefit — governance efficiency: output gain per unit of risk reduction',
  },
];
```

### Label maps (displayed in card footer)

```javascript
export const STACK_LABELS = {
  alpha_lo:  { range: [0.00, 0.45], label: 'Diversified stack',   color: '#4A7C59' },
  alpha_mid: { range: [0.45, 0.75], label: 'Moderate stack',      color: '#C49A3C' },
  alpha_hi:  { range: [0.75, 1.00], label: 'Centralised stack',   color: '#B5403F' },
};

export const TALENT_LABELS = {
  elite:   { profiles: ['P2','P3'],               label: 'Elite talent' },
  mid:     { profiles: ['P1','P4','P5','P8'],     label: 'Professional talent' },
  ops:     { profiles: ['P6','P7'],               label: 'Operational talent' },
};

export const DOMAIN_LABELS = {
  outside: { epi_max: 0.55, label: 'Outside-frontier domain' },
  mixed:   { epi_max: 0.75, label: 'Mixed-frontier domain'   },
  inside:  { epi_max: 1.00, label: 'Inside-frontier domain'  },
};

export const DIVERSITY_LABELS = {
  diverse:    { beta_max: 2.0, label: 'International pipeline' },
  standard:   { beta_max: 3.0, label: 'Mixed pipeline'         },
  homogeneous:{ beta_max: 5.0, label: 'Homogeneous pipeline'   },
};
```

### Card behaviour spec

- Appears: after Q4 answer is submitted (profile identified)
- Position: fixed bottom-right, 280px wide, z-index above content
- Persist: throughout the rest of the scroll (sections C, D, and static pages)
- Update: if user retakes questionnaire, card updates with animation (fade in)
- Collapse: on mobile, show only profile name + P99 index, expand on tap
- Scaffold signal: if `scaffold < 0`, show a small ⚠ badge next to profile name with tooltip: "Active governance is counterproductive for this profile — see C-WI"

---

## BLOC 7 — LINKS

```
essay_title:   "The Flattening: Invisible Tail Risk in AI-Adopting Organisations"
essay_venue:   "Cambridge–McKinsey Risk Prize 2026"
essay_pdf:     "[URL — add when available]"
github:        "[URL — add when available]"
cartesia_url:  "[URL — add when available]"

author_bio: "Bilel Tounsi is a Part III Mathematical Statistics student at the University of Cambridge (Lent 2026) and founder of CartesIA, a psychometric AI platform spanning HR assessment, mental health triage, and youth orientation. This essay and its companion application were developed as part of the Cambridge–McKinsey Risk Prize 2026 submission."

disclaimer: "This application accompanies an academic essay submitted to the Cambridge–McKinsey Risk Prize 2026. All simulation results are stress tests under stated assumptions — not empirical predictions. No user data is collected or stored."
```
