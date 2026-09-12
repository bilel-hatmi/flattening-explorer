import { Link } from 'react-router-dom';
import useIsMobile from '../../hooks/useIsMobile';
import { JOURNEY_KINDS } from '../../content/journey';

// Vertical timeline. Desktop: period in a left column, a rail with coloured
// markers, the entry on the right. Mobile: the period sits above the entry.
export default function Timeline({ entries }) {
  const isMobile = useIsMobile();
  const railX = isMobile ? 7 : 148;

  return (
    <ol style={{ listStyle: 'none', position: 'relative', margin: 0, padding: 0 }}>
      <div aria-hidden="true" style={{
        position: 'absolute', top: 6, bottom: 6, left: railX, width: 1,
        background: 'var(--card-border)',
      }} />
      {entries.map(e => {
        const kind = JOURNEY_KINDS[e.kind] || JOURNEY_KINDS.research;
        const title = e.to
          ? <Link to={e.to} style={{ color: 'var(--navy)' }}>{e.title}</Link>
          : e.href
            ? <a href={e.href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--navy)' }}>{e.title}</a>
            : e.title;
        return (
          <li key={e.id} style={{
            position: 'relative', display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '128px 1fr',
            columnGap: 40, paddingLeft: isMobile ? 28 : 0, paddingBottom: 30,
          }}>
            <span aria-hidden="true" style={{
              position: 'absolute', top: 6, left: railX - 4, width: 9, height: 9, borderRadius: '50%',
              background: kind.color, border: '2px solid var(--cream)', boxSizing: 'content-box',
            }} />
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)',
              textAlign: isMobile ? 'left' : 'right', paddingTop: 3, marginBottom: isMobile ? 4 : 0,
            }}>
              {e.period}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: 19, color: 'var(--navy)', lineHeight: 1.25 }}>
                {title}
              </div>
              <div style={{ fontSize: 12, color: 'var(--teal)', fontWeight: 500, marginTop: 2 }}>
                {e.org}{e.place ? <span style={{ color: 'var(--text-faint)', fontWeight: 400 }}>{' · '}{e.place}</span> : null}
              </div>
              {e.summary && (
                <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-muted)', marginTop: 8 }}>{e.summary}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function TimelineLegend() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 11, color: 'var(--text-muted)' }}>
      {Object.entries(JOURNEY_KINDS).map(([k, v]) => (
        <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: v.color, display: 'inline-block' }} />
          {v.label}
        </span>
      ))}
    </div>
  );
}
