import useDocumentTitle from '../../hooks/useDocumentTitle';
import useIsMobile from '../../hooks/useIsMobile';
import { Page, PageHeader } from '../../components/site/Section';
import Card, { CardGrid } from '../../components/site/Card';
import Reveal from '../../components/site/Reveal';
import Prose from '../../components/site/Prose';
import parseFrontmatter from '../../utils/frontmatter';
import raw from '../../content/research.md?raw';
import { RESEARCH_LINES } from '../../content/research';

// research.md is one file: a lede, then "## " sections. The page numbers the
// sections, sets the first one (the vision) in a framed panel, and drops the
// four project cards where "Current work" carries the <!-- lines --> marker.
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

const num = n => String(n).padStart(2, '0');

function Heading({ n, title }) {
  return (
    <header style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 16 }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--teal)', letterSpacing: '0.04em' }}>{num(n)}</span>
      <h2 style={{ fontFamily: 'var(--font-title)', fontSize: 28, lineHeight: 1.15, color: 'var(--navy)', margin: 0 }}>{title}</h2>
    </header>
  );
}

function ResearchSection({ n, section, highlight, isMobile }) {
  const hasLines = section.body.includes('<!-- lines -->');
  const [intro, closing] = hasLines ? section.body.split('<!-- lines -->') : [section.body, null];
  const panel = highlight ? {
    background: 'var(--card-bg)', border: '0.5px solid var(--card-border)', borderLeft: '3px solid var(--teal)',
    borderRadius: 14, padding: isMobile ? '22px 20px 20px' : '30px 34px 28px',
    boxShadow: '0 20px 44px -36px rgba(34,55,90,0.35)',
  } : {};

  return (
    <Reveal as="section" id={section.id} style={{ marginBottom: 52, ...panel }}>
      <Heading n={n} title={section.title} />
      <Prose markdown={intro.trim()} />
      {hasLines && (
        <CardGrid min={isMobile ? 240 : 300} style={{ margin: '24px 0' }}>
          {RESEARCH_LINES.map(l => (
            <Card key={l.to} as="link" to={l.to} icon={l.icon} title={l.title} desc={l.text} badge={l.tag} />
          ))}
        </CardGrid>
      )}
      {closing && <Prose markdown={closing.trim()} />}
    </Reveal>
  );
}

export default function Research() {
  useDocumentTitle('Research');
  const isMobile = useIsMobile();

  return (
    <Page>
      <PageHeader kicker="Vision, then what is under way" title="Research" lede={LEDE} />

      <nav aria-label="On this page" style={{
        display: 'flex', flexWrap: 'wrap', gap: isMobile ? '8px 14px' : '8px 22px', marginTop: -18, marginBottom: 40,
        fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.02em',
      }}>
        {SECTIONS.map((s, i) => (
          <a key={s.id} href={`#${s.id}`} style={{ color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--teal)' }}>{num(i + 1)}</span>{'  '}{s.title}
          </a>
        ))}
      </nav>

      {SECTIONS.map((s, i) => (
        <ResearchSection key={s.id} n={i + 1} section={s} highlight={i === 0} isMobile={isMobile} />
      ))}
    </Page>
  );
}
