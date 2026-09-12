// Document card, extracted verbatim from the explorer's former /about page so
// that page and the site's /documents render the same thing from one source.

const S = {
  card: {
    background: '#FFFFFF', border: '0.5px solid rgba(0,0,0,0.08)',
    borderRadius: 10, padding: '18px 18px 14px',
    display: 'flex', flexDirection: 'column', gap: 6,
    textDecoration: 'none', transition: 'border-color 0.2s, transform 0.15s',
    cursor: 'pointer',
  },
  icon: { fontSize: 20, marginBottom: 2 },
  title: {
    fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13,
    fontWeight: 600, color: '#22375A',
  },
  desc: {
    fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11,
    color: '#888780', lineHeight: 1.4,
  },
  badge: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
    color: '#A0A09A', marginTop: 'auto', paddingTop: 4,
  },
  full: { gridColumn: '1 / -1' },
};

export default function DocCard({ href, icon, title, desc, badge, full, comingSoon }) {
  const body = (
    <>
      <div style={S.icon}>{icon}</div>
      <div style={S.title}>{title}</div>
      <div style={S.desc}>{desc}</div>
      {badge && (
        <div style={{ ...S.badge, ...(comingSoon ? { color: '#C49A3C', fontWeight: 600 } : {}) }}>
          {badge}
        </div>
      )}
    </>
  );

  // Not yet published (e.g. detailed article still being written): render a
  // muted, non-clickable card instead of a download link.
  if (comingSoon) {
    return (
      <div
        style={{ ...S.card, ...(full ? S.full : {}), cursor: 'default', opacity: 0.72 }}
        aria-disabled="true"
      >
        {body}
      </div>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ ...S.card, ...(full ? S.full : {}) }}
      onMouseEnter={e => { e.currentTarget.style.border = '0.5px solid rgba(97,158,168,0.40)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.border = '0.5px solid rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'none'; }}
    >
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
