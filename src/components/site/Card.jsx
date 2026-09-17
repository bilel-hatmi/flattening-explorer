import { Link } from 'react-router-dom';
import { IconBadge } from './Icon';

// White flat card, the site's basic container. Generalises GraphCard (graphs)
// and DocCard (documents): same border, radius and hover as those two.
//
//   as: 'div' (default) | 'a' (href, opens in a new tab) | 'link' (to, in-app)
//
// Pass `title`/`kicker`/`desc`/`badge` for the standard header, or children
// for anything else. `muted` renders a non-interactive, faded card.

const BORDER = '0.5px solid var(--card-border)';
const BORDER_HOVER = '0.5px solid rgba(97,158,168,0.40)';

export default function Card({
  as = 'div', to, href, title, kicker, desc, badge, full, muted, icon, iconTone, children, style, ...rest
}) {
  const interactive = !muted && (as === 'a' || as === 'link');

  const base = {
    background: 'var(--card-bg)', border: BORDER, borderRadius: 'var(--card-radius)',
    padding: '18px 20px 16px', display: 'flex', flexDirection: 'column', gap: 6,
    color: 'var(--navy)', textDecoration: 'none', minWidth: 0,
    transition: 'border-color 0.2s, transform 0.15s',
    cursor: interactive ? 'pointer' : 'default',
    ...(full ? { gridColumn: '1 / -1' } : {}),
    ...(muted ? { opacity: 0.72 } : {}),
    ...style,
  };

  const hover = interactive ? {
    onMouseEnter: e => { e.currentTarget.style.border = BORDER_HOVER; e.currentTarget.style.transform = 'translateY(-1px)'; },
    onMouseLeave: e => { e.currentTarget.style.border = BORDER; e.currentTarget.style.transform = 'none'; },
  } : {};

  const body = (
    <>
      {icon && <div style={{ marginBottom: 4 }}><IconBadge name={icon} tone={iconTone} /></div>}
      {kicker && <div style={S.kicker}>{kicker}</div>}
      {title && <div style={S.title}>{title}</div>}
      {desc && <div style={S.desc}>{desc}</div>}
      {children}
      {badge && <div style={S.badge}>{badge}</div>}
    </>
  );

  if (as === 'link' && !muted) {
    return <Link to={to} style={base} {...hover} {...rest}>{body}</Link>;
  }
  if (as === 'a' && !muted) {
    return <a href={href} target="_blank" rel="noopener noreferrer" style={base} {...hover} {...rest}>{body}</a>;
  }
  return <div style={base} aria-disabled={muted || undefined} {...rest}>{body}</div>;
}

const S = {
  kicker: {
    fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 500, letterSpacing: '0.03em',
    textTransform: 'uppercase', color: 'var(--teal)',
  },
  title: {
    fontFamily: 'var(--font-title)', fontSize: 20, lineHeight: 1.2, color: 'var(--navy)',
  },
  desc: {
    fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: 1.55, color: 'var(--text-muted)',
  },
  badge: {
    fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-faint)',
    marginTop: 'auto', paddingTop: 6,
  },
};

// Responsive grid for cards: `min` is the column floor.
export function CardGrid({ children, min = 260, gap = 14, style }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(min(${min}px, 100%), 1fr))`,
      gap, ...style,
    }}>
      {children}
    </div>
  );
}
