import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import { Link } from 'react-router-dom';
import 'katex/dist/katex.min.css';

// Markdown → React. Loaded lazily by Prose.jsx so the markdown stack only
// ships with pages that render it. rehype-raw lets the content files use a
// few HTML blocks (lead, callout, pull quote, figure, stats, cards) that plain
// Markdown cannot express; the content is ours, so raw HTML is safe here.

const isInternal = href => href && href.startsWith('/') && !href.startsWith('/docs/') && !href.startsWith('/img/');

function Anchor({ href, children, node, ...rest }) {
  if (isInternal(href)) return <Link to={href} {...rest}>{children}</Link>;
  const external = href && /^https?:\/\//.test(href);
  return (
    <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>
      {children}
    </a>
  );
}

// Tables must scroll inside their own box on narrow screens.
function Table({ node, ...props }) {
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
      rehypePlugins={[rehypeRaw, rehypeKatex]}
      components={{ a: Anchor, table: Table }}
    >
      {markdown}
    </ReactMarkdown>
  );
}
