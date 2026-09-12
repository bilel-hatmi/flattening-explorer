// ── Projects ─────────────────────────────────────────────────────────────────
// One entry per project page (/projects/<slug>). Short fields live here; the
// long prose lives in ./projects/<slug>.md and is picked up by filename.
// Placeholders are tagged [TODO: …].

import { FLATTENING_BASE } from '../routes';
import { LINKS } from './documents';
import parseFrontmatter from '../utils/frontmatter';

const bodies = import.meta.glob('./projects/*.md', { query: '?raw', import: 'default', eager: true });

function bodyFor(slug) {
  const raw = bodies[`./projects/${slug}.md`];
  return raw ? parseFrontmatter(raw).content : '';
}

export const PROJECTS = [
  {
    slug: 'the-flattening',
    title: 'The Flattening',
    kicker: 'Essay, model and interactive explorer',
    summary:
      'Unmanaged AI adoption makes organisations better on average and more fragile at the extremes. A Monte Carlo model, an essay and an explorer for the Cambridge–McKinsey Risk Prize 2026.',
    period: '2026',
    status: 'Submitted',
    group: 'current',
    featured: true,
    tags: ['AI risk', 'Monte Carlo', 'governance', 'React'],
    links: [
      { label: 'Open the explorer', href: FLATTENING_BASE },
      { label: 'Prize essay (PDF)', href: LINKS.essayShort, external: true },
      { label: 'Poster (PDF)', href: LINKS.poster, external: true },
      { label: 'Source code', href: LINKS.github, external: true },
    ],
  },
  {
    slug: 'srie-2026',
    title: 'SRIE — supervised research internships',
    kicker: 'Four research projects, summer 2026',
    summary:
      '[TODO: two sentences. What the programme is, who the students are, what the four projects have in common.]',
    period: 'Summer 2026',
    status: 'Ongoing',
    group: 'current',
    featured: true,
    tags: ['supervision', 'psychometrics', 'LLM evaluation', 'causal inference'],
    links: [],
    subprojects: [
      { id: 'P1', title: '[TODO: P1 title]', summary: 'A unified theory of behaviour and measurement. [TODO: one more sentence.]' },
      { id: 'P2', title: '[TODO: P2 title]', summary: 'Does a trait score separate models, and does it say the same thing twice? [TODO: one more sentence.]' },
      { id: 'P3', title: '[TODO: P3 title]', summary: 'Measuring a learner’s cognitive state to teach without deskilling. [TODO: one more sentence.]' },
      { id: 'P4', title: '[TODO: P4 title]', summary: 'A mediator that reveals enough to resolve, never enough to expose. [TODO: one more sentence.]' },
    ],
  },
  {
    slug: 'part-iii-dissertation',
    title: 'Proximal causal inference',
    kicker: 'Part III dissertation, University of Cambridge',
    summary:
      'Semiparametric methods for proximal causal inference under unmeasured confounding. [TODO: one sentence on the specific contribution.]',
    period: '2025–2026',
    status: 'In progress',
    group: 'current',
    featured: true,
    tags: ['causal inference', 'semiparametrics', 'statistics'],
    links: [
      { label: 'Dissertation (PDF)', href: null, comingSoon: true },
    ],
  },
  {
    slug: 'cartesia',
    title: 'CartesIA',
    kicker: 'Psychometric AI platform',
    summary:
      'A psychometric AI platform in development across HR assessment, mental health triage and youth career orientation. Before any AI output reaches the user, a structured sequence draws out their own reasoning first.',
    period: '2025–',
    status: 'In development',
    group: 'current',
    featured: true,
    tags: ['psychometrics', 'product', 'AI'],
    links: [
      { label: 'Presentation (PDF)', href: LINKS.cartesia, external: true },
    ],
  },
  {
    slug: 'eleven-strategy',
    title: 'AI deployments in strategy consulting',
    kicker: 'Eleven Strategy',
    summary:
      'AI deployments in a strategy consulting context, where productivity metrics and decision quality routinely pointed in different directions. [TODO: dates, one concrete example.]',
    period: '[TODO: dates]',
    status: 'Completed',
    group: 'earlier',
    featured: false,
    tags: ['consulting', 'AI deployment'],
    links: [],
  },
  {
    slug: 'gustave-roussy',
    title: 'Stochastic modelling of blood cancers',
    kicker: 'Gustave Roussy Institute',
    summary:
      '[TODO: two sentences. The question, the model, what came out of it.]',
    period: '[TODO: dates]',
    status: 'Completed',
    group: 'earlier',
    featured: false,
    tags: ['stochastic processes', 'oncology'],
    links: [],
  },
  {
    slug: 'well-being-panel',
    title: 'Subjective well-being over twenty years',
    kicker: 'Longitudinal panel study',
    summary:
      'Measurement of subjective well-being over a twenty-year longitudinal panel. [TODO: dataset, method, one finding.]',
    period: '[TODO: dates]',
    status: 'Completed',
    group: 'earlier',
    featured: false,
    tags: ['panel data', 'measurement'],
    links: [],
  },
].map(p => ({ ...p, body: bodyFor(p.slug) }));

export const FEATURED_PROJECTS = PROJECTS.filter(p => p.featured);
export const CURRENT_PROJECTS  = PROJECTS.filter(p => p.group === 'current');
export const EARLIER_PROJECTS  = PROJECTS.filter(p => p.group === 'earlier');

export function getProject(slug) {
  return PROJECTS.find(p => p.slug === slug) || null;
}
