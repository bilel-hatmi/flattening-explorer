import { Link } from 'react-router-dom';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import useIsMobile from '../../hooks/useIsMobile';
import useReveal, { useCountUp } from '../../hooks/useReveal';
import Card, { CardGrid } from '../../components/site/Card';
import Section, { Page } from '../../components/site/Section';
import Reveal from '../../components/site/Reveal';
import { TagRow } from '../../components/site/Tag';
import Icon, { IconBadge } from '../../components/site/Icon';
import { PERSON, FLATTENING, formatCounter } from '../../content/site';
import { renderInline } from '../../utils/inline';
import { CURRENT_PROJECTS } from '../../content/projects';
import { JOURNEY } from '../../content/journey';
import { SITE } from '../../routes';

// Portrait with a thin dashed ring turning slowly around it (motion.css).
function Portrait({ size }) {
  const box = size + 18;
  const inner = PERSON.portrait
    ? <img src={PERSON.portrait} alt={PERSON.name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
    : (
      <div aria-hidden="true" style={{
        width: size, height: size, borderRadius: '50%', background: 'var(--navy)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontFamily: 'var(--font-title)', fontSize: size * 0.46, color: 'var(--cream)',
      }}>
        {PERSON.name.split(' ').map(w => w[0]).join('')}
      </div>
    );
  return (
    <div className="scale-in" style={{ position: 'relative', width: box, height: box, flexShrink: 0 }}>
      <svg className="portrait-ring" viewBox="0 0 100 100" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <circle cx="50" cy="50" r="48.5" fill="none" stroke="var(--teal)" strokeWidth="0.8" strokeDasharray="2.6 5.2" opacity="0.75" />
      </svg>
      <div style={{ position: 'absolute', top: 9, left: 9 }}>{inner}</div>
    </div>
  );
}

// Contour lines drifting behind the introduction: the poster's field, the
// site's two colours, nothing that competes with the text.
function HeroField({ isMobile }) {
  const mask = isMobile
    ? 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, transparent 85%)'
    : 'linear-gradient(to right, transparent 22%, rgba(0,0,0,0.9) 62%)';
  return (
    <svg className="hero-field" viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true" style={{
      position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none',
      WebkitMaskImage: mask, maskImage: mask, opacity: isMobile ? 0.6 : 1,
    }}>
      <g fill="none" strokeWidth="1" strokeLinecap="round">
        <path className="f-a" stroke="var(--teal)" strokeOpacity="0.30" d="M-60 300C140 226 300 384 500 300S850 190 1260 276" />
        <path className="f-b" stroke="var(--teal)" strokeOpacity="0.20" d="M-60 344C200 262 350 424 600 344S900 236 1260 330" />
        <path className="f-c" stroke="var(--navy)" strokeOpacity="0.12" d="M-60 250C100 190 250 322 450 250S800 150 1260 232" />
        <path className="f-b" stroke="var(--teal)" strokeOpacity="0.12" d="M-60 386C250 304 400 462 700 386S950 300 1260 372" />
        <path className="f-c" stroke="var(--teal)" strokeOpacity="0.16" d="M300-20C500 60 700-40 900 40S1150 84 1260 24" />
        <path className="f-a" stroke="var(--navy)" strokeOpacity="0.08" d="M420 60C600 130 760 40 940 110S1160 160 1260 120" />
      </g>
      <g fill="var(--teal)">
        <circle className="d-1" cx="762" cy="262" r="2.6" />
        <circle className="d-2" cx="984" cy="214" r="2.2" />
        <circle className="d-3" cx="1102" cy="332" r="2.8" />
        <circle className="d-4" cx="642" cy="352" r="2" />
        <circle className="d-5" cx="882" cy="118" r="2.4" fill="var(--navy)" />
      </g>
    </svg>
  );
}

// Four milestones from the timeline, oldest to newest.
const MILESTONES = ['centralesupelec', 'part-iii', 'risk-prize', 'srie'].map(id => JOURNEY.find(e => e.id === id)).filter(Boolean);

const btn = (primary) => ({
  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
  textDecoration: 'none', whiteSpace: 'nowrap',
  ...(primary
    ? { background: 'var(--navy)', color: '#FFFFFF' }
    : { background: 'var(--card-bg)', border: '0.5px solid var(--teal-line)', color: 'var(--navy)' }),
});

function Counter({ c, active }) {
  const v = useCountUp(c.value, active);
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 700, color: `var(--${c.tone})`, fontVariantNumeric: 'tabular-nums' }}>
        {formatCounter(v, c.unit)}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{c.label}</div>
    </div>
  );
}

export default function Home() {
  useDocumentTitle(null);
  const isMobile = useIsMobile();
  const current = CURRENT_PROJECTS.filter(p => p.slug !== 'the-flattening');
  const [flRef, flIn] = useReveal();

  return (
    <Page wide>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section style={{
        position: 'relative', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center',
        gap: isMobile ? 24 : 48, padding: isMobile ? '16px 0 40px' : '40px 0 64px',
        borderBottom: '0.5px solid var(--rule)',
      }}>
        <HeroField isMobile={isMobile} />
        <Portrait size={isMobile ? 88 : 148} />
        <div style={{ minWidth: 0, position: 'relative' }}>
          <div className="rise rise-1" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--teal)', marginBottom: 10 }}>
            {PERSON.role}
          </div>
          <h1 className="rise rise-2" style={{ fontFamily: 'var(--font-title)', fontSize: isMobile ? 40 : 56, color: 'var(--navy)', lineHeight: 1.05, marginBottom: 12 }}>
            {PERSON.name}
          </h1>
          <div className="rise rise-3" style={{ fontFamily: 'var(--font-title)', fontSize: isMobile ? 22 : 26, color: 'var(--navy)', lineHeight: 1.2, marginBottom: 16 }}>
            {PERSON.tagline}
          </div>
          <p className="rise rise-4" style={{ fontSize: isMobile ? 15 : 16, lineHeight: 1.6, color: 'var(--text-muted)', maxWidth: 620, marginBottom: 22 }}>
            {PERSON.shortBio}
          </p>
          <div className="rise rise-5" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <Link to={SITE.research} style={btn(true)} className="btn-lift"><Icon name="research" size={16} /> What I work on</Link>
            {PERSON.links.map(l => (
              <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" style={btn(false)} className="btn-lift">
                <Icon name={l.icon} size={15} /> {l.label}
              </a>
            ))}
          </div>
          <div className="rise rise-6" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 18, fontSize: 12, color: 'var(--text-faint)' }}>
            <Icon name="pin" size={13} /> {PERSON.location}
          </div>
        </div>
      </section>

      {/* ── The Flattening ────────────────────────────────────────── */}
      <Section kicker={FLATTENING.kicker} title={FLATTENING.title}
        aside={<Link to={`${SITE.projects}/the-flattening`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>About the project <Icon name="arrow" size={13} /></Link>}>
        <div ref={flRef} className="reveal" data-in={flIn ? 'true' : 'false'}>
          <Card style={{ padding: 0, gap: 0, overflow: 'hidden' }} className="lift">
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>
              <Link to={`${SITE.projects}/the-flattening`} style={{
                flex: isMobile ? 'none' : '0 0 52%', background: '#FFFFFF', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', padding: isMobile ? '14px 12px 12px' : '18px 18px 14px', minHeight: isMobile ? 140 : 0,
              }}>
                <img src="/img/flattening/schema.png" alt="The mechanism of The Flattening, from the poster"
                  style={{ width: '100%', height: 'auto', display: 'block' }} />
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-faint)', marginTop: 10, letterSpacing: '0.03em' }}>
                  {FLATTENING.schemaCaption}
                </div>
              </Link>
              <div style={{ padding: isMobile ? '22px 20px' : '28px 30px', flex: 1, minWidth: 0, borderLeft: isMobile ? 'none' : '0.5px solid var(--rule)' }}>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--navy)', marginBottom: 18 }}>{renderInline(FLATTENING.summary)}</p>
                <div style={{ display: 'flex', gap: 24, marginBottom: 20, flexWrap: 'wrap' }}>
                  {FLATTENING.counters.map(c => <Counter key={c.label} c={c} active={flIn} />)}
                </div>
                <Link to={FLATTENING.to} style={btn(true)} className="btn-lift">{FLATTENING.cta} <Icon name="arrow" size={15} /></Link>
              </div>
            </div>
          </Card>
        </div>
      </Section>

      {/* ── Current work ──────────────────────────────────────────── */}
      <Section kicker="Current work" title="Four lines of research"
        aside={<Link to={SITE.projects} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>All projects <Icon name="arrow" size={13} /></Link>}>
        <CardGrid min={260}>
          {current.map((p, i) => (
            <Reveal key={p.slug} delay={i * 80} style={{ display: 'flex' }}>
              <Card as="link" to={`${SITE.projects}/${p.slug}`} icon={p.icon} kicker={p.kicker} title={p.title}
                desc={p.summary} badge={p.status} style={{ flex: 1 }}>
                <TagRow tags={p.tags.slice(0, 3)} style={{ marginTop: 6 }} />
              </Card>
            </Reveal>
          ))}
        </CardGrid>
      </Section>

      {/* ── Milestones ────────────────────────────────────────────── */}
      <Section kicker="Journey" title="Milestones"
        aside={<Link to={SITE.journey} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>The full timeline <Icon name="arrow" size={13} /></Link>}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: 12 }}>
          {MILESTONES.map((m, i) => (
            <Reveal key={m.id} delay={i * 80} style={{ display: 'flex' }}>
              <Link to={m.to || SITE.journey} className="lift" style={{
                flex: 1, display: 'flex', flexDirection: 'column', gap: 5, padding: '16px 18px', textDecoration: 'none', color: 'var(--navy)',
                background: 'var(--card-bg)', border: '0.5px solid var(--card-border)', borderRadius: 'var(--card-radius)', minWidth: 0,
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--teal)' }}>{m.period}</span>
                <span style={{ fontFamily: 'var(--font-title)', fontSize: 18, lineHeight: 1.2 }}>{m.title}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.org}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ── Where to go next ──────────────────────────────────────── */}
      <Section>
        <CardGrid min={260}>
          {[
            { to: SITE.research, icon: 'research', kicker: 'Research', title: 'Risks, views, current work',
              desc: 'Why the smoothest risks are the most catastrophic, why constructs measured in a model must rest on properties valid for the model itself, and how the four lines of work hold together.' },
            { to: SITE.journey, icon: 'journey', kicker: 'Journey', title: 'La Courneuve, the Cordées de la Réussite, OSER',
              desc: 'From La Courneuve to Cambridge: the people and programmes that opened the way, giving back, sport at a competitive level, and the timeline.' },
            { to: SITE.documents, icon: 'documents', kicker: 'Documents', title: 'Essays, decks, reports, code',
              desc: 'The Part III essay, the prize essay and poster, the 3 SRIE project decks, 3 CentraleSupélec reports and 5 repositories.' },
          ].map((c, i) => (
            <Reveal key={c.to} delay={i * 80} style={{ display: 'flex' }}>
              <Card as="link" to={c.to} icon={c.icon} iconTone="navy" kicker={c.kicker} title={c.title} desc={c.desc} style={{ flex: 1 }} />
            </Reveal>
          ))}
        </CardGrid>
      </Section>

      {/* ── Contact ───────────────────────────────────────────────── */}
      <Section>
        <Reveal>
          <div style={{ background: 'rgba(34,55,90,0.04)', borderRadius: 14, padding: isMobile ? '28px 20px' : '32px 24px', textAlign: 'center' }}>
            <IconBadge name="mail" tone="navy" size={44} />
            <div style={{ fontFamily: 'var(--font-title)', fontSize: 22, color: 'var(--navy)', margin: '14px 0 6px' }}>Attentive to any offer or collaboration within this perimeter</div>
            <a href={`mailto:${PERSON.email}`} style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--teal)' }}>{PERSON.email}</a>
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 10, marginTop: 18 }}>
              {PERSON.links.map(l => (
                <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" style={btn(false)} className="btn-lift">
                  <Icon name={l.icon} size={15} /> {l.label}
                </a>
              ))}
            </div>
          </div>
        </Reveal>
      </Section>
    </Page>
  );
}
