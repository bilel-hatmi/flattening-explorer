// ── Notes ────────────────────────────────────────────────────────────────────
// Drop a Markdown file in this folder and it becomes a note. Filename:
// `YYYY-MM-DD-slug.md`; the slug is what appears in the URL. Frontmatter:
//
//   ---
//   title: A title
//   date: 2026-09-12
//   summary: One sentence shown in the list.
//   tags: [causal inference, notes]
//   draft: true          # hidden in production builds
//   ---
//
// Markdown supports GFM (tables, task lists) and maths ($…$, $$…$$).

import parseFrontmatter from '../../utils/frontmatter';

const files = import.meta.glob('./*.md', { query: '?raw', import: 'default', eager: true });

function slugFromPath(path) {
  return path
    .replace(/^\.\//, '')
    .replace(/\.md$/, '')
    .replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

const all = Object.entries(files).map(([path, raw]) => {
  const { data, content } = parseFrontmatter(raw);
  const slug = data.slug || slugFromPath(path);
  const date = data.date || (path.match(/(\d{4}-\d{2}-\d{2})/) || [])[1] || '';
  return {
    slug,
    title: data.title || slug,
    date,
    summary: data.summary || '',
    tags: Array.isArray(data.tags) ? data.tags : [],
    draft: data.draft === true,
    content,
  };
});

export const NOTES = all
  .filter(n => !(import.meta.env.PROD && n.draft))
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

export function getNote(slug) {
  return NOTES.find(n => n.slug === slug) || null;
}

export function formatNoteDate(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}
