import useIsMobile from '../../hooks/useIsMobile';
import roman from '../../utils/roman';

// Page section: an optional kicker, a serif title (with a roman numeral when
// `num` is given) and the content. `panel` frames the section in a white
// card with a teal rule, the same on every page that uses it.

export default function Section({ id, title, kicker, num, aside, panel, children, style, first }) {
  const isMobile = useIsMobile();
  const box = panel ? {
    background: 'var(--card-bg)', border: '0.5px solid var(--card-border)', borderLeft: '3px solid var(--teal)',
    borderRadius: 14, padding: isMobile ? '22px 20px 20px' : '30px 34px 28px',
    boxShadow: '0 20px 44px -36px rgba(34,55,90,0.35)',
  } : {};

  return (
    <section id={id} style={{ marginTop: first ? 0 : (panel ? 28 : 56), ...box, ...style }}>
      {(title || kicker) && (
        <header style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, marginBottom: 18, flexWrap: 'wrap' }}>
          <div>
            {kicker && (
              <div style={{
                fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 500, letterSpacing: '0.04em',
                textTransform: 'uppercase', color: 'var(--teal)', marginBottom: 4,
              }}>
                {kicker}
              </div>
            )}
            {title && (
              <h2 style={{ display: 'flex', alignItems: 'baseline', gap: 14, fontFamily: 'var(--font-title)', fontSize: 26, color: 'var(--navy)', lineHeight: 1.15, margin: 0 }}>
                {num != null && <Numeral n={num} />}
                <span>{title}</span>
              </h2>
            )}
          </div>
          {aside && <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{aside}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

// Roman numeral in the mono face, teal: the site's section marker.
export function Numeral({ n, style }) {
  return (
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--teal)', letterSpacing: '0.08em', ...style }}>
      {roman(n)}
    </span>
  );
}

// "On this page": anchors to the numbered sections, under the page header.
export function SectionNav({ items, style }) {
  const isMobile = useIsMobile();
  return (
    <nav aria-label="On this page" style={{
      display: 'flex', flexWrap: 'wrap', gap: isMobile ? '8px 14px' : '8px 22px', marginTop: -18, marginBottom: 40,
      fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.02em', ...style,
    }}>
      {items.map((s, i) => (
        <a key={s.id} href={`#${s.id}`} style={{ color: 'var(--text-muted)' }}>
          <span style={{ color: 'var(--teal)', letterSpacing: '0.08em' }}>{roman(i + 1)}</span>{'  '}{s.title}
          {s.count != null && <span style={{ color: 'var(--text-faint)' }}>{' ('}{s.count}{')'}</span>}
        </a>
      ))}
    </nav>
  );
}

// Standard page column. `wide` for grids, default for prose.
export function Page({ children, wide, style }) {
  return (
    <div style={{ maxWidth: wide ? 1040 : 760, margin: '0 auto', padding: '56px 24px 48px', ...style }}>
      {children}
    </div>
  );
}

// Page header: serif title, optional lede.
export function PageHeader({ title, lede, kicker, children }) {
  return (
    <header style={{ marginBottom: 40 }}>
      {kicker && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-faint)', marginBottom: 10 }}>
          {kicker}
        </div>
      )}
      <h1 style={{ fontFamily: 'var(--font-title)', fontSize: 'clamp(34px, 5vw, 46px)', color: 'var(--navy)', lineHeight: 1.1, marginBottom: lede ? 14 : 0 }}>
        {title}
      </h1>
      {lede && (
        <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--text-muted)', maxWidth: 640 }}>
          {lede}
        </p>
      )}
      {children}
    </header>
  );
}
