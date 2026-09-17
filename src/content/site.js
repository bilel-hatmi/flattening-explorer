// ── Site-wide content ────────────────────────────────────────────────────────
// Everything the personal site says about its author lives here, never in
// JSX. English only. Sources: the LinkedIn About and headline Bilel wrote on
// 17 September 2026, CV v8, the applications bank.

import { SITE, FLATTENING_BASE } from '../routes';

export const SITE_META = {
  name: 'Bilel Hatmi',
  // Tab title suffix and OG title
  title: 'Bilel Hatmi',
  description:
    'AI safety researcher: psychometrics of LLMs, cognitive erosion, AI mediation. Research supervisor at SRIE; Part III Mathematical Statistics, Cambridge; CentraleSupélec.',
};

export const NAV_LINKS = [
  { label: 'Research',  to: SITE.research },
  { label: 'Projects',  to: SITE.projects },
  { label: 'Journey',   to: SITE.journey },
  { label: 'Documents', to: SITE.documents },
];

export const PERSON = {
  name: 'Bilel Hatmi',
  tagline: 'AI in the service of human capital.',
  affiliation: 'SRIE · University of Cambridge',
  role: 'AI safety researcher · Research supervisor at SRIE · Cambridge Part III · CentraleSupélec',
  location: 'Cambridge, UK',
  email: 'bilelhatmi@gmail.com',
  // Home hero: the opening of the LinkedIn About, in English
  shortBio:
    'An early-career independent researcher (CentraleSupélec, Cambridge) studying the dynamics of AI on the technical side as much as on the governance side. My work is an attempt to recentre AI on benefits that belong to human capital, while limiting the safety drift that its uncontrolled adoption produces today.',
  // Journey page header: the full About, in the order Bilel asked for
  longBio: [
    'I am an early-career independent researcher (CentraleSupélec, Cambridge) studying the dynamics of AI on the technical side as much as on the governance side. My work is an attempt to recentre AI on benefits that belong to human capital, while limiting the safety drift that its uncontrolled adoption produces today.',
    'That attachment was born at Elements Impact, where I worked on the mathematical modelling of well-being, and it was tested in the field at Eleven Strategy, where as an AI consultant I dealt with the problems companies meet when they adopt AI. A year of statistics at Cambridge gave me the full modelling toolkit I wanted: my dissertation is in causal inference, the central applied field of statistics, where empirical studies still mix in a treatment of causality that is often basic, or naive. CentraleSupélec had given me the complete training of a data scientist.',
    'My research today runs along four lines: the modelling of the cognitive homogenisation associated with AI, rewarded at the Cambridge–McKinsey Risk Prize 2026; the modelling of four structural properties of LLMs that generate constructs such as sycophancy or malice, epistemic validity, procedural validity, direction and directional entropy; the application of LLMs to learning, on parametric structures built from knowledge spaces; and the application of LLMs to the mediation of disputes under confidentiality constraints. Since July 2026 I supervise these three last projects at SRIE, with seven Cambridge mathematics undergraduates.',
    'I am attentive to any offer or collaboration within this perimeter.',
  ],
  links: [
    { label: 'GitHub',   href: 'https://github.com/bilel-hatmi', external: true },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/bilel-hatmi', external: true },
    { label: 'CV',       href: '/docs/cv.pdf', external: true },
  ],
  portrait: '/portrait.jpg',
};

// The explorer, as the personal site presents it
export const FLATTENING = {
  title: 'The Flattening',
  kicker: 'Finalist, Cambridge–McKinsey Risk Prize 2026',
  summary:
    'What does AI adoption do to firms of different sizes and domains, on cognitive diversity, productivity and losses? An essay, a Monte Carlo model and an interactive explorer: four acts of analysis and a parameter laboratory, with the simulation engine running in the browser.',
  to: FLATTENING_BASE,
  cta: 'Open the explorer',
  counters: [
    { label: 'Expected loss',     value: '−38%', tone: 'success' },
    { label: 'Worst quarter in 100', value: '+56%',   tone: 'danger' },
    { label: 'Reported output',   value: '+54%',      tone: 'success' },
  ],
};
