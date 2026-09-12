import { Link, useParams } from 'react-router-dom';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { Page, PageHeader } from '../../components/site/Section';
import Prose from '../../components/site/Prose';
import { TagRow } from '../../components/site/Tag';
import NotFound from './NotFound';
import { getNote, formatNoteDate } from '../../content/notes';
import { SITE } from '../../routes';

export default function NotePage() {
  const { slug } = useParams();
  const note = getNote(slug);
  useDocumentTitle(note ? note.title : 'Not found');
  if (!note) return <NotFound />;

  return (
    <Page>
      <div style={{ marginBottom: 20 }}>
        <Link to={SITE.notes} style={{ fontSize: 12, color: 'var(--text-muted)' }}>{'←'} All notes</Link>
      </div>
      <PageHeader kicker={formatNoteDate(note.date)} title={note.title} lede={note.summary}>
        <TagRow tags={note.tags} style={{ marginTop: 14 }} />
      </PageHeader>
      <Prose markdown={note.content} />
    </Page>
  );
}
