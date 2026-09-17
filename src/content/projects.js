// ── Projects ─────────────────────────────────────────────────────────────────
// One entry per project page (/projects/<slug>). Short fields live here; the
// long prose lives in ./projects/<slug>.md and is picked up by filename.
// `parent` nests a page under another (the three SRIE projects); `deck` and
// `paper` add a document strip at the top of the page.

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
    slug: 'srie-2026',
    title: 'SRIE: what AI does to the people who use it',
    kicker: 'Resident researcher and research supervisor',
    summary:
      'Eight-week AI-safety placements for Cambridge mathematics undergraduates. Seven students on three projects I designed: sycophancy as a set of measurable constructs, an LLM mediator whose neutrality is a property of the objective function, and an AI tutor built against cognitive surrender.',
    period: 'July 2026 – present',
    status: 'Ongoing',
    group: 'current',
    featured: true,
    tags: ['AI safety', 'psychometrics of LLMs', 'game theory', 'education', 'supervision'],
    links: [],
    children: ['srie-sycophancy', 'srie-mediation', 'srie-tutor'],
  },
  {
    slug: 'srie-sycophancy',
    parent: 'srie-2026',
    title: 'Sycophancy as a set of constructs',
    kicker: 'SRIE, project 1 · three students',
    summary:
      'Four separately caused quantities (epistemic validity, procedural validity, direction, directional entropy), read by two instruments, behaviour and the model’s internals, across five conditions. Empirical phase under way, preprint in preparation.',
    period: '4 August – 28 September 2026',
    status: 'Empirical phase',
    group: 'current',
    featured: false,
    tags: ['psychometrics of LLMs', 'linear probes', 'generalizability theory', 'SEM'],
    links: [],
    deck: { href: LINKS.deckSycophancy, thumb: '/img/srie_sycophancy.jpg', label: 'Project deck (PDF, 12 slides)' },
  },
  {
    slug: 'srie-mediation',
    parent: 'srie-2026',
    title: 'Mediation under confidentiality constraints',
    kicker: 'SRIE, project 2 · two students',
    summary:
      'An LLM mediator between two parties that reveals enough to resolve and never enough to expose. Neutrality as a property of the objective function; game-theoretic model, agentic workflow, proof of concept on synthetic personas.',
    period: '4 August – 28 September 2026',
    status: 'Theoretical phase',
    group: 'current',
    featured: false,
    tags: ['game theory', 'agentic workflows', 'AI mediation'],
    links: [],
    deck: { href: LINKS.deckMediation, thumb: '/img/srie_mediation.jpg', label: 'Project deck (PDF, 11 slides)' },
  },
  {
    slug: 'srie-tutor',
    parent: 'srie-2026',
    title: 'An AI tutor against cognitive surrender',
    kicker: 'SRIE, project 3 · two students',
    summary:
      'A knowledge-space model of the learner with a metacognitive component, the domain built by LLM personas, Bayesian estimation of the learner’s state, and a questioning strategy driven by information gain: a tutor that teaches without deskilling.',
    period: '4 August – 28 September 2026',
    status: 'Structural modelling',
    group: 'current',
    featured: false,
    tags: ['AI for education', 'knowledge spaces', 'metacognition', 'Bayesian estimation'],
    links: [],
    deck: { href: LINKS.deckTutor, thumb: '/img/srie_tutor.jpg', label: 'Project deck (PDF, 12 slides)' },
  },
  {
    slug: 'the-flattening',
    title: 'The Flattening',
    kicker: 'Finalist, Cambridge–McKinsey Risk Prize 2026',
    summary:
      'What does AI adoption do to firms of different sizes and domains, on cognitive diversity, productivity and losses? A Monte Carlo model of an organisation deciding with and without AI under three governance regimes, an essay, an A0 poster and an interactive explorer.',
    period: 'March – July 2026',
    status: 'Finalist',
    group: 'current',
    featured: true,
    tags: ['AI risk', 'cognitive diversity', 'Monte Carlo', 'governance', 'React'],
    links: [
      { label: 'Open the explorer', href: FLATTENING_BASE },
      { label: 'Prize essay (PDF)', href: LINKS.essayShort, external: true },
      { label: 'Poster (PDF)', href: LINKS.poster, external: true },
      { label: 'Source code', href: LINKS.github, external: true },
    ],
  },
  {
    slug: 'part-iii-dissertation',
    title: 'Proximal causal inference under unmeasured confounding',
    kicker: 'Part III essay, University of Cambridge',
    summary:
      'Can proxy variables replace an unmeasured confounder in practice? Four estimators, from a linear two-stage baseline to doubly robust kernel methods, stress-tested by simulation and validated on two real datasets, with a tuning protocol that never sees the truth.',
    period: '2025 – 2026',
    status: 'Submitted May 2026',
    group: 'current',
    featured: true,
    tags: ['causal inference', 'semiparametrics', 'ill-posed inverse problems', 'Python'],
    links: [
      { label: 'Essay (PDF, 36 pages)', href: LINKS.essayPCI, external: true },
      { label: 'Code on GitHub', href: LINKS.pciRepo, external: true },
    ],
  },
  {
    slug: 'cartesia',
    title: 'CartesIA',
    kicker: 'Founder and lead researcher · paused',
    summary:
      'A research project treating large language models as controlled measurement instruments for psychometrics: a protocol maps what a person says onto validated constructs of agency, autonomy and value–action alignment. Three domains explored; paused for now, the method documented.',
    period: '2025 – 2026',
    status: 'Paused',
    group: 'current',
    featured: false,
    tags: ['psychometrics', 'metacognition', 'LLMs', 'product'],
    links: [
      { label: 'Partners document (PDF)', href: LINKS.cartesia, external: true },
    ],
  },
  {
    slug: 'eleven-strategy',
    title: 'AI and strategy consulting',
    kicker: 'Eleven Strategy, analyst and data scientist',
    summary:
      'Four assignments: two buy-side due diligences, a competitive map of bike-sharing in Paris, a series of AI agents for an investment fund and a private bank, and an internal retrieval system that doubled search precision for about eighty users.',
    period: 'April – September 2025',
    status: 'Completed',
    group: 'earlier',
    featured: false,
    tags: ['strategy consulting', 'due diligence', 'RAG', 'AI agents'],
    links: [],
  },
  {
    slug: 'well-being-panel',
    title: 'Measuring subjective well-being over twenty years',
    kicker: 'Elements Impact, Boussole project',
    summary:
      'Estimating the impact of an entrepreneurial project on the subjective well-being of its stakeholders: a state of the art in welfare economics, supervised models on a twenty-year panel of more than a thousand people, corrective mechanisms and a benchmark. Supervised by Emmanuelle Bioud (PhD, cognitive science).',
    period: 'June – September 2023',
    status: 'Completed',
    group: 'earlier',
    featured: false,
    tags: ['panel data', 'welfare economics', 'measurement'],
    links: [
      { label: 'Code on GitHub', href: LINKS.eiRepo, external: true },
    ],
  },
  {
    slug: 'blood-cancers',
    title: 'Stochastic modelling of blood cancers',
    kicker: 'MICS Lab, CentraleSupélec, with the Gustave Roussy Institute',
    summary:
      'Bayesian and stochastic modelling of myeloproliferative syndromes: how mutated stem-cell clones appear and expand, and what that implies for the age at which screening pays off. The model was extended to homozygous clones arising by homologous recombination.',
    period: 'September 2022 – January 2023',
    status: 'Completed',
    group: 'earlier',
    featured: false,
    tags: ['stochastic processes', 'Bayesian modelling', 'oncology'],
    links: [
      { label: 'Report (PDF, French)', href: LINKS.bloodReport, external: true },
    ],
  },
  {
    slug: 'hawkes-processes',
    title: 'Estimating binned Hawkes processes',
    kicker: 'CentraleSupélec, supervised by Ioane Muni Toke',
    summary:
      'Self-exciting point processes observed on a grid rather than event by event. Maximum likelihood, Whittle and neural estimators compared on simulated streams and real data; likelihood with random restarts wins on clean data, Whittle survives degraded data.',
    period: 'February – June 2023',
    status: 'Completed',
    group: 'earlier',
    featured: false,
    tags: ['point processes', 'estimation', 'Python'],
    links: [
      { label: 'Report (PDF)', href: LINKS.hawkesReport, external: true },
      { label: 'Code on GitHub', href: LINKS.hawkesRepo, external: true },
    ],
  },
  {
    slug: 'interest-rates',
    title: 'Ho-Lee and HJM in discrete time',
    kicker: 'CentraleSupélec, stochastic finance',
    summary:
      'Two term-structure models implemented and compared to price caplets: closed-form prices for zero-coupon bonds and caplets, calibration to the Black model, and a proof that the two models agree asymptotically. Packaged as a small app where you enter the parameters and read the price.',
    period: 'February – June 2023',
    status: 'Completed',
    group: 'earlier',
    featured: false,
    tags: ['stochastic calculus', 'pricing', 'Python'],
    links: [
      { label: 'Report (PDF, French)', href: LINKS.ratesReport, external: true },
      { label: 'Code on GitHub', href: LINKS.ratesRepo, external: true },
    ],
  },
].map(p => ({ ...p, body: bodyFor(p.slug) }));

export const FEATURED_PROJECTS = PROJECTS.filter(p => p.featured);
export const CURRENT_PROJECTS  = PROJECTS.filter(p => p.group === 'current' && !p.parent);
export const EARLIER_PROJECTS  = PROJECTS.filter(p => p.group === 'earlier');

export function getProject(slug) {
  return PROJECTS.find(p => p.slug === slug) || null;
}

export function childrenOf(slug) {
  return PROJECTS.filter(p => p.parent === slug);
}
