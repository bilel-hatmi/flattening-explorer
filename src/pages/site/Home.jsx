import { Link } from 'react-router-dom';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { PERSON, FLATTENING } from '../../content/site';

// Provisional home (phase 1). Replaced by the full page in phase 3.
export default function Home() {
  useDocumentTitle(null);
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '96px 24px' }}>
      <h1 style={{ fontFamily: 'var(--font-title)', fontSize: 48, color: 'var(--navy)', marginBottom: 12 }}>{PERSON.name}</h1>
      <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 32 }}>{PERSON.role}</p>
      <Link to={FLATTENING.to}>{FLATTENING.cta} {'→'}</Link>
    </div>
  );
}
