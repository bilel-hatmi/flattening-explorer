import { Link, useParams } from 'react-router-dom';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import useIsMobile from '../../hooks/useIsMobile';
import Section, { Page, PageHeader } from '../../components/site/Section';
import Prose from '../../components/site/Prose';
import { TagRow } from '../../components/site/Tag';
import Icon, { IconBadge } from '../../components/site/Icon';
import NotFound from './NotFound';
import { getProject, childrenOf } from '../../content/projects';
import { SITE } from '../../routes';

const isExternal = href => href && /^https?:\/\//.test(href);

const LINK_ICONS = { explorer: 'risk', pdf: 'documents', code: 'agents' };

function ProjectLink({ l, primary }) {
  const style = {
    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
    textDecoration: 'none', whiteSpace: 'nowrap',
    ...(primary
      ? { background: 'var(--navy)', color: '#FFFFFF' }
      : { background: 'var(--teal-tint)', border: '0.5px solid var(--teal-line)', color: 'var(--navy)' }),
  };
  const kind = /pdf/i.test(l.label) ? 'pdf' : /code|github/i.test(l.label) ? 'code' : /explorer/i.test(l.label) ? 'explorer' : null;
  const glyph = kind ? <Icon name={LINK_ICONS[kind]} size={15} /> : null;
  if (l.comingSoon || !l.href) {
    return <span style={{ ...style, opacity: 0.6, cursor: 'default' }}>{glyph}{l.label} <span style={{ color: 'var(--warning)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>soon</span></span>;
  }
  if (l.external || isExternal(l.href) || l.href.startsWith('/docs/')) {
    return <a href={l.href} target="_blank" rel="noopener noreferrer" style={style}>{glyph}{l.label} {'↗'}</a>;
  }
  return <Link to={l.href} style={style}>{glyph}{l.label} {'→'}</Link>;
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 500, letterSpacing: '0.03em', textTransform: 'uppercase', color: 'var(--teal)', marginBottom: 4 }}>
          <Icon name="deck" size={14} /> Project deck
        </div>
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
  const siblings = parent ? childrenOf(parent.slug).filter(c => c.slug !== p.slug) : [];

  return (
    <Page>
      <div style={{ marginBottom: 20, fontSize: 12, color: 'var(--text-muted)' }}>
        <Link to={SITE.projects} style={{ color: 'var(--text-muted)' }}>{'←'} All projects</Link>
      </div>

      <div style={{ display: 'flex', gap: isMobile ? 14 : 22, alignItems: 'flex-start' }}>
        {p.icon && <IconBadge name={p.icon} size={isMobile ? 44 : 56} tone={p.group === 'paused' ? 'purple' : p.group === 'earlier' ? 'navy' : 'teal'} />}
        <div style={{ minWidth: 0, flex: 1 }}>
          <PageHeader kicker={`${p.period} · ${p.status}`} title={p.title} lede={p.kicker}>
            <TagRow tags={p.tags} style={{ marginTop: 14 }} />
          </PageHeader>
        </div>
      </div>

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

      {parent && (
        <Section>
          <div style={{
            display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', fontSize: 13, color: 'var(--text-muted)',
            background: 'var(--card-bg)', border: '0.5px solid var(--card-border)', borderRadius: 10, padding: '14px 16px',
          }}>
            <IconBadge name="supervision" size={32} tone="navy" />
            <span>
              Supervised at <Link to={`${SITE.projects}/${parent.slug}`}>SRIE</Link>, with{' '}
              {siblings.map((c, i) => (
                <span key={c.slug}><Link to={`${SITE.projects}/${c.slug}`}>{c.title}</Link>{i < siblings.length - 1 ? ' and ' : '.'}</span>
              ))}
            </span>
          </div>
        </Section>
      )}
    </Page>
  );
}
