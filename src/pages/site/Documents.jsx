import useDocumentTitle from '../../hooks/useDocumentTitle';
import useIsMobile from '../../hooks/useIsMobile';
import Section, { Page, PageHeader } from '../../components/site/Section';
import Reveal from '../../components/site/Reveal';
import DocCard, { DocGrid } from '../../components/site/DocCard';
import { DOCUMENTS, DOCUMENT_KINDS } from '../../content/documents';

export default function Documents() {
  useDocumentTitle('Documents');
  const isMobile = useIsMobile();
  const grid = isMobile ? { gridTemplateColumns: '1fr' } : {};

  return (
    <Page wide>
      <PageHeader title="Documents" lede="Essays, the poster, the three project decks, reports and code. Each card opens the document in a new tab; the one item still being written is greyed out." />
      {DOCUMENT_KINDS.map((k, i) => {
        const docs = DOCUMENTS.filter(d => d.kind === k.id);
        if (docs.length === 0) return null;
        return (
          <Reveal key={k.id}>
            <Section title={k.label} first={i === 0}>
              <DocGrid style={{ marginBottom: 0, ...grid }}>
                {docs.map(d => <DocCard key={d.id} {...d} full={d.full && !isMobile} />)}
              </DocGrid>
            </Section>
          </Reveal>
        );
      })}
    </Page>
  );
}
