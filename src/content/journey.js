// ── Journey (timeline) ───────────────────────────────────────────────────────
// Newest first. `kind` picks the marker colour: education, research, work,
// venture. `to` links to a project page, `href` to an external document.

import { SITE } from '../routes';

export const JOURNEY = [
  {
    id: 'srie',
    period: 'Summer 2026',
    title: 'Supervisor, SRIE research internships',
    org: '[TODO: host institution]',
    place: '[TODO: place]',
    kind: 'research',
    summary: 'Four supervised research projects on measurement, cognition and AI. [TODO: one more line.]',
    to: `${SITE.projects}/srie-2026`,
  },
  {
    id: 'risk-prize',
    period: '2026',
    title: 'Cambridge–McKinsey Risk Prize',
    org: 'Cambridge Judge Business School',
    place: 'Cambridge, UK',
    kind: 'research',
    summary: 'Essay, poster and interactive explorer: The Flattening. [TODO: outcome once known.]',
    to: `${SITE.projects}/the-flattening`,
  },
  {
    id: 'part-iii',
    period: '2025–2026',
    title: 'Part III Mathematical Statistics',
    org: 'University of Cambridge, DPMMS',
    place: 'Cambridge, UK',
    kind: 'education',
    summary: 'Dissertation on semiparametric methods for proximal causal inference under unmeasured confounding.',
    to: `${SITE.projects}/part-iii-dissertation`,
  },
  {
    id: 'cartesia',
    period: '2025–',
    title: 'Founder, CartesIA',
    org: 'CartesIA',
    place: '[TODO: place]',
    kind: 'venture',
    summary: 'Psychometric AI platform: HR assessment, mental health triage, youth orientation.',
    to: `${SITE.projects}/cartesia`,
  },
  {
    id: 'eleven',
    period: '[TODO: dates]',
    title: 'AI deployments, strategy consulting',
    org: 'Eleven Strategy',
    place: 'Paris, France',
    kind: 'work',
    summary: 'AI deployments where productivity metrics and decision quality routinely pointed in different directions.',
    to: `${SITE.projects}/eleven-strategy`,
  },
  {
    id: 'gustave-roussy',
    period: '[TODO: dates]',
    title: 'Stochastic modelling of blood cancers',
    org: 'Gustave Roussy Institute',
    place: 'Villejuif, France',
    kind: 'research',
    summary: '[TODO: one line.]',
    to: `${SITE.projects}/gustave-roussy`,
  },
  {
    id: 'well-being',
    period: '[TODO: dates]',
    title: 'Subjective well-being over a twenty-year panel',
    org: '[TODO: institution]',
    place: '[TODO: place]',
    kind: 'research',
    summary: 'Measurement work on a longitudinal panel. [TODO: one line.]',
    to: `${SITE.projects}/well-being-panel`,
  },
  {
    id: 'centralesupelec',
    period: '[TODO: dates]',
    title: 'Grande École degree',
    org: 'CentraleSupélec',
    place: 'Gif-sur-Yvette, France',
    kind: 'education',
    summary: 'Top 1% of cohort. [TODO: specialisation.]',
  },
];

export const JOURNEY_KINDS = {
  education: { label: 'Education', color: 'var(--navy)' },
  research:  { label: 'Research',  color: 'var(--teal)' },
  work:      { label: 'Work',      color: 'var(--warning)' },
  venture:   { label: 'Venture',   color: 'var(--success)' },
};
