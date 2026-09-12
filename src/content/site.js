// ── Site-wide content ────────────────────────────────────────────────────────
// Everything the personal site says about its author lives here, never in
// JSX. Placeholders are tagged [TODO: …] so a grep finds what is left to
// write. English only.

import { SITE, FLATTENING_BASE } from '../routes';

export const SITE_META = {
  name: 'Bilel Hatmi',
  // Tab title suffix and OG title
  title: 'Bilel Hatmi',
  description:
    'Mathematical statistics, causal inference and AI risk. Part III at the University of Cambridge, founder of CartesIA.',
};

export const NAV_LINKS = [
  { label: 'Projects',  to: SITE.projects },
  { label: 'Journey',   to: SITE.journey },
  { label: 'Notes',     to: SITE.notes },
  { label: 'Documents', to: SITE.documents },
];

export const PERSON = {
  name: 'Bilel Hatmi',
  tagline: '[TODO: one line that says what you work on, e.g. "Statistics for decisions people still have to make."]',
  affiliation: 'University of Cambridge',
  role: 'Part III Mathematical Statistics, DPMMS. Founder of CartesIA.',
  location: 'Cambridge, UK',
  email: 'bilelhatmi@gmail.com',
  // Short version for the home hero (2–3 sentences)
  shortBio:
    '[TODO: two or three sentences. What you study, what you build, and the thread that connects them.]',
  // Long version, seeded from the former /about page of the explorer
  longBio:
    'Bilel Hatmi is a Part III student in Mathematical Statistics at the University of Cambridge (DPMMS), where his dissertation develops semiparametric methods for proximal causal inference under unmeasured confounding, supervised by Dr P. Zhao and Prof. Q. Zhao. He holds a Grande École degree from CentraleSupélec (top 1% of cohort), with prior work on subjective well-being measurement over a twenty-year longitudinal panel, stochastic modelling of blood cancers at the Gustave Roussy Institute, and AI deployments in a strategy consulting context at Eleven Strategy, where productivity metrics and decision quality routinely pointed in different directions. He is the founder of CartesIA, a research project on AI-assisted psychometric measurement.',
  links: [
    { label: 'GitHub',   href: 'https://github.com/bilel-hatmi', external: true },
    { label: 'LinkedIn', href: '[TODO: LinkedIn URL]', external: true },
    { label: 'CV',       href: '/docs/cv.pdf', external: true },
  ],
  // Portrait for the home hero. Drop a file in public/ and set the path;
  // the hero renders a neutral monogram while this is null.
  portrait: null,
};

// The explorer, as the personal site presents it
export const FLATTENING = {
  title: 'The Flattening',
  kicker: 'Interactive explorer',
  summary:
    'AI optimises the mean and concentrates the tail. An essay and an interactive model for the Cambridge–McKinsey Risk Prize 2026: four acts of analysis and a parameter laboratory.',
  to: FLATTENING_BASE,
  cta: 'Open the explorer',
  counters: [
    { label: 'Average loss',     value: '−38%', tone: 'success' },
    { label: 'Worst-case (P99)', value: '+56%',      tone: 'danger' },
    { label: 'Output',           value: '+54%',      tone: 'success' },
  ],
};
