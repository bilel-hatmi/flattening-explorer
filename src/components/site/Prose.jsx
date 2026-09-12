import React, { Suspense } from 'react';

const ProseInner = React.lazy(() => import('./ProseInner'));

// Typographic block for Markdown content. Styling lives in index.css under
// `.prose` because inline styles cannot reach the generated children.
export default function Prose({ markdown, style }) {
  if (!markdown) return null;
  return (
    <div className="prose" style={style}>
      <Suspense fallback={<div style={{ color: 'var(--text-faint)', fontSize: 13 }}>Loading{'…'}</div>}>
        <ProseInner markdown={markdown} />
      </Suspense>
    </div>
  );
}
