// ── Site-wide content ────────────────────────────────────────────────────────
// Everything the personal site says about its author lives here, never in
// JSX. English only. Sources: the LinkedIn About and headline Bilel wrote on
// 17 September 2026, CV v8, the applications bank. Strings may carry **bold**
// spans (rendered by utils/inline.js) to guide the reading.

import { SITE, FLATTENING_BASE } from '../routes';
import { stripInline } from '../utils/inline';

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
  // The full About, in the order Bilel asked for. `lines` renders as a list.
  bio: {
    intro:
      'I am an **early-career independent researcher** (CentraleSupélec, Cambridge) studying the dynamics of AI on the technical side as much as on the governance side. My work is an attempt to **recentre AI on benefits that belong to human capital**, while limiting the safety drift that its uncontrolled adoption produces today.',
    origin:
      'That attachment was born at **Elements Impact**, where I worked on the mathematical modelling of well-being, and it met the field at **Eleven Strategy**: as an AI consultant, I dealt with the problems companies face when they adopt AI.',
    training:
      'A year of statistics at **Cambridge** gave me the full modelling toolkit I wanted. My dissertation is in **causal inference**, the central applied field of statistics, where empirical studies still mix in a treatment of causality that is often basic, or naive. **CentraleSupélec** had given me the complete training of a data scientist.',
    linesLead: 'My research includes:',
    lines: [
      { text: '**the modelling of the cognitive homogenisation associated with AI**, rewarded at the Cambridge–McKinsey Risk Prize 2026 (finalist);', to: `${SITE.projects}/the-flattening` },
      { text: '**the modelling and study of four structural properties of LLMs**, which generate the constructs attributed to them, such as sycophancy or malice: epistemic validity, procedural validity, direction, directional entropy;', to: `${SITE.projects}/srie-sycophancy` },
      { text: '**the application of LLMs to learning**, on parametric structures built from knowledge spaces;', to: `${SITE.projects}/srie-tutor` },
      { text: '**the application of LLMs to the mediation of disputes** under confidentiality constraints.', to: `${SITE.projects}/srie-mediation` },
    ],
    linesClose: 'Since July 2026 I supervise the last three at **SRIE**, with seven Cambridge mathematics undergraduates.',
    closing: 'I am attentive to any offer or collaboration within this perimeter.',
  },
  links: [
    { label: 'GitHub',   href: 'https://github.com/bilel-hatmi', external: true, icon: 'github' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/bilel-hatmi', external: true, icon: 'linkedin' },
    { label: 'CV',       href: '/docs/cv.pdf', external: true, icon: 'cv' },
  ],
  portrait: '/portrait.jpg',
};

// Flat text of the bio, without the bold markers, for places that cannot
// render a list (the explorer's About page).
export const BIO_TEXT = [
  PERSON.bio.intro,
  PERSON.bio.origin,
  PERSON.bio.training,
  `${PERSON.bio.linesLead} ${PERSON.bio.lines.map(l => l.text).join(' ')} ${PERSON.bio.linesClose}`,
  PERSON.bio.closing,
].map(stripInline);

// The explorer, as the personal site presents it. Counter values are numbers
// so the home page can count them up; `unit` is appended after the sign.
export const FLATTENING = {
  title: 'The Flattening',
  kicker: 'Finalist, Cambridge–McKinsey Risk Prize 2026',
  summary:
    'What does AI adoption do to firms of different sizes and domains, on cognitive diversity, productivity and losses? An essay, a Monte Carlo model and an interactive explorer: four acts of analysis and a parameter laboratory, with the simulation engine running in the browser.',
  schemaCaption: 'The mechanism, as drawn on the poster',
  to: FLATTENING_BASE,
  cta: 'Open the explorer',
  counters: [
    { label: 'Expected loss',        value: -38, unit: '%', tone: 'success' },
    { label: 'Worst quarter in 100', value: 56,  unit: '%', tone: 'danger' },
    { label: 'Reported output',      value: 54,  unit: '%', tone: 'success' },
  ],
};

export const formatCounter = (value, unit = '') => `${value < 0 ? '−' : '+'}${Math.abs(value)}${unit}`;
