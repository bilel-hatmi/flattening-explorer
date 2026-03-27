import React, { useState, useRef, useEffect, useCallback } from 'react';
import GraphCard from '../ui/GraphCard';
import { useProfile } from '../../context/ProfileContext';
import { PROFILES } from '../../data/v5_reference';

// ── CONSTANTS ──────────────────────────────────────────────────────────────────
const N_CIRCLES   = 40;
const A_MIN       = 1.5;
const A_MAX       = 4.5;
const RING_SIZE   = 190;
const CENTER      = RING_SIZE / 2;
const RADIUS      = 72;
const CIRCLE_R    = 6;
const ANIM_DUR    = 350; // ms

const RGB_DISS = [97, 158, 168];   // teal
const RGB_FOLL = [34,  55,  90];   // navy

// ── FORMULAS ──────────────────────────────────────────────────────────────────
function nDissentersFromA(a) {
  const f = Math.max(0, 0.45 - 0.10 * a);
  return Math.round(N_CIRCLES * f);
}
function pEffFromA(a) {
  // Reference anchors: (1.5→0.73), (2.0→0.80), (3.0→0.86), (4.0→0.92)
  const clamp = Math.min(Math.max(a, A_MIN), A_MAX);
  return Math.min(0.99, 0.73 + (clamp - 1.5) * 0.076);
}
function varTauFromA(a) {
  return 1 / (4 * (2 * a + 1));
}

// ── 4 REFERENCE CARDS (fixed values, no ring) ─────────────────────────────────
const CONFIGS = [
  { a: 1.5, label: 'International hub',   sub: 'Beta(1.5, 1.5)', nDiss: 12, pEff: 0.73, varTau: 0.063 },
  { a: 2.0, label: 'Standard',            sub: 'Beta(2.0, 2.0)', nDiss: 10, pEff: 0.80, varTau: 0.050 },
  { a: 3.0, label: 'National university', sub: 'Beta(3.0, 3.0)', nDiss:  6, pEff: 0.86, varTau: 0.036 },
  { a: 4.0, label: 'Elite pipeline',      sub: 'Beta(4.0, 4.0)', nDiss:  2, pEff: 0.92, varTau: 0.028 },
];

// ── CIRCLE POSITIONS ──────────────────────────────────────────────────────────
const POSITIONS = Array.from({ length: N_CIRCLES }, (_, i) => {
  const angle = (2 * Math.PI * i / N_CIRCLES) - Math.PI / 2;
  return { x: CENTER + RADIUS * Math.cos(angle), y: CENTER + RADIUS * Math.sin(angle) };
});

// ── HELPERS ───────────────────────────────────────────────────────────────────
function lerpColor(c1, c2, t) {
  return [
    Math.round(c1[0] + (c2[0] - c1[0]) * t),
    Math.round(c1[1] + (c2[1] - c1[1]) * t),
    Math.round(c1[2] + (c2[2] - c1[2]) * t),
  ];
}
function pEffColor(pEff) {
  if (pEff >= 0.90) return '#B5403F';
  if (pEff >= 0.83) return '#C49A3C';
  return '#4A7C59';
}
function drawRing(canvas, circleT) {
  const dpr = window.devicePixelRatio || 1;
  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, RING_SIZE, RING_SIZE);
  for (let i = 0; i < N_CIRCLES; i++) {
    const t = Math.max(0, Math.min(1, circleT[i]));
    const { x, y } = POSITIONS[i];
    const col = lerpColor(RGB_DISS, RGB_FOLL, t);
    ctx.beginPath();
    ctx.arc(x, y, CIRCLE_R, 0, 2 * Math.PI);
    ctx.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`;
    ctx.fill();
    ctx.strokeStyle = t < 0.5 ? 'rgba(97,158,168,0.45)' : 'rgba(34,55,90,0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.restore();
}
function getAnnotation(nDiss) {
  if (nDiss === 0)  return { text: 'No dissenters remain. The entire organisation defers to AI.', color: '#B5403F' };
  if (nDiss === 1)  return { text: 'One dissenter left — the last line of independent judgement.', color: '#C49A3C' };
  if (nDiss <= 5)   return { text: 'Diversity is thinning.', color: '#C49A3C' };
  return null;
}

// ── STYLES ────────────────────────────────────────────────────────────────────
const S = {
  aschCallout: {
    display: 'flex', alignItems: 'flex-start', gap: 12,
    padding: '10px 14px',
    background: 'rgba(97,158,168,0.08)',
    borderLeft: '2px solid #619EA8',
    borderRadius: '0 6px 6px 0',
    marginBottom: 24,
    fontSize: 10, color: '#22375A', lineHeight: 1.6,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  sliderHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
    marginBottom: 8,
  },
  sliderLabel: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 11, fontWeight: 600, color: '#22375A',
  },
  sliderValue: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12, color: '#73726C',
  },
  sliderInput: {
    WebkitAppearance: 'none', appearance: 'none',
    width: '100%', height: 6, borderRadius: 3,
    background: 'linear-gradient(to right, #4A7C59, #C49A3C, #B5403F)',
    cursor: 'pointer', outline: 'none',
  },
  sliderEnds: {
    display: 'flex', justifyContent: 'space-between',
    marginTop: 5, marginBottom: 24,
    fontSize: 9, color: '#A0A09A',
    fontFamily: "'JetBrains Mono', monospace",
  },
  ringContainer: {
    display: 'flex', justifyContent: 'center',
    marginBottom: 16,
  },
  statsRow: {
    display: 'flex', justifyContent: 'center', gap: 40,
    marginBottom: 16, flexWrap: 'wrap',
  },
  statBlock: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
  },
  statValue: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 22, fontWeight: 500, lineHeight: 1,
  },
  statLabel: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 9, color: '#A0A09A', textAlign: 'center',
  },
  annotationWrap: {
    display: 'flex', justifyContent: 'center',
    marginBottom: 20,
    minHeight: 22,
  },
  annotation: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 11, fontWeight: 600, fontStyle: 'italic',
    padding: '4px 12px', borderRadius: 4,
    background: 'rgba(196,154,60,0.08)',
  },
  legendRow: {
    display: 'flex', gap: 20, alignItems: 'center',
    marginBottom: 20,
  },
  legItem: {
    display: 'flex', alignItems: 'center', gap: 7,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 10, color: '#73726C',
  },
  legDot: {
    width: 11, height: 11, borderRadius: '50%', flexShrink: 0,
  },
  configsRow: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 10, marginBottom: 24,
  },
  configCard: (active) => ({
    padding: '10px 8px 10px',
    borderRadius: 8,
    border: active ? '1.5px solid #619EA8' : '0.5px solid rgba(0,0,0,0.08)',
    background: active ? 'rgba(97,158,168,0.04)' : '#fff',
    boxShadow: active ? '0 0 0 2px rgba(97,158,168,0.15)' : 'none',
    transition: 'all 0.2s',
    cursor: 'pointer',
  }),
  configLabel: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 9, fontWeight: 600, color: '#22375A',
    marginBottom: 2, textAlign: 'center', lineHeight: 1.3,
  },
  configSub: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 8, color: '#A0A09A',
    textAlign: 'center', marginBottom: 8,
  },
  configStat: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
  },
  configPeff: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 17, fontWeight: 500, lineHeight: 1,
  },
  configPeffLabel: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 7.5, color: '#A0A09A', textAlign: 'center',
  },
  configDiss: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 9, fontWeight: 600, marginTop: 6, textAlign: 'center',
  },
  configVarTau: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 8, color: '#A0A09A', textAlign: 'center', marginTop: 3,
  },
  directionNote: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 10, color: '#73726C', lineHeight: 1.5,
    padding: '8px 12px',
    background: 'rgba(181,64,63,0.05)',
    borderLeft: '2px solid rgba(181,64,63,0.25)',
    borderRadius: '0 5px 5px 0',
    marginBottom: 12,
  },
  clarification: {
    fontSize: 9, color: '#A0A09A', fontStyle: 'italic',
    marginTop: 10, lineHeight: 1.5,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
};

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────────
export default function B4_Conformism() {
  const { profileId } = useProfile();
  const rawInitialA = PROFILES[profileId]?.beta ?? 2.0;
  const initialA = Math.min(Math.max(rawInitialA, A_MIN), A_MAX);

  const [aVal, setAVal] = useState(initialA);

  const mainCanvasRef  = useRef(null);
  const circleTRef     = useRef(
    Array.from({ length: N_CIRCLES }, (_, i) => (i < nDissentersFromA(initialA) ? 0 : 1))
  );
  const prevNDissRef   = useRef(nDissentersFromA(initialA));
  const animRef        = useRef(null);

  // Init canvas on mount
  useEffect(() => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = RING_SIZE * dpr;
    canvas.height = RING_SIZE * dpr;
    canvas.style.width  = RING_SIZE + 'px';
    canvas.style.height = RING_SIZE + 'px';
    drawRing(canvas, circleTRef.current);
  }, []);

  const handleAChange = useCallback((newA) => {
    setAVal(newA);
    const newNDiss = nDissentersFromA(newA);
    const oldNDiss = prevNDissRef.current;
    if (newNDiss === oldNDiss) return;
    prevNDissRef.current = newNDiss;

    if (animRef.current) cancelAnimationFrame(animRef.current);

    const fromT = [...circleTRef.current];
    const toT   = Array.from({ length: N_CIRCLES }, (_, i) => (i < newNDiss ? 0 : 1));
    const start = performance.now();

    function step(now) {
      const raw = Math.min((now - start) / ANIM_DUR, 1);
      const eased = raw < 0.5 ? 4*raw*raw*raw : 1 - Math.pow(-2*raw+2, 3)/2;
      for (let i = 0; i < N_CIRCLES; i++) {
        circleTRef.current[i] = fromT[i] + (toT[i] - fromT[i]) * eased;
      }
      const canvas = mainCanvasRef.current;
      if (canvas) drawRing(canvas, circleTRef.current);
      if (raw < 1) {
        animRef.current = requestAnimationFrame(step);
      } else {
        circleTRef.current = [...toT];
        animRef.current = null;
      }
    }
    animRef.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => () => { if (animRef.current) cancelAnimationFrame(animRef.current); }, []);

  const nDiss      = nDissentersFromA(aVal);
  const pEff       = pEffFromA(aVal);
  const varTau     = varTauFromA(aVal);
  const annotation = getAnnotation(nDiss);

  const pEffStr  = pEff.toFixed(2);
  const vTauStr  = varTau.toFixed(3);
  const dissStr  = nDiss + ' / ' + N_CIRCLES;
  const aStr     = aVal.toFixed(2);

  // Nearest reference card
  const nearestConfigIdx = CONFIGS.reduce((best, cfg, i) =>
    Math.abs(cfg.a - aVal) < Math.abs(CONFIGS[best].a - aVal) ? i : best, 0
  );

  return (
    <GraphCard
      id="b4-conformism"
      title="Why cognitive dissenters protect organisations"
      subtitle={
        'Each circle is one employee. Teal circles are cognitive dissenters — they question AI outputs. ' +
        'As recruitment homogenises, dissenters disappear and the effective surrender rate climbs.'
      }
    >
      {/* ── Asch callout ── */}
      <div style={S.aschCallout}>
        <span style={{ flexShrink: 0 }}>&#128206;</span>
        <span>
          <strong style={{ fontWeight: 600 }}>Asch (1951):</strong> with no ally, 75% of people conform to an obviously wrong answer.
          With <strong style={{ fontWeight: 600 }}>a single dissenting ally</strong>, conformity drops from 37% to 5%.
          Organisations that recruit from a narrow cognitive profile eliminate this protective friction entirely.
        </span>
      </div>

      {/* ── Slider ── */}
      <div style={{ marginBottom: 0 }}>
        <div style={S.sliderHeader}>
          <span style={S.sliderLabel}>Cognitive homogeneity of recruitment — Beta(a, a)</span>
          <span style={S.sliderValue}>a = {aStr}</span>
        </div>
        <input
          type="range"
          min={A_MIN}
          max={A_MAX}
          step={0.05}
          value={aVal}
          onChange={(e) => handleAChange(Number(e.target.value))}
          style={S.sliderInput}
        />
        <div style={S.sliderEnds}>
          <span>a = 1.5 — internationally diverse</span>
          <span>a = 4.5 — single elite pipeline</span>
        </div>
      </div>

      {/* ── Main ring ── */}
      <div style={S.ringContainer}>
        <canvas ref={mainCanvasRef} style={{ display: 'block' }} />
      </div>

      {/* ── Stats row ── */}
      <div style={S.statsRow}>
        <div style={S.statBlock}>
          <div style={{ ...S.statValue, color: '#619EA8' }}>{nDiss}</div>
          <div style={S.statLabel}>dissenters</div>
          <div style={{ ...S.statLabel, color: '#C0BFB9', marginTop: 1 }}>out of {N_CIRCLES} employees</div>
        </div>
        <div style={S.statBlock}>
          <div style={{ ...S.statValue, color: pEffColor(pEff) }}>{pEffStr}</div>
          <div style={S.statLabel}>AI override rate</div>
          <div style={{ ...S.statLabel, color: '#C0BFB9', marginTop: 1 }}>defer without independent check</div>
        </div>
        <div style={S.statBlock}>
          <div style={{ ...S.statValue, color: '#888780', fontSize: 18 }}>{vTauStr}</div>
          <div style={S.statLabel}>var&#8321; — cognitive diversity</div>
          <div style={{ ...S.statLabel, color: '#C0BFB9', marginTop: 1 }}>var of Beta(a, a)</div>
        </div>
      </div>

      {/* ── Contextual annotation ── */}
      <div style={S.annotationWrap}>
        {annotation && (
          <div style={{ ...S.annotation, color: annotation.color, borderLeft: '2px solid ' + annotation.color }}>
            {annotation.text}
          </div>
        )}
      </div>

      {/* ── Legend ── */}
      <div style={S.legendRow}>
        <div style={S.legItem}>
          <div style={{ ...S.legDot, background: '#619EA8' }} />
          Cognitive dissenter — questions AI outputs
        </div>
        <div style={S.legItem}>
          <div style={{ ...S.legDot, background: '#22375A' }} />
          Follower — defers to AI without independent check
        </div>
      </div>

      {/* ── 4 reference cards (no ring) ── */}
      <div style={S.configsRow}>
        {CONFIGS.map((cfg, idx) => {
          const active = idx === nearestConfigIdx;
          return (
            <div
              key={cfg.a}
              style={S.configCard(active)}
              onClick={() => handleAChange(cfg.a)}
            >
              <div style={S.configLabel}>{cfg.label}</div>
              <div style={S.configSub}>{cfg.sub}</div>
              <div style={S.configStat}>
                <div style={{ ...S.configPeff, color: pEffColor(cfg.pEff) }}>
                  {cfg.pEff.toFixed(2)}
                </div>
                <div style={S.configPeffLabel}>AI override rate</div>
                <div style={S.configDiss}>
                  <span style={{ color: '#619EA8' }}>{cfg.nDiss}</span>
                  <span style={{ color: '#A0A09A' }}> / {N_CIRCLES} dissenters</span>
                </div>
                <div style={S.configVarTau}>var&#8321; = {cfg.varTau.toFixed(3)}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Direction note ── */}
      <div style={S.directionNote}>
        Moving right: fewer dissenters &rarr; more agents defer to AI without questioning &rarr;
        errors become correlated across the organisation.{' '}
        <strong style={{ color: '#B5403F', fontWeight: 600 }}>
          Between the most diverse (a&nbsp;=&nbsp;1.5) and the most homogeneous (a&nbsp;=&nbsp;4.0)
          recruitment profile, tail risk increases by up to 35% — with identical talent quality and
          the same AI stack.
        </strong>{' '}
        One dissenting voice is enough to break the conformist cascade (Asch).
        Narrow the recruitment filter, and the cascade runs unchecked.
      </div>

      <div style={S.clarification}>
        35% reflects the full contrast between Beta(1.5) and Beta(4.0) profiles.
        Marginal effect around the central case is ~13% — consistent with the tornado chart (C3).
      </div>

      {/* Thumb styling */}
      <style>{`
        #b4-conformism input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 20px; height: 20px; border-radius: 50%;
          background: #22375A; border: 3px solid #fff;
          box-shadow: 0 1px 4px rgba(0,0,0,0.22); cursor: pointer;
        }
        #b4-conformism input[type=range]::-moz-range-thumb {
          width: 20px; height: 20px; border-radius: 50%;
          background: #22375A; border: 3px solid #fff;
          box-shadow: 0 1px 4px rgba(0,0,0,0.22); cursor: pointer;
          border: none;
        }
      `}</style>
    </GraphCard>
  );
}
