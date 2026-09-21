import Icon, { IconBadge } from './Icon';
import { renderInline } from '../../utils/inline';

// Document card, shared by /documents and the explorer's /flattening/about.
// One row: a badge for the document type on the left (or a logo), the title
// and description, then the action ("Read the essay", "Open the deck"…). The
// format label sits in the top-right corner of every card, so the labels line
// up across a grid whatever the length of the text.

const TYPE_ICON = { essay: 'documents', poster: 'poster', deck: 'deck', report: 'documents', code: 'github', cv: 'cv', pdf: 'pdf' };
const isExternal = href => href && /^https?:\/\//.test(href);

const BORDER = '0.5px solid var(--card-border)';
const BORDER_HOVER = '0.5px solid rgba(97,158,168,0.40)';

function Action({ label, href, muted, asSpan }) {
  const style = {
    display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600,
    color: muted ? 'var(--text-muted)' : 'var(--teal)', textDecoration: 'none',
  };
  const glyph = <Icon name={isExternal(href) ? 'external' : 'arrow'} size={14} />;
  if (asSpan) return <span style={style}>{label} {glyph}</span>;
  return <a href={href} target="_blank" rel="noopener noreferrer" style={style}>{label} {glyph}</a>;
}

export default function DocCard({ href, type = 'pdf', logo, title, desc, badge, action, secondary, full, comingSoon }) {
  const glyph = logo
    ? <IconBadge img={logo} size={42} />
    : <IconBadge name={TYPE_ICON[type] || 'documents'} size={42} tone={type === 'code' ? 'navy' : 'teal'} />;

  const card = {
    position: 'relative', background: 'var(--card-bg)', border: BORDER, borderRadius: 'var(--card-radius)',
    padding: '18px 18px 16px', display: 'flex', gap: 14, alignItems: 'flex-start',
    textDecoration: 'none', color: 'var(--navy)', minWidth: 0,
    ...(full ? { gridColumn: '1 / -1' } : {}),
  };
  const pill = {
    position: 'absolute', top: 14, right: 14, fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 500,
    padding: '2px 8px', borderRadius: 4, background: 'rgba(34,55,90,0.05)', whiteSpace: 'nowrap',
    color: comingSoon ? 'var(--warning)' : 'var(--text-muted)',
  };
  const hover = {
    onMouseEnter: e => { e.currentTarget.style.border = BORDER_HOVER; },
    onMouseLeave: e => { e.currentTarget.style.border = BORDER; },
  };

  const body = (
    <>
      {glyph}
      <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', paddingRight: badge ? 64 : 0 }}>
        <div style={{ fontFamily: 'var(--font-title)', fontSize: 18, lineHeight: 1.25 }}>{title}</div>
        <div style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--text-muted)', marginTop: 4 }}>{renderInline(desc)}</div>
        {!comingSoon && action && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, marginTop: 12 }}>
            <Action label={action} href={href} asSpan={!secondary} />
            {secondary && <Action label={secondary.label} href={secondary.href} muted />}
          </div>
        )}
      </div>
      {badge && <span style={pill}>{badge}</span>}
    </>
  );

  // Not yet published: a muted, non-clickable card.
  if (comingSoon) {
    return <div style={{ ...card, opacity: 0.7 }} aria-disabled="true">{body}</div>;
  }
  // Two actions: the card itself is not a link (no nested anchors).
  if (secondary) {
    return <div style={card} className="lift" {...hover}>{body}</div>;
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={card} className="lift" {...hover}>
      {body}
    </a>
  );
}

// Grid wrapper shared by both pages.
export function DocGrid({ children, style }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 32, ...style }}>
      {children}
    </div>
  );
}
