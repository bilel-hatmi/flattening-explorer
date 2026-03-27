// ── Document links ───────────────────────────────────────────────────────────
const LINKS = {
  github:     'https://github.com/Hatimsel/flattening-explorer',
  cv:         '/docs/cv.pdf',
  cartesia:   '/docs/cartesia.pdf',
  essayShort: '/docs/essay_prize.pdf',
  essayLong:  '/docs/essay_full.pdf',
};

// ── Styles ───────────────────────────────────────────────────────────────────
const S = {
  page: { maxWidth: 1080, margin: '0 auto', padding: '80px 24px 96px' },
  // Hero
  heroSection: {
    textAlign: 'center', marginBottom: 48, paddingBottom: 40,
    borderBottom: '0.5px solid rgba(0,0,0,0.06)',
  },
  name: {
    fontFamily: "'Instrument Serif', serif", fontSize: 40, fontWeight: 400,
    color: '#22375A', lineHeight: 1.1, marginBottom: 8,
  },
  affiliation: {
    fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15,
    color: '#619EA8', fontWeight: 500, marginBottom: 6,
  },
  role: {
    fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13,
    color: '#888780', lineHeight: 1.5, maxWidth: 480, margin: '0 auto',
  },
  // Section
  sectionTitle: {
    fontFamily: "'Instrument Serif', serif", fontSize: 24,
    color: '#22375A', marginBottom: 16, marginTop: 48,
  },
  p: {
    fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14,
    color: '#22375A', lineHeight: 1.7, marginBottom: 16,
  },
  // CartesIA block
  cartesiaBlock: {
    background: 'rgba(97,158,168,0.05)', border: '0.5px solid rgba(97,158,168,0.18)',
    borderRadius: 12, padding: '24px 24px 20px', marginBottom: 32,
  },
  cartesiaTitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 700,
    color: '#22375A', marginBottom: 4,
  },
  cartesiaTagline: {
    fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12,
    color: '#619EA8', fontWeight: 500, letterSpacing: '0.03em',
    textTransform: 'uppercase', marginBottom: 14,
  },
  // Document cards
  docsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 12, marginBottom: 32,
  },
  docCard: {
    background: '#FFFFFF', border: '0.5px solid rgba(0,0,0,0.08)',
    borderRadius: 10, padding: '18px 18px 14px',
    display: 'flex', flexDirection: 'column', gap: 6,
    textDecoration: 'none', transition: 'border-color 0.2s, transform 0.15s',
    cursor: 'pointer',
  },
  docIcon: {
    fontSize: 20, marginBottom: 2,
  },
  docTitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13,
    fontWeight: 600, color: '#22375A',
  },
  docDesc: {
    fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11,
    color: '#888780', lineHeight: 1.4,
  },
  docBadge: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
    color: '#A0A09A', marginTop: 'auto', paddingTop: 4,
  },
  // Full-width card variant
  docCardFull: {
    gridColumn: '1 / -1',
  },
  // Footer
  disclaimer: {
    marginTop: 48, paddingTop: 24, borderTop: '0.5px solid rgba(0,0,0,0.06)',
    fontSize: 11, color: '#A0A09A', lineHeight: 1.6, textAlign: 'center',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  footer: {
    marginTop: 32, fontSize: 11, color: '#888780', fontStyle: 'italic',
    textAlign: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
};

function DocCard({ href, icon, title, desc, badge, full }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ ...S.docCard, ...(full ? S.docCardFull : {}) }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(97,158,168,0.40)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'none'; }}
    >
      <div style={S.docIcon}>{icon}</div>
      <div style={S.docTitle}>{title}</div>
      <div style={S.docDesc}>{desc}</div>
      {badge && <div style={S.docBadge}>{badge}</div>}
    </a>
  );
}

export default function Author() {
  return (
    <div style={S.page}>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div style={S.heroSection}>
        <h1 style={S.name}>Bilel Hatmi</h1>
        <div style={S.affiliation}>University of Cambridge</div>
        <p style={S.role}>
          Part III Mathematical Statistics, DPMMS. Founder of CartesIA.
        </p>
      </div>

      {/* ── Bio ───────────────────────────────────────────────────── */}
      <h2 style={S.sectionTitle}>About this project</h2>
      <p style={S.p}>
        This application accompanies <em>The Flattening</em>, an essay submitted to the Cambridge{'\u2013'}McKinsey Risk Prize 2026. The central argument is uncomfortable: unmanaged AI adoption makes organisations better on average while making them more fragile at the extremes. Productivity gains show up on dashboards. Tail risk accumulates elsewhere, hidden by the same metrics that report the improvement.
      </p>
      <p style={S.p}>
        The explorer lets you move through that argument rather than read about it. You select an organisational profile directly on the charts, follow four acts of analysis (the paradox, its mechanisms, the governance levers, and why delay makes each of them more costly), then test your own parameter combinations in the laboratory and observe how exposure shifts.
      </p>

      {/* ── CartesIA ──────────────────────────────────────────────── */}
      <h2 style={S.sectionTitle}>CartesIA</h2>
      <div style={S.cartesiaBlock}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
          <img src="/logo.png" alt="CartesIA" style={{ height: 56 }} />
          <div>
            <div style={S.cartesiaTitle}>CartesIA</div>
            <div style={S.cartesiaTagline}>Psychometric AI Platform</div>
          </div>
        </div>
        <p style={{ ...S.p, marginBottom: 12 }}>
          CartesIA is a psychometric AI platform in development, currently working across three areas: HR assessment, mental health triage, and youth career orientation. The protocol exists and is being built with care; the product is not yet deployed.
        </p>
        <p style={{ ...S.p, marginBottom: 12 }}>
          The connection to this essay is direct. What the essay documents at the organisational level is the erosion of independent judgment as people stop forming their own position before consulting the AI. CartesIA is designed to interrupt that failure mode at the individual level. The governance intervention that works best in the model is structurally simple: the person records an independent position before seeing the AI's output. That sequencing is what drives the risk reduction. CartesIA uses the same logic. Before any AI output reaches the user, a structured sequence draws out their own reasoning, their context, their uncertainty, what they already think. The AI responds to something the person has actually articulated rather than to a blank prompt, which means the human judgment stays in the loop rather than being bypassed.
        </p>
        <p style={{ ...S.p, marginBottom: 0, fontSize: 13, color: '#619EA8' }}>
          An organisation whose people have practised forming independent positions, in hiring decisions, in clinical assessments, in career choices, carries less tail risk than one that has not. The essay quantifies that gap. CartesIA is an attempt to build the underlying capacity, one person at a time, before deference to AI outputs becomes habitual.
        </p>
      </div>
      <a
        href={LINKS.cartesia}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-block', padding: '10px 24px', borderRadius: 8,
          background: 'rgba(97,158,168,0.10)', border: '0.5px solid rgba(97,158,168,0.30)',
          color: '#22375A', fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 13, fontWeight: 600, textDecoration: 'none', marginBottom: 16,
          transition: 'background 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(97,158,168,0.18)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(97,158,168,0.10)'; }}
      >
        Read the CartesIA presentation {'\u2192'}
      </a>

      {/* ── Documents ─────────────────────────────────────────────── */}
      <h2 style={S.sectionTitle}>Documents</h2>
      <div style={S.docsGrid}>
        <DocCard
          href={LINKS.essayShort}
          icon={'\ud83d\udcdd'}
          title="Prize essay"
          desc="The Flattening: Invisible Tail Risk in AI-Adopting Organisations. Short submission for the Cambridge McKinsey Risk Prize 2026."
          badge="PDF"
        />
        <DocCard
          href={LINKS.essayLong}
          icon={'\ud83d\udcd6'}
          title="Full essay"
          desc="Extended version with complete derivations, all validation results, and the systemic policy argument."
          badge="PDF"
        />
        <DocCard
          href={LINKS.cv}
          icon={'\ud83d\udcbc'}
          title="Curriculum Vitae"
          desc="Academic background, research experience, and professional projects."
          badge="PDF"
        />
        <DocCard
          href={LINKS.github}
          icon={'\ud83d\udcbb'}
          title="Source code"
          desc="Full repository: simulation engine (Python), interactive explorer (React), and all pre-computed datasets."
          badge="GitHub"
        />
        <DocCard
          href={LINKS.cartesia}
          icon={'\u2b21'}
          title="CartesIA"
          desc="Psychometric AI platform: HR assessment, mental health triage, youth orientation. Presentation document."
          badge="PDF"
          full
        />
      </div>

      {/* ── About the author ─────────────────────────────────────── */}
      <h2 style={S.sectionTitle}>About the author</h2>
      <div style={S.bio}>
        <p style={{ ...S.p, marginBottom: 0 }}>
          Bilel Hatmi is a Part III student in Mathematical Statistics at the University of Cambridge (DPMMS), where his dissertation develops semiparametric methods for proximal causal inference under unmeasured confounding, supervised by Dr P. Zhao and Prof. Q. Zhao. He holds a Grande {'\u00c9'}cole degree from CentraleSup{'\u00e9'}lec (top 1% of cohort), with prior work on subjective well-being measurement over a twenty-year longitudinal panel, stochastic modelling of blood cancers at the Gustave Roussy Institute, and AI deployments in a strategy consulting context at Eleven Strategy, where productivity metrics and decision quality routinely pointed in different directions. He is the founder of CartesIA, a research project on AI-assisted psychometric measurement.
        </p>
      </div>

      {/* ── Contact ───────────────────────────────────────────────── */}
      <div style={{
        background: 'rgba(34,55,90,0.04)', borderRadius: 10,
        padding: '20px 24px', textAlign: 'center', marginTop: 32,
      }}>
        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: '#22375A', fontWeight: 600, marginBottom: 6 }}>
          Get in touch
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: '#619EA8' }}>
          bilelhatmi@gmail.com
        </div>
      </div>

      {/* ── Disclaimer ────────────────────────────────────────────── */}
      <div style={S.disclaimer}>
        This application accompanies an academic essay submitted to the Cambridge{'\u2013'}McKinsey Risk Prize 2026.
        All simulation results are stress tests under stated assumptions, not empirical predictions. No user data is collected or stored.
      </div>

      <div style={S.footer}>
        The Flattening Explorer {'\u2014'} Cambridge{'\u2013'}McKinsey Risk Prize 2026
      </div>
    </div>
  );
}
