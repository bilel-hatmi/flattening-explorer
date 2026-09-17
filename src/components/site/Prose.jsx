import React, { Suspense } from 'react';

const ProseInner = React.lazy(() => import('./ProseInner'));

// Typographic block for Markdown content. Styling lives in index.css under
// `.prose` because inline styles cannot reach the generated children. The
// fallback keeps the page from jumping while the markdown stack loads.
export default function Prose({ markdown, style }) {
  if (!markdown) return null;
  return (
    <div className="prose" style={style}>
      <Suspense fallback={<div aria-busy="true" style={{ minHeight: 160 }} />}>
        <ProseInner markdown={markdown} />
      </Suspense>
    </div>
  );
}
