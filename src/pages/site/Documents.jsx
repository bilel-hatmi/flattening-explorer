import useDocumentTitle from '../../hooks/useDocumentTitle';
import useIsMobile from '../../hooks/useIsMobile';
import Section, { Page, PageHeader, SectionNav } from '../../components/site/Section';
import Reveal from '../../components/site/Reveal';
import DocCard, { DocGrid } from '../../components/site/DocCard';
import { DOCUMENTS, DOCUMENT_KINDS } from '../../content/documents';

const GROUPS = DOCUMENT_KINDS
  .map(k => ({ ...k, docs: DOCUMENTS.filter(d => d.kind === k.id) }))
  .filter(k => k.docs.length > 0)
  .map(k => ({ ...k, title: k.label, count: k.docs.length }));

export default function Documents() {
  useDocumentTitle('Documents');
  const isMobile = useIsMobile();
  const grid = isMobile ? { gridTemplateColumns: '1fr' } : {};

  return (
    <Page wide>
      <PageHeader title="Documents" lede="Essays, the poster, the three project decks, reports and code. Each card opens the document in a new tab; the one item still being written is greyed out." />
      <SectionNav items={GROUPS} />
      {GROUPS.map((k, i) => (
        <Reveal key={k.id}>
          <Section id={k.id} num={i + 1} title={k.title} first={i === 0}>
            <DocGrid style={{ marginBottom: 0, ...grid }}>
              {k.docs.map(d => <DocCard key={d.id} {...d} full={d.full && !isMobile} />)}
            </DocGrid>
          </Section>
        </Reveal>
      ))}
    </Page>
  );
}
