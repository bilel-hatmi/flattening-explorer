// ── Journey (timeline) ───────────────────────────────────────────────────────
// Newest first. `kind` picks the marker colour: education, research, work,
// venture. `to` links to a project page, `href` to an external document.
// Dates follow the CV (September 2026).

import { SITE } from '../routes';

export const JOURNEY = [
  {
    id: 'srie',
    period: 'Jul 2026 – present',
    title: 'Resident researcher and research supervisor',
    org: 'SRIE',
    place: 'Cambridge, UK',
    kind: 'research',
    summary: 'Eight-week AI-safety placements for Cambridge mathematics undergraduates. Seven students on three projects I designed: sycophancy as a set of constructs, mediation under confidentiality constraints, an AI tutor against cognitive surrender.',
    to: `${SITE.projects}/srie-2026`,
  },
  {
    id: 'risk-prize',
    period: 'Mar – Jul 2026',
    title: 'Finalist, Cambridge–McKinsey Risk Prize',
    org: 'Cambridge Centre for Risk Studies, Judge Business School',
    place: 'Cambridge, UK',
    kind: 'research',
    summary: 'The Flattening: essay, Monte Carlo model and interactive explorer on how AI productivity gains conceal tail risk. One of four finalists.',
    to: `${SITE.projects}/the-flattening`,
  },
  {
    id: 'part-iii',
    period: '2023 – 2026',
    title: 'MASt in Mathematical Statistics (Part III)',
    org: 'University of Cambridge, DPMMS',
    place: 'Cambridge, UK',
    kind: 'education',
    summary: 'Essay on proximal causal inference under unmeasured confounding, supervised by Dr P. Zhao and Prof. Q. Zhao, submitted May 2026. Courses in causal inference, robust statistics, modern statistical methods, information theory, advanced probability. Degree completed June 2026, after an intermission for health.',
    to: `${SITE.projects}/part-iii-dissertation`,
  },
  {
    id: 'cartesia',
    period: '2025 – present',
    title: 'Founder and lead researcher',
    org: 'CartesIA',
    place: 'Paris and Cambridge',
    kind: 'venture',
    summary: 'Language models as controlled measurement instruments for psychometrics. Three domains: mental health, youth guidance, professional development.',
    to: `${SITE.projects}/cartesia`,
  },
  {
    id: 'eleven',
    period: 'Apr – Sep 2025',
    title: 'Analyst and data scientist',
    org: 'Eleven Strategy',
    place: 'Paris, France',
    kind: 'work',
    summary: 'Buy-side due diligence; AI agents for company research and CRM pre-processing; an internal retrieval system that doubled search precision for about eighty users.',
    to: `${SITE.projects}/eleven-strategy`,
  },
  {
    id: 'well-being',
    period: 'Jun – Sep 2023',
    title: 'Research intern, Boussole project',
    org: 'Elements Impact',
    place: 'Paris, France',
    kind: 'research',
    summary: 'Subjective well-being indicators turned into predictive targets; supervised models on a twenty-year longitudinal panel of more than a thousand people.',
    to: `${SITE.projects}/well-being-panel`,
  },
  {
    id: 'teaching',
    period: 'Sep 2022 – Jul 2023',
    title: 'Teaching assistant',
    org: 'CentraleSupélec',
    place: 'Paris, France',
    kind: 'work',
    summary: 'Probability, integration and convergence; partial differential equations. Lebesgue integration, Gaussian vectors, Fourier analysis, finite element and finite difference methods.',
  },
  {
    id: 'mics',
    period: 'Jan 2022 – Jul 2023',
    title: 'Research assistant, mathematical modelling',
    org: 'MICS Lab, CentraleSupélec',
    place: 'Paris, France',
    kind: 'research',
    summary: 'Bayesian and stochastic modelling of blood cancers with the Gustave Roussy Institute; estimation of Hawkes processes.',
    to: `${SITE.projects}/blood-cancers`,
  },
  {
    id: 'centralesupelec',
    period: '2021 – 2026',
    title: 'Engineering degree, Mathematics and Data Sciences',
    org: 'CentraleSupélec, Paris-Saclay',
    place: 'Gif-sur-Yvette, France',
    kind: 'education',
    summary: 'Top 1% of a class of 970. Mathematical Modelling track: advanced probability and statistics, machine learning, game theory, optimisation, philosophy of science. Degree completed 2026.',
  },
  {
    id: 'saint-louis',
    period: '2018 – 2021',
    title: 'Classes préparatoires, MPSI / PSI*',
    org: 'Lycée Saint-Louis',
    place: 'Paris, France',
    kind: 'education',
    summary: 'Two-year intensive preparation for the national Grandes Écoles entrance exams.',
  },
];

export const JOURNEY_KINDS = {
  education: { label: 'Education', color: 'var(--navy)' },
  research:  { label: 'Research',  color: 'var(--teal)' },
  work:      { label: 'Work',      color: 'var(--warning)' },
  venture:   { label: 'Venture',   color: 'var(--success)' },
};

// Short list for the journey page, below the timeline.
export const ASIDES = [
  { label: 'Competitions', text: 'Jane Street R3 (Europe Trading Challenge); internship offer from QRT; finalist of the CentraleSupélec eloquence contest.' },
  { label: 'Sport', text: 'French University Badminton Championships with the CentraleSupélec team; recruited and managed a fifty-player club.' },
  { label: 'Languages', text: 'French (native), English (C1), Arabic (fluent), Spanish (basic).' },
];
