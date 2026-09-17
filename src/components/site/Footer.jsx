import { Link } from 'react-router-dom';
import Icon from './Icon';
import { PERSON, FLATTENING } from '../../content/site';
import { SITE } from '../../routes';

const link = { display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' };

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-title)', fontSize: 16, color: 'var(--navy)' }}>{PERSON.name}</span>
          <span>{'·'}</span>
          <a href={`mailto:${PERSON.email}`} style={{ ...link, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--teal)' }}>
            <Icon name="mail" size={13} /> {PERSON.email}
          </a>
        </div>
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center' }}>
          {PERSON.links.map(l => (
            <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" style={link} title={l.label}>
              <Icon name={l.icon} size={14} /> {l.label}
            </a>
          ))}
          <Link to={FLATTENING.to} style={link}><Icon name="risk" size={14} /> {FLATTENING.title}</Link>
          <Link to={SITE.documents} style={link}><Icon name="documents" size={14} /> Documents</Link>
        </div>
      </div>
      <div style={{ maxWidth: 960, margin: '12px auto 0', color: 'var(--text-faint)', fontSize: 11 }}>
        {'©'} {year} {PERSON.name}. No analytics, no cookies, no user data collected.
      </div>
    </footer>
  );
}
