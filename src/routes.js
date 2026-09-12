// ── Route constants ──────────────────────────────────────────────────────────
// The personal site lives at `/`; The Flattening explorer lives under
// FLATTENING_BASE. Never write '/explore'-style literals in the explorer:
// always go through fl() so the prefix can move in one place.

export const FLATTENING_BASE = '/flattening';

export const fl = (path = '') => `${FLATTENING_BASE}${path}`;

export const SITE = {
  home:      '/',
  projects:  '/projects',
  journey:   '/journey',
  notes:     '/notes',
  documents: '/documents',
};

// Root-level paths reserved for legacy redirects into the explorer
// (the printed poster and early links used them). The personal site must
// not reuse them.
export const LEGACY_FLATTENING_PATHS = ['explore', 'questionnaire', 'model', 'about'];
