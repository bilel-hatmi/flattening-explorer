// ── Projects ─────────────────────────────────────────────────────────────────
// One entry per project page (/projects/<slug>). Short fields live here; the
// long prose lives in ./projects/<slug>.md and is picked up by filename.

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
    subprojects: [
      {
        id: 'Sycophancy',
        title: 'Sycophancy as a set of constructs',
        summary: 'Four separately caused quantities (direction, conviction, trajectory validity, dispersion), read by two instruments, behaviour and linear probes or persona vectors, across five conditions. Three students.',
      },
      {
        id: 'Mediation',
        title: 'Mediation under confidentiality constraints',
        summary: 'An LLM mediator between two parties that reveals enough to resolve and never enough to expose. Game-theoretic model, agentic workflow, proof of concept on synthetic personas. Two students.',
      },
      {
        id: 'Tutor',
        title: 'An AI tutor against cognitive surrender',
        summary: 'A knowledge-space model of the learner with a metacognitive component, the domain built by LLM personas, Bayesian estimation of the learner’s state, and a questioning strategy driven by information gain. Two students.',
      },
    ],
  },
  {
    slug: 'the-flattening',
    title: 'The Flattening',
    kicker: 'Finalist, Cambridge–McKinsey Risk Prize 2026',
    summary:
      'Unmanaged AI adoption makes organisations better on average and more fragile at the extremes. An essay, a Monte Carlo model of systemic risk coupling workforce substitution, epistemic homogenisation and institutional resilience, and an interactive explorer.',
    period: 'March – July 2026',
    status: 'Finalist',
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
    slug: 'part-iii-dissertation',
    title: 'Proximal causal inference under unmeasured confounding',
    kicker: 'Part III essay, University of Cambridge',
    summary:
      'Can proxy variables replace an unmeasured confounder in practice? From identification to inference: four estimators, from a linear two-stage baseline to doubly-robust kernel methods, stress-tested by simulation and validated on two real datasets, with a tuning protocol that never sees the truth.',
    period: '2025 – 2026',
    status: 'Submitted May 2026',
    group: 'current',
    featured: true,
    tags: ['causal inference', 'semiparametrics', 'ill-posed inverse problems', 'Python'],
    links: [
      { label: 'Code on GitHub', href: LINKS.pciRepo, external: true },
      { label: 'Essay (PDF)', href: null, comingSoon: true },
    ],
  },
  {
    slug: 'cartesia',
    title: 'CartesIA',
    kicker: 'Founder and lead researcher',
    summary:
      'A research project treating large language models as controlled measurement instruments for psychometrics. A protocol maps what a person says onto validated constructs of agency, autonomy and value–action alignment, through contextualised vignettes, explicit scoring rubrics and safeguards against suggestion. Three domains: mental health, youth guidance, professional development.',
    period: '2025 – present',
    status: 'Method documented, pre-product',
    group: 'current',
    featured: true,
    tags: ['psychometrics', 'metacognition', 'LLMs', 'product'],
    links: [
      { label: 'Partners document (PDF)', href: LINKS.cartesia, external: true },
    ],
  },
  {
    slug: 'eleven-strategy',
    title: 'AI in strategy consulting',
    kicker: 'Eleven Strategy, analyst and data scientist',
    summary:
      'Buy-side due diligence on B2C targets, then the firm’s own tools: AI agents for company research and CRM pre-processing, and an internal retrieval system that doubled search precision for about eighty users. The place where productivity metrics and decision quality first visibly parted ways.',
    period: 'April – September 2025',
    status: 'Completed',
    group: 'earlier',
    featured: false,
    tags: ['consulting', 'RAG', 'AI agents'],
    links: [],
  },
  {
    slug: 'well-being-panel',
    title: 'Measuring subjective well-being over twenty years',
    kicker: 'Elements Impact, Boussole project',
    summary:
      'Turning subjective well-being indicators into operational variables and predictive targets, then training and stress-testing supervised models on a twenty-year longitudinal panel of more than a thousand people. Supervised by Emmanuelle Bioud (PhD, cognitive science).',
    period: 'June – September 2023',
    status: 'Completed',
    group: 'earlier',
    featured: false,
    tags: ['panel data', 'measurement', 'well-being'],
    links: [],
  },
  {
    slug: 'blood-cancers',
    title: 'Stochastic modelling of blood cancers',
    kicker: 'MICS Lab, CentraleSupélec, with the Gustave Roussy Institute',
    summary:
      'Bayesian and stochastic modelling of myeloproliferative syndromes: how mutated stem-cell clones appear and expand, and what that implies for the age at which screening pays off. The model was extended to homozygous clones arising by homologous recombination.',
    period: 'January 2022 – July 2023',
    status: 'Completed',
    group: 'earlier',
    featured: false,
    tags: ['stochastic processes', 'Bayesian modelling', 'oncology'],
    links: [],
  },
  {
    slug: 'hawkes-processes',
    title: 'Estimating binned Hawkes processes',
    kicker: 'CentraleSupélec, supervised by Ioane Muni Toke',
    summary:
      'Self-exciting point processes observed on a grid rather than event by event. Maximum likelihood, Whittle and neural estimators compared on simulated streams and real data; likelihood with random restarts wins on clean data, Whittle survives degraded data.',
    period: '2023',
    status: 'Completed',
    group: 'earlier',
    featured: false,
    tags: ['point processes', 'estimation', 'Python'],
    links: [
      { label: 'Code on GitHub', href: LINKS.hawkesRepo, external: true },
    ],
  },
  {
    slug: 'interest-rates',
    title: 'Ho-Lee and HJM in discrete time',
    kicker: 'CentraleSupélec, stochastic finance',
    summary:
      'Two term-structure models implemented and compared to price caplets: closed-form prices for zero-coupon bonds and caplets, calibration to the Black model, and a proof that the two models agree asymptotically. Packaged as a small app where you enter the parameters and read the price.',
    period: '2023',
    status: 'Completed',
    group: 'earlier',
    featured: false,
    tags: ['stochastic calculus', 'pricing', 'Python'],
    links: [
      { label: 'Code on GitHub', href: LINKS.ratesRepo, external: true },
    ],
  },
].map(p => ({ ...p, body: bodyFor(p.slug) }));

export const FEATURED_PROJECTS = PROJECTS.filter(p => p.featured);
export const CURRENT_PROJECTS  = PROJECTS.filter(p => p.group === 'current');
export const EARLIER_PROJECTS  = PROJECTS.filter(p => p.group === 'earlier');

export function getProject(slug) {
  return PROJECTS.find(p => p.slug === slug) || null;
}
