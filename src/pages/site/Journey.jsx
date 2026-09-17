import useDocumentTitle from '../../hooks/useDocumentTitle';
import useIsMobile from '../../hooks/useIsMobile';
import Section, { Page, PageHeader } from '../../components/site/Section';
import Timeline, { TimelineLegend } from '../../components/site/Timeline';
import { JOURNEY, NARRATIVES, ASIDES } from '../../content/journey';
import { PERSON } from '../../content/site';
import { LINKS } from '../../content/documents';

export default function Journey() {
  useDocumentTitle('Journey');
  const isMobile = useIsMobile();

  return (
    <Page>
      <PageHeader title="Journey" lede={PERSON.longBio[0]}>
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

      <div className="prose" style={{ marginBottom: 48 }}>
        {PERSON.longBio.slice(1).map((para, i) => <p key={i}>{para}</p>)}
      </div>

      {/* ── Two narratives, side by side on desktop ─────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 18, marginBottom: 56 }}>
        {NARRATIVES.map(n => (
          <article key={n.id} style={{
            background: 'var(--card-bg)', border: '0.5px solid var(--card-border)', borderRadius: 'var(--card-radius)',
            padding: '22px 24px 20px',
          }}>
            <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--teal)', marginBottom: 6 }}>{n.kicker}</div>
            <h2 style={{ fontFamily: 'var(--font-title)', fontSize: 24, lineHeight: 1.15, color: 'var(--navy)', marginBottom: 12 }}>{n.title}</h2>
            {n.body.map((para, i) => (
              <p key={i} style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--navy)', marginBottom: i < n.body.length - 1 ? 10 : 0 }}>{para}</p>
            ))}
          </article>
        ))}
      </div>

      <Section title="Timeline" first>
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
