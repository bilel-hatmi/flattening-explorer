// ── Projects ─────────────────────────────────────────────────────────────────
// One entry per project page (/projects/<slug>). Short fields live here; the
// long prose lives in ./projects/<slug>.md and is picked up by filename.
// `icon` names an Icon.jsx glyph; `parent` nests a page under the SRIE
// overview (which is not listed as a project itself); `deck` and the links
// add a document strip at the top of the page. Groups: current, earlier, paused.

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
    slug: 'srie-sycophancy',
    parent: 'srie-2026',
    icon: 'psychometrics',
    title: 'Sycophancy as a set of constructs',
    kicker: 'Psychometrics of LLMs · 3 students supervised',
    summary:
      '**4 separately caused properties** (epistemic validity, procedural validity, direction, directional entropy), read by 2 instruments, behaviour and the model’s internals, across 5 conditions. **Empirical phase under way, preprint in preparation.**',
    period: 'August – September 2026',
    status: 'Empirical phase',
    group: 'current',
    featured: true,
    tags: ['psychometrics of LLMs', 'linear probes', 'generalizability theory', 'SEM'],
    links: [],
    deck: { href: LINKS.deckSycophancy, thumb: '/img/srie_sycophancy.jpg', label: 'Project deck (PDF, 12 slides)' },
  },
  {
    slug: 'srie-mediation',
    parent: 'srie-2026',
    icon: 'mediation',
    title: 'Mediation under confidentiality constraints',
    kicker: 'Game theory and agentic AI · 2 students supervised',
    summary:
      'An LLM mediator between 2 parties that **reveals enough to resolve and never enough to expose**. Neutrality as a property of the objective function; game-theoretic model, agentic workflow, proof of concept on synthetic personas.',
    period: 'August – September 2026',
    status: 'Theoretical phase',
    group: 'current',
    featured: true,
    tags: ['game theory', 'agentic workflows', 'AI mediation'],
    links: [],
    deck: { href: LINKS.deckMediation, thumb: '/img/srie_mediation.jpg', label: 'Project deck (PDF, 11 slides)' },
  },
  {
    slug: 'srie-tutor',
    parent: 'srie-2026',
    icon: 'education',
    title: 'An AI tutor against cognitive surrender',
    kicker: 'AI for education · 2 students supervised',
    summary:
      'A knowledge-space model of the learner with a metacognitive component, the domain built by LLM personas, Bayesian estimation of the learner’s state, and a questioning strategy driven by information gain: **a tutor that teaches without deskilling**.',
    period: 'August – September 2026',
    status: 'Structural modelling',
    group: 'current',
    featured: true,
    tags: ['AI for education', 'knowledge spaces', 'metacognition', 'Bayesian estimation'],
    links: [],
    deck: { href: LINKS.deckTutor, thumb: '/img/srie_tutor.jpg', label: 'Project deck (PDF, 12 slides)' },
  },
  {
    slug: 'the-flattening',
    icon: 'risk',
    title: 'The Flattening',
    kicker: 'Finalist, Cambridge–McKinsey Risk Prize 2026',
    summary:
      'What does AI adoption do to firms of different sizes and domains, on cognitive diversity, productivity and losses? **A Monte Carlo model of an organisation deciding with and without AI under 3 governance regimes**, an essay, an A0 poster and an interactive explorer.',
    period: 'March – July 2026',
    status: 'Finalist',
    group: 'current',
    featured: true,
    tags: ['AI risk', 'cognitive diversity', 'Monte Carlo', 'governance'],
    links: [
      { label: 'Open the explorer', href: FLATTENING_BASE },
      { label: 'Prize essay (PDF)', href: LINKS.essayShort, external: true },
      { label: 'Poster (PDF)', href: LINKS.poster, external: true },
      { label: 'Source code', href: LINKS.github, external: true },
    ],
  },
  {
    slug: 'part-iii-dissertation',
    icon: 'causal',
    title: 'Proximal causal inference under unmeasured confounding',
    kicker: 'Part III essay, University of Cambridge',
    summary:
      'Can proxy variables replace an unmeasured confounder in practice? **4 estimators**, from a linear two-stage baseline to doubly robust kernel methods, stress-tested by simulation and **validated on 2 real datasets**, with a blind tuning protocol.',
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
    slug: 'srie-2026',
    icon: 'supervision',
    title: 'SRIE: the stream',
    kicker: 'Resident researcher and research supervisor',
    summary:
      '**8-week AI-safety placements** for Cambridge mathematics undergraduates. **7 students on 3 projects I designed**; weekly group and one-to-one sessions, 4 sprints in 8 weeks.',
    period: 'July 2026 – present',
    status: 'Ongoing',
    group: 'programme',
    featured: false,
    tags: ['supervision', 'AI safety'],
    links: [],
    children: ['srie-sycophancy', 'srie-mediation', 'srie-tutor'],
  },
  {
    slug: 'eleven-rag',
    icon: 'search',
    title: 'An internal search engine with retrieval-augmented generation',
    kicker: 'Eleven Strategy',
    summary:
      'An embedding pipeline over all of a consultancy’s internal documents, with metadata embedded separately to raise precision, query preprocessing and a lightweight quality evaluation. **Retrieval precision doubled; about 80 active users.**',
    period: 'April – September 2025',
    status: 'Deployed',
    group: 'earlier',
    featured: false,
    tags: ['RAG', 'semantic search', 'evaluation'],
    links: [],
  },
  {
    slug: 'eleven-agents',
    icon: 'agents',
    title: 'AI agents for an investment fund and a private bank',
    kicker: 'Eleven Strategy',
    summary:
      'A series of proofs of concept: deep research for company and market analysis, CRM management for a fund’s portfolio inside the client’s own environment, automatic processing of client files at a large private bank. **Analyst processing time fell by about half; the files handled each month doubled.**',
    period: 'April – September 2025',
    status: 'Proofs of concept',
    group: 'earlier',
    featured: false,
    tags: ['AI agents', 'agentic workflows', 'automation'],
    links: [],
  },
  {
    slug: 'well-being-panel',
    icon: 'wellbeing',
    title: 'Measuring subjective well-being over 20 years',
    kicker: 'Elements Impact, Boussole project',
    summary:
      'Estimating the impact of an entrepreneurial project on the subjective well-being of its stakeholders: a state of the art in welfare economics, **supervised models on a 20-year panel of more than 1,000 people**, corrective mechanisms and a benchmark. Supervised by Emmanuelle Bioud (PhD, cognitive science).',
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
    icon: 'cells',
    title: 'Stochastic modelling of blood cancers',
    kicker: 'MICS Lab, CentraleSupélec, with the Gustave Roussy Institute',
    summary:
      'Bayesian and stochastic modelling of myeloproliferative syndromes: **how mutated stem-cell clones appear and expand**, and what that implies for the age at which screening pays off. The model was extended to homozygous clones arising by homologous recombination.',
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
    icon: 'spikes',
    title: 'Estimating binned Hawkes processes',
    kicker: 'CentraleSupélec, supervised by Ioane Muni Toke',
    summary:
      'Self-exciting point processes observed on a grid rather than event by event. Maximum likelihood, Whittle and neural estimators compared on simulated streams and real data; **likelihood with random restarts is best on clean data**, while Whittle remains usable on degraded data.',
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
    icon: 'rates',
    title: 'Ho-Lee and HJM in discrete time',
    kicker: 'CentraleSupélec, stochastic finance',
    summary:
      '2 term-structure models implemented and compared to price caplets: closed-form prices for zero-coupon bonds and caplets, calibration to the Black model, and **a proof that the 2 models agree asymptotically**. Packaged as a small app where you enter the parameters and read the price.',
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
  {
    slug: 'cartesia',
    icon: 'introspection',
    logo: '/img/cartesia_mark.png',
    title: 'CartesIA',
    kicker: 'Founder and lead researcher',
    summary:
      'A research project treating large language models as controlled measurement instruments for psychometrics: a protocol **maps what a person says onto validated constructs** of agency, autonomy and value–action alignment. 3 domains explored; **paused for now**, the method documented.',
    period: '2025 – 2026',
    status: 'Paused',
    group: 'paused',
    featured: false,
    tags: ['psychometrics', 'metacognition', 'LLMs', 'product'],
    links: [
      { label: 'Partners document (PDF)', href: LINKS.cartesia, external: true },
    ],
  },
].map(p => ({ ...p, body: bodyFor(p.slug) }));

export const CURRENT_PROJECTS = PROJECTS.filter(p => p.group === 'current');
export const EARLIER_PROJECTS = PROJECTS.filter(p => p.group === 'earlier');
export const PAUSED_PROJECTS  = PROJECTS.filter(p => p.group === 'paused');
export const FEATURED_PROJECTS = PROJECTS.filter(p => p.featured);

export function getProject(slug) {
  return PROJECTS.find(p => p.slug === slug) || null;
}

export function childrenOf(slug) {
  return PROJECTS.filter(p => p.parent === slug);
}
