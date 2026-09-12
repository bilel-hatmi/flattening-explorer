// Minimal YAML-ish frontmatter parser for the Markdown content files.
// Supports a leading `---` block with `key: value` lines, quoted strings,
// booleans, and flat `[a, b, c]` arrays. Nothing else, on purpose:
// gray-matter pulls in Node's Buffer, which the browser bundle does not have.

function parseValue(raw) {
  const v = raw.trim();
  if (v === '') return '';
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (/^\[.*\]$/.test(v)) {
    return v.slice(1, -1).split(',').map(x => x.trim()).filter(Boolean).map(stripQuotes);
  }
  return stripQuotes(v);
}

function stripQuotes(v) {
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1);
  }
  return v;
}

export default function parseFrontmatter(text) {
  const src = text.replace(/\r\n/g, '\n');
  if (!src.startsWith('---\n')) return { data: {}, content: src };
  const end = src.indexOf('\n---', 4);
  if (end === -1) return { data: {}, content: src };
  const block = src.slice(4, end);
  const content = src.slice(end + 4).replace(/^\n+/, '');
  const data = {};
  for (const line of block.split('\n')) {
    const i = line.indexOf(':');
    if (i === -1 || line.trim().startsWith('#')) continue;
    data[line.slice(0, i).trim()] = parseValue(line.slice(i + 1));
  }
  return { data, content };
}
