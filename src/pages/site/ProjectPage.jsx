import { Link, useParams } from 'react-router-dom';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import useIsMobile from '../../hooks/useIsMobile';
import Card, { CardGrid } from '../../components/site/Card';
import Section, { Page, PageHeader } from '../../components/site/Section';
import Prose from '../../components/site/Prose';
import { TagRow } from '../../components/site/Tag';
import NotFound from './NotFound';
import { getProject } from '../../content/projects';
import { SITE } from '../../routes';

const isExternal = href => href && /^https?:\/\//.test(href);

function ProjectLink({ l }) {
  const style = {
    display: 'inline-block', padding: '9px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
    background: 'var(--teal-tint)', border: '0.5px solid var(--teal-line)', color: 'var(--navy)',
    textDecoration: 'none', whiteSpace: 'nowrap',
  };
  if (l.comingSoon || !l.href) {
    return <span style={{ ...style, opacity: 0.6, cursor: 'default' }}>{l.label} <span style={{ color: 'var(--warning)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>soon</span></span>;
  }
  if (l.external || isExternal(l.href) || l.href.startsWith('/docs/')) {
    return <a href={l.href} target="_blank" rel="noopener noreferrer" style={style}>{l.label} {'↗'}</a>;
  }
  return <Link to={l.href} style={style}>{l.label} {'→'}</Link>;
}

export default function ProjectPage() {
  const { slug } = useParams();
  const p = getProject(slug);
  const isMobile = useIsMobile();
  useDocumentTitle(p ? p.title : 'Not found');
  if (!p) return <NotFound />;

  return (
    <Page>
      <div style={{ marginBottom: 20 }}>
        <Link to={SITE.projects} style={{ fontSize: 12, color: 'var(--text-muted)' }}>{'←'} All projects</Link>
      </div>
      <PageHeader kicker={`${p.period} · ${p.status}`} title={p.title} lede={p.kicker}>
        <TagRow tags={p.tags} style={{ marginTop: 14 }} />
      </PageHeader>

      <p style={{ fontSize: 17, lineHeight: 1.55, color: 'var(--navy)', marginBottom: 24 }}>{p.summary}</p>

      {p.links.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
          {p.links.map(l => <ProjectLink key={l.label} l={l} />)}
        </div>
      )}

      {p.subprojects && (
        <Section title="The projects">
          <CardGrid min={isMobile ? 240 : 300}>
            {p.subprojects.map(s => (
              <Card key={s.id} kicker={s.id} title={s.title} desc={s.summary} />
            ))}
          </CardGrid>
        </Section>
      )}

      {p.body && (
        <Section>
          <Prose markdown={p.body} />
        </Section>
      )}
    </Page>
  );
}
