// ── Documents & publications ─────────────────────────────────────────────────
// One source for the /documents page and the explorer's /flattening/about.
// `kind` groups the grid; `flattening: true` marks what belongs to the
// explorer's own document list. Files live in public/docs/.

export const LINKS = {
  github:     'https://github.com/bilel-hatmi/flattening-explorer',
  cv:         '/docs/cv.pdf',
  cartesia:   '/docs/cartesia.pdf',
  essayShort: '/docs/essay_prize.pdf',
  essayFull:  '/docs/essay_full.pdf',
  poster:     '/docs/poster.pdf',
};

export const DOCUMENTS = [
  {
    id: 'essay-prize',
    kind: 'essay',
    flattening: true,
    href: LINKS.essayShort,
    icon: '📝',
    title: 'Prize essay',
    desc: 'The Flattening: Invisible Tail Risk in AI-Adopting Organisations. Short submission for the Cambridge–McKinsey Risk Prize 2026.',
    badge: 'PDF',
  },
  {
    id: 'poster',
    kind: 'essay',
    flattening: true,
    href: LINKS.poster,
    icon: '🖼️',
    title: 'Poster',
    desc: 'The Flattening on a single A0 board: the bimodal loss, the correlation cascade, and the governance results at a glance.',
    badge: 'PDF',
  },
  {
    id: 'essay-full',
    kind: 'essay',
    flattening: true,
    icon: '📖',
    title: 'Full essay',
    desc: 'Extended version with complete derivations, all validation results, and the systemic policy argument. Currently being written.',
    badge: 'In progress',
    comingSoon: true,
  },
  {
    id: 'dissertation',
    kind: 'academic',
    icon: '📚',
    title: 'Part III dissertation',
    desc: '[TODO: title of the dissertation on proximal causal inference, one line on what it does.]',
    badge: 'In progress',
    comingSoon: true,
  },
  {
    id: 'cv',
    kind: 'about',
    flattening: true,
    href: LINKS.cv,
    icon: '💼',
    title: 'Curriculum Vitae',
    desc: 'Academic background, research experience, and professional projects.',
    badge: 'PDF',
  },
  {
    id: 'source',
    kind: 'code',
    flattening: true,
    href: LINKS.github,
    icon: '💻',
    title: 'Source code',
    desc: 'Full repository: simulation engine (Python), interactive explorer (React), and all pre-computed datasets.',
    badge: 'GitHub',
  },
  {
    id: 'cartesia',
    kind: 'venture',
    flattening: true,
    href: LINKS.cartesia,
    icon: '⬡',
    title: 'CartesIA',
    desc: 'Psychometric AI platform: HR assessment, mental health triage, youth orientation. Presentation document.',
    badge: 'PDF',
    full: true,
  },
];

export const DOCUMENT_KINDS = [
  { id: 'essay',    label: 'The Flattening' },
  { id: 'academic', label: 'Academic' },
  { id: 'venture',  label: 'CartesIA' },
  { id: 'code',     label: 'Code' },
  { id: 'about',    label: 'About me' },
];

export const FLATTENING_DOCUMENTS = DOCUMENTS.filter(d => d.flattening);
