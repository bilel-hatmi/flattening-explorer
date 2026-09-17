import { Link } from 'react-router-dom';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import Card, { CardGrid } from '../../components/site/Card';
import Section, { Page, PageHeader } from '../../components/site/Section';
import { TagRow } from '../../components/site/Tag';
import { CURRENT_PROJECTS, EARLIER_PROJECTS, PAUSED_PROJECTS } from '../../content/projects';
import { SITE } from '../../routes';

function ProjectCard({ p, tone }) {
  return (
    <Card as="link" to={`${SITE.projects}/${p.slug}`} icon={p.icon} iconTone={tone} logo={p.logo} kicker={p.kicker} title={p.title}
      desc={p.summary} badge={`${p.period} · ${p.status}`}>
      <TagRow tags={p.tags.slice(0, 4)} style={{ marginTop: 6 }} />
    </Card>
  );
}

export default function Projects() {
  useDocumentTitle('Projects');
  return (
    <Page wide>
      <PageHeader title="Projects" lede="Research, models and things being built. Each page has the short version first and the long version below it." />
      <Section title="Current" first
        aside={<span>Three of these run at SRIE, where I supervise seven students: <Link to={`${SITE.projects}/srie-2026`}>how the stream works {'→'}</Link></span>}>
        <CardGrid min={280}>
          {CURRENT_PROJECTS.map(p => <ProjectCard key={p.slug} p={p} tone="teal" />)}
        </CardGrid>
      </Section>
      <Section title="Earlier">
        <CardGrid min={280}>
          {EARLIER_PROJECTS.map(p => <ProjectCard key={p.slug} p={p} tone="navy" />)}
        </CardGrid>
      </Section>
      {PAUSED_PROJECTS.length > 0 && (
        <Section title="Paused">
          <CardGrid min={280}>
            {PAUSED_PROJECTS.map(p => <ProjectCard key={p.slug} p={p} tone="purple" />)}
          </CardGrid>
        </Section>
      )}
    </Page>
  );
}
