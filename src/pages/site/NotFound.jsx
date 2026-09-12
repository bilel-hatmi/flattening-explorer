import { Link } from 'react-router-dom';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { SITE } from '../../routes';

export default function NotFound() {
  useDocumentTitle('Not found');
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '120px 24px 96px', textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-faint)', marginBottom: 12 }}>404</div>
      <h1 style={{ fontFamily: 'var(--font-title)', fontSize: 40, color: 'var(--navy)', marginBottom: 16 }}>
        Nothing at this address
      </h1>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>
        The page may have moved, or the link was never right.
      </p>
      <Link to={SITE.home} style={{
        display: 'inline-block', padding: '10px 24px', borderRadius: 8,
        background: 'var(--navy)', color: '#FFFFFF', fontSize: 13, fontWeight: 600, textDecoration: 'none',
      }}>
        Back to the home page
      </Link>
    </div>
  );
}
