import { Link } from 'react-router-dom';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import useIsMobile from '../../hooks/useIsMobile';
import Card, { CardGrid } from '../../components/site/Card';
import Section, { Page } from '../../components/site/Section';
import { TagRow } from '../../components/site/Tag';
import Icon from '../../components/site/Icon';
import { PERSON, FLATTENING } from '../../content/site';
import { CURRENT_PROJECTS } from '../../content/projects';
import { SITE } from '../../routes';

function Portrait({ size }) {
  if (!PERSON.portrait) {
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
  return (
    <img src={PERSON.portrait} alt={PERSON.name} style={{
      width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0,
    }} />
  );
}

const btn = (primary) => ({
  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
  textDecoration: 'none', whiteSpace: 'nowrap',
  ...(primary
    ? { background: 'var(--navy)', color: '#FFFFFF' }
    : { background: 'var(--teal-tint)', border: '0.5px solid var(--teal-line)', color: 'var(--navy)' }),
});

export default function Home() {
  useDocumentTitle(null);
  const isMobile = useIsMobile();
  const current = CURRENT_PROJECTS.filter(p => p.slug !== 'the-flattening');

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
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--teal)', marginBottom: 10 }}>
            {PERSON.role}
          </div>
          <h1 style={{ fontFamily: 'var(--font-title)', fontSize: isMobile ? 40 : 56, color: 'var(--navy)', lineHeight: 1.05, marginBottom: 12 }}>
            {PERSON.name}
          </h1>
          <div style={{ fontFamily: 'var(--font-title)', fontSize: isMobile ? 22 : 26, color: 'var(--navy)', lineHeight: 1.2, marginBottom: 16 }}>
            {PERSON.tagline}
          </div>
          <p style={{ fontSize: isMobile ? 15 : 16, lineHeight: 1.6, color: 'var(--text-muted)', maxWidth: 640, marginBottom: 22 }}>
            {PERSON.shortBio}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <Link to={SITE.research} style={btn(true)}><Icon name="research" size={16} /> What I work on</Link>
            {PERSON.links.map(l => (
              <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" style={btn(false)}>{l.label}</a>
            ))}
          </div>
        </div>
      </section>

      {/* ── The Flattening ────────────────────────────────────────── */}
      <Section kicker={FLATTENING.kicker} title={FLATTENING.title}
        aside={<Link to={`${SITE.projects}/the-flattening`}>About the project {'→'}</Link>}>
        <Card style={{ padding: 0, gap: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>
            <Link to={`${SITE.projects}/the-flattening`} style={{
              flex: isMobile ? 'none' : '0 0 46%', background: '#FFFFFF', display: 'flex', alignItems: 'center', padding: 12, minHeight: isMobile ? 140 : 0,
            }}>
              <img src="/img/flattening/schema.png" alt="The mechanism of The Flattening, from the poster"
                style={{ width: '100%', height: 'auto', display: 'block' }} />
            </Link>
            <div style={{ padding: isMobile ? '22px 20px' : '28px 32px', flex: 1, minWidth: 0, borderLeft: isMobile ? 'none' : '0.5px solid var(--rule)' }}>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--navy)', marginBottom: 18 }}>{FLATTENING.summary}</p>
              <div style={{ display: 'flex', gap: 22, marginBottom: 20, flexWrap: 'wrap' }}>
                {FLATTENING.counters.map(c => (
                  <div key={c.label}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, color: `var(--${c.tone})` }}>{c.value}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{c.label}</div>
                  </div>
                ))}
              </div>
              <Link to={FLATTENING.to} style={btn(true)}>{FLATTENING.cta} {'→'}</Link>
            </div>
          </div>
        </Card>
      </Section>

      {/* ── Current work ──────────────────────────────────────────── */}
      <Section kicker="Current work" title="Four lines of research" aside={<Link to={SITE.projects}>All projects {'→'}</Link>}>
        <CardGrid min={260}>
          {current.map(p => (
            <Card key={p.slug} as="link" to={`${SITE.projects}/${p.slug}`} icon={p.icon} kicker={p.kicker} title={p.title}
              desc={p.summary} badge={p.status}>
              <TagRow tags={p.tags.slice(0, 3)} style={{ marginTop: 6 }} />
            </Card>
          ))}
        </CardGrid>
      </Section>

      {/* ── Where to go next ──────────────────────────────────────── */}
      <Section>
        <CardGrid min={260}>
          <Card as="link" to={SITE.research} icon="research" iconTone="navy" kicker="Research" title="Vision, then what is under way"
            desc="Why constructs measured in a model must rest on properties valid for the model itself, which risks deserve the effort, and how the four lines of work hold together." />
          <Card as="link" to={SITE.journey} icon="journey" iconTone="navy" kicker="Journey" title="Where I come from, and what I owe"
            desc="From La Courneuve to Cambridge: the people and programmes that opened the way, giving back, sport at a competitive level, and the timeline." />
          <Card as="link" to={SITE.documents} icon="documents" iconTone="navy" kicker="Documents" title="Essays, decks, reports, code"
            desc="The Part III essay, the prize essay and poster, the three SRIE project decks, three CentraleSupélec reports and five repositories." />
        </CardGrid>
      </Section>

      {/* ── Contact ───────────────────────────────────────────────── */}
      <Section>
        <div style={{ background: 'rgba(34,55,90,0.04)', borderRadius: 10, padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--navy)', fontWeight: 600, marginBottom: 6 }}>Attentive to any offer or collaboration within this perimeter</div>
          <a href={`mailto:${PERSON.email}`} style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{PERSON.email}</a>
        </div>
      </Section>
    </Page>
  );
}
