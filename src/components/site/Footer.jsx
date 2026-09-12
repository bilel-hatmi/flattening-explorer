import { Link } from 'react-router-dom';
import { PERSON, FLATTENING } from '../../content/site';
import { SITE } from '../../routes';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer style={{
      borderTop: '0.5px solid var(--rule)', marginTop: 64,
      padding: '28px 24px 40px', fontFamily: 'var(--font-body)',
      fontSize: 12, color: 'var(--text-muted)',
    }}>
      <div style={{
        maxWidth: 960, margin: '0 auto', display: 'flex', flexWrap: 'wrap',
        justifyContent: 'space-between', alignItems: 'center', gap: 12,
      }}>
        <div>
          <span style={{ fontFamily: 'var(--font-title)', fontSize: 16, color: 'var(--navy)' }}>{PERSON.name}</span>
          <span style={{ margin: '0 8px' }}>{'·'}</span>
          <a href={`mailto:${PERSON.email}`} style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{PERSON.email}</a>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {PERSON.links.filter(l => !l.href.startsWith('[TODO')).map(l => (
            <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a>
          ))}
          <Link to={FLATTENING.to}>{FLATTENING.title}</Link>
          <Link to={SITE.documents}>Documents</Link>
        </div>
      </div>
      <div style={{ maxWidth: 960, margin: '12px auto 0', color: 'var(--text-faint)', fontSize: 11 }}>
        {'©'} {year} {PERSON.name}. No analytics, no cookies, no user data collected.
      </div>
    </footer>
  );
}
