// ── Site-wide content ────────────────────────────────────────────────────────
// Everything the personal site says about its author lives here, never in
// JSX. English only. Sources: CV (September 2026), SRIE project brief,
// CartesIA partners plan, the Part III essay.

import { SITE, FLATTENING_BASE } from '../routes';

export const SITE_META = {
  name: 'Bilel Hatmi',
  // Tab title suffix and OG title
  title: 'Bilel Hatmi',
  description:
    'Applied mathematician (CentraleSupélec; Part III, Cambridge) working on the means to make AI more beneficial to society and less alienating.',
};

export const NAV_LINKS = [
  { label: 'Projects',  to: SITE.projects },
  { label: 'Journey',   to: SITE.journey },
  { label: 'Notes',     to: SITE.notes },
  { label: 'Documents', to: SITE.documents },
];

export const PERSON = {
  name: 'Bilel Hatmi',
  tagline: 'Applied mathematician working on the means to make AI more beneficial to society and less alienating.',
  affiliation: 'SRIE · University of Cambridge',
  role: 'Resident researcher and research supervisor at SRIE. Part III Mathematical Statistics, DPMMS. Founder of CartesIA.',
  location: 'Cambridge, UK',
  email: 'bilelhatmi@gmail.com',
  // Short version for the home hero (2–3 sentences)
  shortBio:
    'My interests combine the psychometrics of AI models with AI applied to education and learning, and to conflict resolution through game theory. At SRIE, I supervise three projects I designed on these questions, with seven Cambridge mathematics undergraduates.',
  // Long version, for the journey page
  longBio:
    'Bilel Hatmi is an applied mathematician trained at CentraleSupélec and at the University of Cambridge, where he completed Part III in Mathematical Statistics (DPMMS) in June 2026 with a dissertation on proximal causal inference under unmeasured confounding, supervised by Dr P. Zhao and Prof. Q. Zhao. He is a finalist of the Cambridge–McKinsey Risk Prize 2026 for The Flattening, an essay and a model on the tail risk that AI productivity gains conceal. Since July 2026 he has been a resident researcher and research supervisor at SRIE, where he runs three projects he designed for Cambridge mathematics undergraduates on what AI does to the people who use it. Earlier work covered subjective well-being measurement on a twenty-year panel (Elements Impact), stochastic modelling of blood cancers with the Gustave Roussy Institute (MICS Lab, CentraleSupélec), and AI deployments in strategy consulting (Eleven Strategy). He is the founder of CartesIA, a research project treating language models as controlled measurement instruments for psychometrics.',
  links: [
    { label: 'GitHub',   href: 'https://github.com/bilel-hatmi', external: true },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/bilel-hatmi', external: true },
    { label: 'CV',       href: '/docs/cv.pdf', external: true },
  ],
  // Portrait for the home hero. Drop a file in public/ and set the path;
  // the hero renders a monogram while this is null.
  portrait: '/portrait.jpg',
};

// The explorer, as the personal site presents it
export const FLATTENING = {
  title: 'The Flattening',
  kicker: 'Finalist, Cambridge–McKinsey Risk Prize 2026',
  summary:
    'AI optimises the mean and concentrates the tail. An essay, a Monte Carlo model and an interactive explorer on how AI productivity gains conceal tail risk inside organisations: four acts of analysis and a parameter laboratory.',
  to: FLATTENING_BASE,
  cta: 'Open the explorer',
  counters: [
    { label: 'Average loss',     value: '−38%', tone: 'success' },
    { label: 'Worst-case (P99)', value: '+56%',      tone: 'danger' },
    { label: 'Output',           value: '+54%',      tone: 'success' },
  ],
};
