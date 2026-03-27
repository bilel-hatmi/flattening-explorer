/**
 * questionnaire.js — Profile matching system for The Flattening Explorer
 * Source: model_content.md BLOC 5 (Questionnaire), BLOC 6 (Floating Card), BLOC 7 (Links)
 * DO NOT EDIT values without validation from orchestrateur modelisateur.
 */

// ============================================================================
// BLOC 5 — QUESTIONNAIRE (5 questions, scroll-embedded)
// ============================================================================

export const QUESTIONS = [
  // ── Q1 — Domain exposure ──────────────────────────────────────────────
  // Placed: between A2 and B3 (after the paradox is established, before the mechanisms)
  {
    id: 'Q1',
    dimension: 'domain',       // maps to epi (E[pi])
    question: 'What is your organisation\'s primary AI use domain?',
    options: [
      {
        key: 'A',
        label: 'Strategy, M&A, legal reasoning',
        mapping: 'E[pi] = 0.45-0.55 (outside-heavy)',
        profilePointers: ['P3', 'P4'],
      },
      {
        key: 'B',
        label: 'Analytics, audit, risk management',
        mapping: 'E[pi] = 0.55-0.65 (balanced)',
        profilePointers: ['P1', 'P2'],
      },
      {
        key: 'C',
        label: 'Tech, operations, product',
        mapping: 'E[pi] = 0.65-0.75 (inside-leaning)',
        profilePointers: ['P5', 'P7'],
      },
      {
        key: 'D',
        label: 'Creative, marketing, content',
        mapping: 'E[pi] = 0.80-0.90 (inside-dominant)',
        profilePointers: ['P6'],
      },
    ],
  },

  // ── Q2 — Stack architecture ───────────────────────────────────────────
  // Placed: between C2 and C3 (after the stack chart C2 shows alpha as the dominant lever)
  {
    id: 'Q2',
    dimension: 'alpha',        // stack concentration
    question: 'How is your AI stack organised?',
    options: [
      {
        key: 'A',
        label: 'One model for everyone, centrally procured',
        mapping: 'alpha = 0.85-0.95',
        profilePointers: ['P4', 'P8'],
      },
      {
        key: 'B',
        label: 'One main model, some team-level alternatives',
        mapping: 'alpha = 0.65-0.75',
        profilePointers: ['P1', 'P7'],
      },
      {
        key: 'C',
        label: 'Each team selects its own tools',
        mapping: 'alpha = 0.50-0.65',
        profilePointers: ['P5'],
      },
      {
        key: 'D',
        label: 'Deliberately diversified, multiple providers by layer',
        mapping: 'alpha = 0.25-0.45',
        profilePointers: ['P2', 'P6'],
      },
    ],
  },

  // ── Q3 — Talent pipeline ──────────────────────────────────────────────
  // Placed: between C5 and C6 (after the regressivity slope chart shows Beta as the second lever)
  {
    id: 'Q3',
    dimension: 'beta',         // labour market cognitive homogeneity
    question: 'Where does your primary talent come from?',
    options: [
      {
        key: 'A',
        label: 'National competitive examination (France, Korea, Japan\u2026)',
        mapping: 'Beta(a,a), a = 4.0-4.5',
        profilePointers: ['P3', 'P8'],
      },
      {
        key: 'B',
        label: 'National university system (Germany, Italy, Spain\u2026)',
        mapping: 'Beta(a,a), a = 3.0-3.5',
        profilePointers: ['P1', 'P4'],
      },
      {
        key: 'C',
        label: 'Competitive national + some international',
        mapping: 'Beta(a,a), a = 2.0-2.5',
        profilePointers: ['P5', 'P7'],
      },
      {
        key: 'D',
        label: 'International hub, 20+ nationalities',
        mapping: 'Beta(a,a), a = 1.5',
        profilePointers: ['P2', 'P6'],
      },
    ],
  },

  // ── Q4 — Talent tier ─────────────────────────────────────────────────
  // Placed: between C6 and C-WI (completing the profile portrait before the what-if)
  {
    id: 'Q4',
    dimension: 'h',            // talent level / independent judgment
    question: 'What best describes your team\'s expertise level?',
    options: [
      {
        key: 'A',
        label: 'Elite \u2014 top-decile hires, independent judgment strong',
        mapping: 'h ~ U(0.65, 0.95), p0 = 0.70',
        profilePointers: ['P2', 'P3'],
      },
      {
        key: 'B',
        label: 'Standard professional \u2014 solid execution, some AI reliance',
        mapping: 'h ~ U(0.50, 0.85), p0 = 0.75-0.80',
        profilePointers: ['P1', 'P4', 'P5'],
      },
      {
        key: 'C',
        label: 'Operational / technical \u2014 structured tasks, process-driven',
        mapping: 'h ~ U(0.30, 0.60), p0 = 0.85',
        profilePointers: ['P7'],
      },
    ],
  },

  // ── Q5 — Organisation size ────────────────────────────────────────────
  // Placed: between D2-BIS and D-NASH (after supply chain risk is established, before the governance trap)
  // Q5 modulates the narrative frame (risk absorption), NOT the profile assignment
  {
    id: 'Q5',
    dimension: 'omega',        // organisation size — narrative only
    question: 'What is your organisation\'s size?',
    options: [
      {
        key: 'A',
        label: 'Startup (1\u201350)',
        mapping: 'Tail risk externalised \u2014 absorbed by clients and ecosystem',
        riskImplication: 'Nash: G0 rational',
        profilePointers: [],
      },
      {
        key: 'B',
        label: 'Mid-market (50\u2013500)',
        mapping: '~60% of tail risk absorbed internally',
        riskImplication: 'Governance viable',
        profilePointers: [],
      },
      {
        key: 'C',
        label: 'Corporate (500+)',
        mapping: 'Full tail risk absorption + supplier contagion',
        riskImplication: 'Regulation target',
        profilePointers: [],
      },
    ],
  },
];

// ============================================================================
// PROFILE MATCHING — Manhattan distance on 4 normalised dimensions
// ============================================================================

/**
 * Profile coordinates in the 4D parameter space.
 * h = midpoint of the U(h_lo, h_hi) range for each profile.
 */
export const PROFILE_COORDS = {
  P1: { epi: 0.50, alpha: 0.70, beta: 3.5, h: 0.70 },
  P2: { epi: 0.55, alpha: 0.40, beta: 1.5, h: 0.80 },
  P3: { epi: 0.55, alpha: 0.90, beta: 4.0, h: 0.80 },
  P4: { epi: 0.45, alpha: 0.90, beta: 3.0, h: 0.60 },
  P5: { epi: 0.70, alpha: 0.60, beta: 2.5, h: 0.68 },
  P6: { epi: 0.85, alpha: 0.30, beta: 1.5, h: 0.60 },
  P7: { epi: 0.75, alpha: 0.70, beta: 2.0, h: 0.45 },
  P8: { epi: 0.60, alpha: 0.95, beta: 4.5, h: 0.58 },
};

/** Normalisation ranges for each axis (min/max across all profiles). */
export const RANGES = {
  epi:   { min: 0.45, max: 0.85 },
  alpha: { min: 0.30, max: 0.95 },
  beta:  { min: 1.5,  max: 4.5  },
  h:     { min: 0.45, max: 0.80 },
};

/**
 * Map answer indices (0-based) to continuous parameter values.
 * Q4 has only 3 options — index 3 is null.
 */
export const Q_TO_VALUE = {
  Q1: [0.50, 0.60, 0.70, 0.85],        // epi (domain exposure)
  Q2: [0.90, 0.70, 0.58, 0.35],        // alpha (stack concentration)
  Q3: [4.25, 3.25, 2.25, 1.50],        // beta (talent pipeline homogeneity)
  Q4: [0.80, 0.67, 0.45, null],        // h (talent tier) — 3 options only
};

/**
 * Match user answers to the nearest organisational profile (P1-P8).
 *
 * Uses Manhattan distance on 4 normalised dimensions (epi, alpha, beta, h).
 * Q5 (organisation size) modulates the narrative frame only — it does not
 * affect profile assignment.
 *
 * @param {Object} answers - { Q1: 0-3, Q2: 0-3, Q3: 0-3, Q4: 0-2 }
 * @returns {string} Profile ID ('P1' through 'P8')
 */
// Map letter keys (A/B/C/D) to indices (0/1/2/3)
const KEY_TO_IDX = { A: 0, B: 1, C: 2, D: 3 };

export function matchProfile(answers) {
  // answers comes from ProfileContext: { domain: 'A', alpha: 'B', beta: 'C', h: 'A' }
  const domainIdx = KEY_TO_IDX[answers.domain] ?? null;
  const alphaIdx = KEY_TO_IDX[answers.alpha] ?? null;
  const betaIdx = KEY_TO_IDX[answers.beta] ?? null;
  const hIdx = KEY_TO_IDX[answers.h] ?? null;

  const user = {
    epi:   domainIdx != null ? Q_TO_VALUE.Q1[domainIdx] : 0.55,
    alpha: alphaIdx != null ? Q_TO_VALUE.Q2[alphaIdx] : 0.70,
    beta:  betaIdx != null ? Q_TO_VALUE.Q3[betaIdx] : 4.0,
    h:     hIdx != null ? Q_TO_VALUE.Q4[hIdx] : 0.80,
  };

  let bestProfile = 'P3';
  let minDist = Infinity;

  for (const [id, coords] of Object.entries(PROFILE_COORDS)) {
    const dist = ['epi', 'alpha', 'beta', 'h'].reduce((sum, dim) => {
      const norm = (v) => (v - RANGES[dim].min) / (RANGES[dim].max - RANGES[dim].min);
      return sum + Math.abs(norm(user[dim]) - norm(coords[dim]));
    }, 0);
    if (dist < minDist) {
      minDist = dist;
      bestProfile = id;
    }
  }

  return bestProfile;
}

// ============================================================================
// BLOC 6 — FLOATING CARD (profile card, sticky bottom-right)
// ============================================================================

/**
 * Radar axes for the 5-dimension mini chart in the floating card.
 * All values normalised 0-1. Higher = more risk.
 */
export const RADAR_AXES = [
  {
    key:     'stack',
    label:   'Stack concentration',
    value:   (p) => p.alpha,                          // already 0-1
    tooltip: '\u03B1 \u2014 share of decisions routed through a single AI provider',
  },
  {
    key:     'domain',
    label:   'Outside-frontier exposure',
    value:   (p) => 1 - p.epi,                        // invert: high epi = low risk
    tooltip: 'E[\u03C0] \u2014 fraction of decisions outside AI training distribution',
  },
  {
    key:     'homogeneity',
    label:   'Cognitive homogeneity',
    value:   (p) => (p.beta - 1.5) / 3.0,             // normalise Beta 1.5->4.5 to 0->1
    tooltip: 'Beta(a,a) \u2014 labour market pipeline concentration',
  },
  {
    key:     'talent',
    label:   'Elite talent exposure',
    value:   (p) => p.p99G0 > 2100 ? 0.85
                  : p.p99G0 > 1900 ? 0.60
                  : 0.35,
    // Proxy: elite talent + concentrated stack = maximum relative loss
    tooltip: 'h \u2014 independent judgment competence vs AI outside-frontier accuracy',
  },
  {
    key:     'governance',
    label:   'Governance effectiveness',
    value:   (p) => Math.max(0, -p.scaffold),          // negative scaffold = governance fails
    tooltip: 'scaffold_benefit \u2014 governance efficiency: output gain per unit of risk reduction',
  },
];

/** Label maps — displayed in floating card footer. */
export const STACK_LABELS = {
  alpha_lo:  { range: [0.00, 0.45], label: 'Diversified stack',   color: '#4A7C59' },
  alpha_mid: { range: [0.45, 0.75], label: 'Moderate stack',      color: '#C49A3C' },
  alpha_hi:  { range: [0.75, 1.00], label: 'Centralised stack',   color: '#B5403F' },
};

export const TALENT_LABELS = {
  elite: { profiles: ['P2', 'P3'],               label: 'Elite talent' },
  mid:   { profiles: ['P1', 'P4', 'P5', 'P8'],   label: 'Professional talent' },
  ops:   { profiles: ['P6', 'P7'],               label: 'Operational talent' },
};

export const DOMAIN_LABELS = {
  outside: { epi_max: 0.55, label: 'Outside-frontier domain' },
  mixed:   { epi_max: 0.75, label: 'Mixed-frontier domain'   },
  inside:  { epi_max: 1.00, label: 'Inside-frontier domain'  },
};

export const DIVERSITY_LABELS = {
  diverse:     { beta_max: 2.0, label: 'International pipeline' },
  standard:    { beta_max: 3.0, label: 'Mixed pipeline'         },
  homogeneous: { beta_max: 5.0, label: 'Homogeneous pipeline'   },
};

/**
 * Compute the premium percentage for the floating card.
 * PREMIUM_PCT = (p99G0 / baseline_p99 - 1) * 100
 * Baseline P99 (pre-AI) = 1097 from v5_reference.js
 */
export const BASELINE_P99 = 1097;

export function computePremiumPct(p99G0) {
  return Math.round((p99G0 / BASELINE_P99 - 1) * 100);
}

/**
 * Resolve the stack label for a given alpha value.
 * @param {number} alpha
 * @returns {{ label: string, color: string }}
 */
export function getStackLabel(alpha) {
  if (alpha < 0.45) return STACK_LABELS.alpha_lo;
  if (alpha < 0.75) return STACK_LABELS.alpha_mid;
  return STACK_LABELS.alpha_hi;
}

/**
 * Resolve the talent label for a given profile ID.
 * @param {string} profileId - 'P1' through 'P8'
 * @returns {string}
 */
export function getTalentLabel(profileId) {
  for (const tier of Object.values(TALENT_LABELS)) {
    if (tier.profiles.includes(profileId)) return tier.label;
  }
  return 'Professional talent';
}

/**
 * Resolve the domain label for a given epi value.
 * @param {number} epi
 * @returns {string}
 */
export function getDomainLabel(epi) {
  if (epi <= 0.55) return DOMAIN_LABELS.outside.label;
  if (epi <= 0.75) return DOMAIN_LABELS.mixed.label;
  return DOMAIN_LABELS.inside.label;
}

/**
 * Resolve the diversity label for a given beta value.
 * @param {number} beta
 * @returns {string}
 */
export function getDiversityLabel(beta) {
  if (beta <= 2.0) return DIVERSITY_LABELS.diverse.label;
  if (beta <= 3.0) return DIVERSITY_LABELS.standard.label;
  return DIVERSITY_LABELS.homogeneous.label;
}

/**
 * Floating card behaviour spec:
 * - Appears: after Q4 answer is submitted (profile identified)
 * - Position: fixed bottom-right, 280px wide, z-index above content
 * - Persist: throughout the rest of the scroll (sections C, D, and static pages)
 * - Update: if user retakes questionnaire, card updates with animation (fade in)
 * - Collapse: on mobile, show only profile name + P99 index, expand on tap
 * - Scaffold signal: if scaffold < 0, show a small warning badge next to profile name
 *   with tooltip: "Active governance is counterproductive for this profile -- see C-WI"
 */

// ============================================================================
// BLOC 7 — LINKS
// ============================================================================

export const LINKS = {
  essay_title:  'The Flattening: Invisible Tail Risk in AI-Adopting Organisations',
  essay_venue:  'Cambridge\u2013McKinsey Risk Prize 2026',
  essay_pdf:    '[URL \u2014 add when available]',
  github:       '[URL \u2014 add when available]',
  cartesia_url: '[URL \u2014 add when available]',
};

export const AUTHOR_BIO = 'Bilel Hatmi is a Part III Mathematical Statistics student at the University of Cambridge and founder of CartesIA, a psychometric AI platform spanning HR assessment, mental health triage, and youth orientation. This essay and its companion application were developed as part of the Cambridge\u2013McKinsey Risk Prize 2026 submission.';

export const DISCLAIMER = 'This application accompanies an academic essay submitted to the Cambridge\u2013McKinsey Risk Prize 2026. All simulation results are stress tests under stated assumptions \u2014 not empirical predictions. No user data is collected or stored.';
