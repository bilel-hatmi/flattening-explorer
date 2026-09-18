import { Link } from 'react-router-dom';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import useIsMobile from '../../hooks/useIsMobile';
import Section, { Page, PageHeader } from '../../components/site/Section';
import Timeline, { TimelineLegend } from '../../components/site/Timeline';
import Reveal from '../../components/site/Reveal';
import Icon, { IconBadge } from '../../components/site/Icon';
import { JOURNEY, NARRATIVES, ASIDES } from '../../content/journey';
import { PERSON } from '../../content/site';
import { LINKS } from '../../content/documents';
import { renderInline } from '../../utils/inline';

const NARRATIVE_ICONS = { 'giving-back': 'giving', sport: 'sport' };

// A photograph beside a narrative: right column on desktop, full width above
// the text on a phone. `ratio` keeps the crop the author's images were cut to.
function NarrativeFigure({ image, isMobile }) {
  const portrait = image.ratio === '4 / 5';
  return (
    <figure className="lift" style={{
      margin: isMobile ? '0 0 18px' : '4px 0 10px 26px', float: isMobile ? 'none' : 'right', width: isMobile ? '100%' : (portrait ? 200 : 260),
      background: 'var(--card-bg)', border: '0.5px solid var(--card-border)', borderRadius: 'var(--card-radius)', padding: 6,
    }}>
      <img src={image.src} alt={image.alt} loading="lazy" style={{
        display: 'block', width: '100%', aspectRatio: image.ratio, objectFit: 'cover', borderRadius: 8,
        maxHeight: isMobile ? (portrait ? 420 : 260) : 'none',
      }} />
      {image.caption && (
        <figcaption style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--text-muted)', padding: '8px 6px 4px', letterSpacing: '0.02em' }}>
          {image.caption}
        </figcaption>
      )}
    </figure>
  );
}

export default function Journey() {
  useDocumentTitle('Journey');
  const isMobile = useIsMobile();
  const bio = PERSON.bio;

  return (
    <Page>
      <PageHeader title="Journey" lede={renderInline(bio.intro)}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16, marginTop: 20 }}>
          <a href={LINKS.cv} target="_blank" rel="noopener noreferrer" className="btn-lift" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: 'var(--navy)', color: '#FFFFFF', textDecoration: 'none',
          }}>
            <Icon name="cv" size={15} /> Curriculum vitae (PDF) <Icon name="external" size={13} />
          </a>
          <TimelineLegend />
        </div>
      </PageHeader>

      {/* ── About, in the order of the LinkedIn text ─────────────────── */}
      <div className="prose rise rise-2" style={{ marginBottom: 56 }}>
        <p>{renderInline(bio.origin)}</p>
        <p>{renderInline(bio.training)}</p>
        <p>{bio.linesLead}</p>
        <ul>
          {bio.lines.map(l => (
            <li key={l.to}>
              {renderInline(l.text.replace(/[;.]$/, ''))}{' '}
              <Link to={l.to} style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 4 }}>project page <Icon name="arrow" size={12} /></Link>
            </li>
          ))}
        </ul>
        <p>{renderInline(bio.linesClose)}</p>
        <p>{bio.closing}</p>
      </div>

      {/* ── Two sections of their own, then the timeline ──────────────── */}
      {NARRATIVES.map((n, i) => (
        <Reveal key={n.id}>
          <Section id={n.id} num={i + 1} kicker={n.kicker} title={n.title}>
            {n.image && isMobile && <NarrativeFigure image={n.image} isMobile />}
            <div style={{ display: 'flex', gap: isMobile ? 14 : 22, alignItems: 'flex-start' }}>
              <IconBadge name={NARRATIVE_ICONS[n.id]} size={isMobile ? 40 : 48} tone="purple" />
              <div className="prose" style={{ minWidth: 0, fontSize: 15, flex: 1 }}>
                {n.image && !isMobile && <NarrativeFigure image={n.image} />}
                {n.body.map((para, j) => <p key={j}>{renderInline(para)}</p>)}
              </div>
            </div>
          </Section>
        </Reveal>
      ))}

      <Section id="timeline" num={NARRATIVES.length + 1} title="Timeline">
        <Timeline entries={JOURNEY} />
      </Section>

      <Section title="Competitions and languages">
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
