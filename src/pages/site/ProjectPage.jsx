import { Link, useParams } from 'react-router-dom';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import useIsMobile from '../../hooks/useIsMobile';
import Card, { CardGrid } from '../../components/site/Card';
import Section, { Page, PageHeader } from '../../components/site/Section';
import Prose from '../../components/site/Prose';
import { TagRow } from '../../components/site/Tag';
import NotFound from './NotFound';
import { getProject, childrenOf } from '../../content/projects';
import { SITE } from '../../routes';

const isExternal = href => href && /^https?:\/\//.test(href);

function ProjectLink({ l, primary }) {
  const style = {
    display: 'inline-block', padding: '9px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
    textDecoration: 'none', whiteSpace: 'nowrap',
    ...(primary
      ? { background: 'var(--navy)', color: '#FFFFFF' }
      : { background: 'var(--teal-tint)', border: '0.5px solid var(--teal-line)', color: 'var(--navy)' }),
  };
  if (l.comingSoon || !l.href) {
    return <span style={{ ...style, opacity: 0.6, cursor: 'default' }}>{l.label} <span style={{ color: 'var(--warning)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>soon</span></span>;
  }
  if (l.external || isExternal(l.href) || l.href.startsWith('/docs/')) {
    return <a href={l.href} target="_blank" rel="noopener noreferrer" style={style}>{l.label} {'↗'}</a>;
  }
  return <Link to={l.href} style={style}>{l.label} {'→'}</Link>;
}

// Deck strip: the first slide as a thumbnail, the PDF as the link.
function DeckStrip({ deck, isMobile }) {
  return (
    <a href={deck.href} target="_blank" rel="noopener noreferrer" style={{
      display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 12 : 20, alignItems: isMobile ? 'stretch' : 'center',
      background: 'var(--card-bg)', border: '0.5px solid var(--card-border)', borderRadius: 'var(--card-radius)',
      padding: 12, textDecoration: 'none', color: 'var(--navy)', marginBottom: 8,
    }}>
      <img src={deck.thumb} alt="" style={{ width: isMobile ? '100%' : 220, aspectRatio: '16 / 9', objectFit: 'cover', borderRadius: 6, display: 'block', flexShrink: 0 }} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.03em', textTransform: 'uppercase', color: 'var(--teal)', marginBottom: 4 }}>Project deck</div>
        <div style={{ fontFamily: 'var(--font-title)', fontSize: 20, lineHeight: 1.2, marginBottom: 4 }}>{deck.label}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>The presentation given to the students at the start of the stream: diagnosis, mechanism, open questions, roadmap, bibliography. Opens in a new tab.</div>
      </div>
    </a>
  );
}

export default function ProjectPage() {
  const { slug } = useParams();
  const p = getProject(slug);
  const isMobile = useIsMobile();
  useDocumentTitle(p ? p.title : 'Not found');
  if (!p) return <NotFound />;
  const parent = p.parent ? getProject(p.parent) : null;
  const children = childrenOf(p.slug);

  return (
    <Page>
      <div style={{ marginBottom: 20, fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Link to={SITE.projects} style={{ color: 'var(--text-muted)' }}>{'←'} All projects</Link>
        {parent && <><span>{'·'}</span><Link to={`${SITE.projects}/${parent.slug}`} style={{ color: 'var(--text-muted)' }}>{parent.title}</Link></>}
      </div>
      <PageHeader kicker={`${p.period} · ${p.status}`} title={p.title} lede={p.kicker}>
        <TagRow tags={p.tags} style={{ marginTop: 14 }} />
      </PageHeader>

      <p style={{ fontSize: 17, lineHeight: 1.55, color: 'var(--navy)', marginBottom: 24 }}>{p.summary}</p>

      {p.links.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
          {p.links.map((l, i) => <ProjectLink key={l.label} l={l} primary={i === 0} />)}
        </div>
      )}

      {p.deck && <DeckStrip deck={p.deck} isMobile={isMobile} />}

      {p.body && (
        <Section style={{ marginTop: 32 }}>
          <Prose markdown={p.body} />
        </Section>
      )}

      {children.length > 0 && (
        <Section title="The three projects, one page each">
          <CardGrid min={isMobile ? 240 : 220}>
            {children.map(c => (
              <Card key={c.slug} as="link" to={`${SITE.projects}/${c.slug}`} kicker={c.kicker} title={c.title} desc={c.summary} badge={c.status} />
            ))}
          </CardGrid>
        </Section>
      )}

      {parent && (
        <Section>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Part of <Link to={`${SITE.projects}/${parent.slug}`}>{parent.title}</Link>
            {' · '}
            {childrenOf(parent.slug).filter(c => c.slug !== p.slug).map((c, i, arr) => (
              <span key={c.slug}><Link to={`${SITE.projects}/${c.slug}`}>{c.title}</Link>{i < arr.length - 1 ? ' · ' : ''}</span>
            ))}
          </div>
        </Section>
      )}
    </Page>
  );
}
