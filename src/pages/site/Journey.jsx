import useDocumentTitle from '../../hooks/useDocumentTitle';
import Section, { Page, PageHeader } from '../../components/site/Section';
import Timeline, { TimelineLegend } from '../../components/site/Timeline';
import { JOURNEY, ASIDES } from '../../content/journey';
import { PERSON } from '../../content/site';
import { LINKS } from '../../content/documents';

export default function Journey() {
  useDocumentTitle('Journey');
  return (
    <Page>
      <PageHeader title="Journey" lede={PERSON.longBio}>
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
      <Section first>
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
