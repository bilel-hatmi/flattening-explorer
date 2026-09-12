// Page section: an optional kicker and a serif title above the content.
// Mirrors the section title style of the explorer's About page.

export default function Section({ id, title, kicker, aside, children, style, first }) {
  return (
    <section id={id} style={{ marginTop: first ? 0 : 56, ...style }}>
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
              <h2 style={{ fontFamily: 'var(--font-title)', fontSize: 26, color: 'var(--navy)', lineHeight: 1.15 }}>
                {title}
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
