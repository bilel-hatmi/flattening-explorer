import { Link } from 'react-router-dom';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import Card, { CardGrid } from '../../components/site/Card';
import Section, { Page, PageHeader, SectionNav } from '../../components/site/Section';
import Reveal from '../../components/site/Reveal';
import Icon from '../../components/site/Icon';
import { TagRow } from '../../components/site/Tag';
import { CURRENT_PROJECTS, EARLIER_PROJECTS, PAUSED_PROJECTS } from '../../content/projects';
import { SITE } from '../../routes';

const GROUPS = [
  { id: 'current', title: 'Current', items: CURRENT_PROJECTS, tone: 'teal' },
  { id: 'earlier', title: 'Earlier', items: EARLIER_PROJECTS, tone: 'navy' },
  { id: 'paused',  title: 'Paused',  items: PAUSED_PROJECTS,  tone: 'purple' },
].filter(g => g.items.length > 0).map(g => ({ ...g, count: g.items.length }));

function ProjectCard({ p, tone }) {
  return (
    <Card as="link" to={`${SITE.projects}/${p.slug}`} icon={p.icon} iconTone={tone} logo={p.logo} kicker={p.kicker} title={p.title}
      desc={p.summary} badge={`${p.period} · ${p.status}`} style={{ flex: 1 }}>
      <TagRow tags={p.tags.slice(0, 4)} style={{ marginTop: 6 }} />
    </Card>
  );
}

export default function Projects() {
  useDocumentTitle('Projects');
  return (
    <Page wide>
      <PageHeader title="Projects" lede="Current research, earlier work, one paused project. Each page has the short version first and the long version below it." />
      <SectionNav items={GROUPS} />
      {GROUPS.map((g, gi) => (
        <Section key={g.id} id={g.id} num={gi + 1} title={g.title} first={gi === 0}
          aside={g.id === 'current' ? (
            <span>Three of these run at SRIE, where I supervise seven students: <Link to={`${SITE.projects}/srie-2026`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>how the stream works <Icon name="arrow" size={12} /></Link></span>
          ) : null}>
          <CardGrid min={280}>
            {g.items.map((p, i) => (
              <Reveal key={p.slug} delay={Math.min(i, 5) * 60} style={{ display: 'flex' }}>
                <ProjectCard p={p} tone={g.tone} />
              </Reveal>
            ))}
          </CardGrid>
        </Section>
      ))}
    </Page>
  );
}
