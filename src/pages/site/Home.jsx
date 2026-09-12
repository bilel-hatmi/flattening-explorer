import { Link } from 'react-router-dom';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import useIsMobile from '../../hooks/useIsMobile';
import Card, { CardGrid } from '../../components/site/Card';
import Section, { Page } from '../../components/site/Section';
import { TagRow } from '../../components/site/Tag';
import { PERSON, FLATTENING } from '../../content/site';
import { FEATURED_PROJECTS } from '../../content/projects';
import { NOTES, formatNoteDate } from '../../content/notes';
import { SITE } from '../../routes';

const isTodo = s => typeof s === 'string' && s.startsWith('[TODO');

function Monogram({ size }) {
  return (
    <div aria-hidden="true" style={{
      width: size, height: size, borderRadius: '50%', background: 'var(--navy)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      fontFamily: 'var(--font-title)', fontSize: size * 0.46, color: 'var(--cream)',
    }}>
      {PERSON.name.split(' ').map(w => w[0]).join('')}
    </div>
  );
}

function Portrait({ size }) {
  if (!PERSON.portrait) return <Monogram size={size} />;
  return (
    <img src={PERSON.portrait} alt={PERSON.name} style={{
      width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0,
    }} />
  );
}

const btn = (primary) => ({
  display: 'inline-block', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
  textDecoration: 'none', whiteSpace: 'nowrap',
  ...(primary
    ? { background: 'var(--navy)', color: '#FFFFFF' }
    : { background: 'var(--teal-tint)', border: '0.5px solid var(--teal-line)', color: 'var(--navy)' }),
});

export default function Home() {
  useDocumentTitle(null);
  const isMobile = useIsMobile();
  const projects = FEATURED_PROJECTS.filter(p => p.slug !== 'the-flattening');
  const notes = NOTES.slice(0, 3);

  return (
    <Page wide>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section style={{
        display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center',
        gap: isMobile ? 24 : 48, padding: isMobile ? '16px 0 40px' : '40px 0 64px',
        borderBottom: '0.5px solid var(--rule)',
      }}>
        <Portrait size={isMobile ? 88 : 148} />
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontFamily: 'var(--font-title)', fontSize: isMobile ? 40 : 56, color: 'var(--navy)', lineHeight: 1.05, marginBottom: 10 }}>
            {PERSON.name}
          </h1>
          <div style={{ fontSize: 15, color: 'var(--teal)', fontWeight: 500, marginBottom: 6 }}>{PERSON.affiliation}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 18 }}>{PERSON.role}</div>
          <p style={{
            fontSize: isMobile ? 16 : 18, lineHeight: 1.5, color: 'var(--navy)', maxWidth: 620, marginBottom: 22,
            ...(isTodo(PERSON.shortBio) ? { color: 'var(--text-faint)', fontStyle: 'italic' } : {}),
          }}>
            {PERSON.shortBio}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <Link to={SITE.projects} style={btn(true)}>See the projects</Link>
            {PERSON.links.filter(l => !isTodo(l.href)).map(l => (
              <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" style={btn(false)}>{l.label}</a>
            ))}
          </div>
        </div>
      </section>

      {/* ── The Flattening ────────────────────────────────────────── */}
      <Section kicker={FLATTENING.kicker} title={FLATTENING.title}
        aside={<Link to={`${SITE.projects}/the-flattening`}>About the project {'→'}</Link>}>
        <Card style={{ padding: isMobile ? '22px 20px' : '28px 32px', gap: 0 }}>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 22 : 40, alignItems: isMobile ? 'stretch' : 'center' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--navy)', marginBottom: 18 }}>{FLATTENING.summary}</p>
              <Link to={FLATTENING.to} style={btn(true)}>{FLATTENING.cta} {'→'}</Link>
            </div>
            <div style={{ display: 'flex', gap: 12, flexShrink: 0, justifyContent: isMobile ? 'space-between' : 'flex-end' }}>
              {FLATTENING.counters.map(c => (
                <div key={c.label} style={{ textAlign: 'center', minWidth: isMobile ? 0 : 96, flex: isMobile ? 1 : 'none' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: isMobile ? 22 : 28, fontWeight: 700, color: `var(--${c.tone})` }}>{c.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{c.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </Section>

      {/* ── Projects ──────────────────────────────────────────────── */}
      <Section kicker="Current work" title="Projects" aside={<Link to={SITE.projects}>All projects {'→'}</Link>}>
        <CardGrid min={280}>
          {projects.map(p => (
            <Card key={p.slug} as="link" to={`${SITE.projects}/${p.slug}`} kicker={p.kicker} title={p.title}
              desc={p.summary} badge={`${p.period} · ${p.status}`}>
              <TagRow tags={p.tags.slice(0, 3)} style={{ marginTop: 6 }} />
            </Card>
          ))}
        </CardGrid>
      </Section>

      {/* ── Notes ─────────────────────────────────────────────────── */}
      {notes.length > 0 && (
        <Section kicker="Writing" title="Latest notes" aside={<Link to={SITE.notes}>All notes {'→'}</Link>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, borderTop: '0.5px solid var(--rule)' }}>
            {notes.map(n => (
              <Link key={n.slug} to={`${SITE.notes}/${n.slug}`} style={{
                display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '140px 1fr', gap: isMobile ? 4 : 24,
                padding: '16px 0', borderBottom: '0.5px solid var(--rule)', color: 'var(--navy)', textDecoration: 'none',
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', paddingTop: 4 }}>{formatNoteDate(n.date)}</span>
                <span>
                  <span style={{ fontFamily: 'var(--font-title)', fontSize: 19, display: 'block', lineHeight: 1.25 }}>{n.title}</span>
                  {n.summary && <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginTop: 4 }}>{n.summary}</span>}
                </span>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* ── Contact ───────────────────────────────────────────────── */}
      <Section>
        <div style={{ background: 'rgba(34,55,90,0.04)', borderRadius: 10, padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--navy)', fontWeight: 600, marginBottom: 6 }}>Get in touch</div>
          <a href={`mailto:${PERSON.email}`} style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{PERSON.email}</a>
        </div>
      </Section>
    </Page>
  );
}
