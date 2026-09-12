import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Link } from 'react-router-dom';
import 'katex/dist/katex.min.css';

// Markdown → React. Loaded lazily by Prose.jsx so the markdown stack only
// ships with pages that render it.

const isInternal = href => href && href.startsWith('/') && !href.startsWith('/docs/');

function Anchor({ href, children, ...rest }) {
  if (isInternal(href)) return <Link to={href} {...rest}>{children}</Link>;
  const external = href && /^https?:\/\//.test(href);
  return (
    <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>
      {children}
    </a>
  );
}

// Tables must scroll inside their own box on narrow screens.
function Table(props) {
  return (
    <div style={{ overflowX: 'auto', margin: '1.2em 0' }}>
      <table {...props} />
    </div>
  );
}

export default function ProseInner({ markdown }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{ a: Anchor, table: Table }}
    >
      {markdown}
    </ReactMarkdown>
  );
}
