import { Fragment, createElement } from 'react';

// Content strings may carry **bold** spans to guide the reading. renderInline
// turns them into <strong>; stripInline removes the markers for places that
// render plain text (meta descriptions, the explorer's About page).

export function renderInline(text) {
  if (!text || text.indexOf('**') === -1) return text;
  const parts = text.split('**');
  return parts.map((part, i) => (i % 2 === 1
    ? createElement('strong', { key: i, style: { fontWeight: 600, color: 'var(--navy)' } }, part)
    : createElement(Fragment, { key: i }, part)));
}

export function stripInline(text) {
  return text ? text.split('**').join('') : text;
}
