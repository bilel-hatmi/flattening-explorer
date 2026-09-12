import { Link } from 'react-router-dom';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import useIsMobile from '../../hooks/useIsMobile';
import { Page, PageHeader } from '../../components/site/Section';
import { TagRow } from '../../components/site/Tag';
import { NOTES, formatNoteDate } from '../../content/notes';
import { SITE } from '../../routes';

export default function Notes() {
  useDocumentTitle('Notes');
  const isMobile = useIsMobile();

  return (
    <Page>
      <PageHeader title="Notes" lede="Short pieces: readings, working notes, things worth writing down once." />
      {NOTES.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Nothing here yet.</p>
      ) : (
        <div style={{ borderTop: '0.5px solid var(--rule)' }}>
          {NOTES.map(n => (
            <Link key={n.slug} to={`${SITE.notes}/${n.slug}`} style={{
              display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '150px 1fr', gap: isMobile ? 4 : 24,
              padding: '20px 0', borderBottom: '0.5px solid var(--rule)', color: 'var(--navy)', textDecoration: 'none',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', paddingTop: 5 }}>
                {formatNoteDate(n.date)}
                {n.draft && <span style={{ color: 'var(--warning)', marginLeft: 8 }}>draft</span>}
              </span>
              <span>
                <span style={{ fontFamily: 'var(--font-title)', fontSize: 22, display: 'block', lineHeight: 1.2 }}>{n.title}</span>
                {n.summary && <span style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--text-muted)', display: 'block', marginTop: 6 }}>{n.summary}</span>}
                <TagRow tags={n.tags} style={{ marginTop: 10 }} />
              </span>
            </Link>
          ))}
        </div>
      )}
    </Page>
  );
}
