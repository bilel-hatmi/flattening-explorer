import useDocumentTitle from '../../hooks/useDocumentTitle';
import useIsMobile from '../../hooks/useIsMobile';
import Section, { Page, PageHeader, SectionNav } from '../../components/site/Section';
import Card, { CardGrid } from '../../components/site/Card';
import Reveal from '../../components/site/Reveal';
import Prose from '../../components/site/Prose';
import parseFrontmatter from '../../utils/frontmatter';
import raw from '../../content/research.md?raw';
import { RESEARCH_LINES } from '../../content/research';

// research.md is one file: a lede, then "## " sections. Each section becomes
// a numbered panel (I, II, III); "Current work" carries the <!-- lines -->
// marker where the four project cards go.
const { content } = parseFrontmatter(raw);
const [head, ...chunks] = content.split(/\n## /);
const LEDE = head.trim();
const SECTIONS = chunks.map(chunk => {
  const nl = chunk.indexOf('\n');
  const title = chunk.slice(0, nl).trim();
  return {
    id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    title,
    body: chunk.slice(nl + 1).trim(),
  };
});

function ResearchSection({ n, section, isMobile }) {
  const hasLines = section.body.includes('<!-- lines -->');
  const [intro, closing] = hasLines ? section.body.split('<!-- lines -->') : [section.body, null];
  return (
    <Reveal>
      <Section id={section.id} num={n} title={section.title} panel first={n === 1}>
        <Prose markdown={intro.trim()} />
        {hasLines && (
          <CardGrid min={isMobile ? 240 : 290} style={{ margin: '24px 0' }}>
            {RESEARCH_LINES.map(l => (
              <Card key={l.to} as="link" to={l.to} icon={l.icon} title={l.title} desc={l.text} badge={l.tag} />
            ))}
          </CardGrid>
        )}
        {closing && <Prose markdown={closing.trim()} />}
      </Section>
    </Reveal>
  );
}

export default function Research() {
  useDocumentTitle('Research');
  const isMobile = useIsMobile();

  return (
    <Page>
      <PageHeader kicker="Vision and current work" title="Research" lede={LEDE} />
      <SectionNav items={SECTIONS} />
      {SECTIONS.map((s, i) => <ResearchSection key={s.id} n={i + 1} section={s} isMobile={isMobile} />)}
    </Page>
  );
}
