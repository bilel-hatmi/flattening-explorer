import { Link } from 'react-router-dom';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import useIsMobile from '../../hooks/useIsMobile';
import Section, { Page, PageHeader } from '../../components/site/Section';
import Timeline, { TimelineLegend } from '../../components/site/Timeline';
import { IconBadge } from '../../components/site/Icon';
import { JOURNEY, NARRATIVES, ASIDES } from '../../content/journey';
import { PERSON } from '../../content/site';
import { LINKS } from '../../content/documents';

const NARRATIVE_ICONS = { 'giving-back': 'giving', sport: 'sport' };

export default function Journey() {
  useDocumentTitle('Journey');
  const isMobile = useIsMobile();
  const bio = PERSON.bio;

  return (
    <Page>
      <PageHeader title="Journey" lede={bio.intro}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16, marginTop: 20 }}>
          <a href={LINKS.cv} target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-block', padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: 'var(--navy)', color: '#FFFFFF', textDecoration: 'none',
          }}>
            Curriculum vitae (PDF) {'↗'}
          </a>
          <TimelineLegend />
        </div>
      </PageHeader>

      {/* ── About, in the order of the LinkedIn text ─────────────────── */}
      <div className="prose" style={{ marginBottom: 56 }}>
        <p>{bio.origin}</p>
        <p>{bio.training}</p>
        <p>{bio.linesLead}</p>
        <ul>
          {bio.lines.map(l => (
            <li key={l.to}>{l.text.replace(/[;.]$/, '')} <Link to={l.to} style={{ whiteSpace: 'nowrap' }}>{'→'} project page</Link></li>
          ))}
        </ul>
        <p>{bio.linesClose}</p>
        <p>{bio.closing}</p>
      </div>

      {/* ── Two sections of their own ─────────────────────────────────── */}
      {NARRATIVES.map(n => (
        <Section key={n.id} kicker={n.kicker} title={n.title}>
          <div style={{ display: 'flex', gap: isMobile ? 14 : 22, alignItems: 'flex-start' }}>
            <IconBadge name={NARRATIVE_ICONS[n.id]} size={isMobile ? 40 : 48} tone="purple" />
            <div className="prose" style={{ minWidth: 0, fontSize: 15 }}>
              {n.body.map((para, i) => <p key={i}>{para}</p>)}
            </div>
          </div>
        </Section>
      ))}

      <Section title="Timeline">
        <Timeline entries={JOURNEY} />
      </Section>

      <Section title="Also">
        <dl style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', columnGap: 24, rowGap: 12, fontSize: 14, lineHeight: 1.6, margin: 0 }}>
          {ASIDES.map(a => (
            <div key={a.label} style={{ display: 'contents' }}>
              <dt style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', paddingTop: 4 }}>{a.label}</dt>
              <dd style={{ margin: 0, color: 'var(--navy)' }}>{a.text}</dd>
            </div>
          ))}
        </dl>
      </Section>
    </Page>
  );
}
