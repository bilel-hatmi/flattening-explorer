import useDocumentTitle from '../../hooks/useDocumentTitle';
import useIsMobile from '../../hooks/useIsMobile';
import Section, { Page, PageHeader } from '../../components/site/Section';
import DocCard, { DocGrid } from '../../components/site/DocCard';
import { DOCUMENTS, DOCUMENT_KINDS } from '../../content/documents';

export default function Documents() {
  useDocumentTitle('Documents');
  const isMobile = useIsMobile();
  const grid = isMobile ? { gridTemplateColumns: '1fr' } : {};

  return (
    <Page wide>
      <PageHeader title="Documents" lede="Essays, posters, presentations and code. Everything here is a download or a link; the in-progress items appear greyed out until they are ready." />
      {DOCUMENT_KINDS.map((k, i) => {
        const docs = DOCUMENTS.filter(d => d.kind === k.id);
        if (docs.length === 0) return null;
        return (
          <Section key={k.id} title={k.label} first={i === 0}>
            <DocGrid style={{ marginBottom: 0, ...grid }}>
              {docs.map(d => <DocCard key={d.id} {...d} full={d.full && !isMobile} />)}
            </DocGrid>
          </Section>
        );
      })}
    </Page>
  );
}
