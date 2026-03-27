import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import GraphCard from '../ui/GraphCard';

// ── Firm data ─────────────────────────────────────────────────────────────────
const FIRMS = [
  {id:1,  n:'Strategy consulting', p:'A', alpha:0.70, epi:0.55},
  {id:2,  n:'M&A advisory',        p:'A', alpha:0.70, epi:0.50},
  {id:3,  n:'Audit',               p:'A', alpha:0.70, epi:0.50},
  {id:4,  n:'Legal',               p:'A', alpha:0.70, epi:0.45},
  {id:5,  n:'Insurance',           p:'A', alpha:0.70, epi:0.50},
  {id:6,  n:'Asset management',    p:'A', alpha:0.70, epi:0.65},
  {id:7,  n:'Corporate banking',   p:'A', alpha:0.70, epi:0.55},
  {id:8,  n:'Risk advisory',       p:'A', alpha:0.70, epi:0.50},
  {id:9,  n:'Tax advisory',        p:'A', alpha:0.70, epi:0.45},
  {id:10, n:'Compliance',          p:'A', alpha:0.70, epi:0.45},
  {id:11, n:'Research analytics',  p:'A', alpha:0.70, epi:0.70},
  {id:12, n:'Credit rating',       p:'A', alpha:0.70, epi:0.55},
  {id:13, n:'Regulatory affairs',  p:'A', alpha:0.70, epi:0.45},
  {id:14, n:'HR consulting',       p:'A', alpha:0.70, epi:0.55},
  {id:15, n:'IP law',              p:'A', alpha:0.70, epi:0.45},
  {id:16, n:'Investment banking',  p:'B', alpha:0.50, epi:0.55},
  {id:17, n:'Private equity',      p:'B', alpha:0.50, epi:0.50},
  {id:18, n:'Actuarial',           p:'B', alpha:0.50, epi:0.65},
  {id:19, n:'Financial planning',  p:'B', alpha:0.50, epi:0.65},
  {id:20, n:'Restructuring',       p:'B', alpha:0.50, epi:0.50},
  {id:21, n:'Public sector',       p:'B', alpha:0.50, epi:0.60},
  {id:22, n:'Healthcare admin',    p:'B', alpha:0.50, epi:0.60},
  {id:23, n:'Procurement',         p:'B', alpha:0.50, epi:0.65},
  {id:24, n:'Supply chain',        p:'B', alpha:0.50, epi:0.70},
  {id:25, n:'Tech ops',            p:'B', alpha:0.50, epi:0.85},
  {id:26, n:'Creative agency',     p:'C', alpha:0.30, epi:0.85},
  {id:27, n:'UX research',         p:'C', alpha:0.30, epi:0.80},
  {id:28, n:'Content strategy',    p:'C', alpha:0.30, epi:0.75},
  {id:29, n:'Digital marketing',   p:'C', alpha:0.30, epi:0.80},
  {id:30, n:'Brand strategy',      p:'C', alpha:0.30, epi:0.75},
];

// ── Provider palette ──────────────────────────────────────────────────────────
const PROV = {
  A: { color: '#22375A', r: 7,  label: 'Provider A', meta: '\u03b1 = 0.70 \u00b7 15 firms' },
  B: { color: '#4A7C59', r: 6,  label: 'Provider B', meta: '\u03b1 = 0.50 \u00b7 10 firms' },
  C: { color: '#BA7517', r: 5,  label: 'Provider C', meta: '\u03b1 = 0.30 \u00b7 5 firms'  },
};

// Provider Y-axis band labels: center of each provider's epi cluster
const PROV_BANDS = [
  { key: 'C', y: 0.80 },
  { key: 'B', y: 0.62 },
  { key: 'A', y: 0.51 },
];

// ── Simulation engine ─────────────────────────────────────────────────────────
const REGIMES = {
  normal: { pi: 0.75, xi_mu: 0.0, xi_sd: 0.25, seed: 42  },
  crisis: { pi: 0.30, xi_mu: 2.2, xi_sd: 0.30, seed: 137 },
};
const Q_IN = 0.92, Q_OUT = 0.55, P0 = 0.80, H_MEAN = 0.65;
const N_AGENTS = 20, K = 10;
const BASELINE_MEAN = N_AGENTS * K * (1 - H_MEAN); // 70
const CRISIS_THRESHOLD = 150;
const PI_REF = 0.70;

function mulberry32(s) {
  return () => {
    s |= 0; s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function normalSample(rng, mu, sd) {
  const u = rng(), v = rng();
  return mu + sd * Math.sqrt(-2 * Math.log(Math.max(1e-10, u))) * Math.cos(2 * Math.PI * v);
}
function ndtri(p) {
  p = Math.max(1e-8, Math.min(1 - 1e-8, p));
  const q = p - 0.5;
  if (Math.abs(q) <= 0.425) {
    const r = 0.180625 - q * q;
    return q * (((2509.08 * r + 33430.6) * r + 67265.8) * r + 45922.0) /
      ((((5226.5 * r + 28729.1) * r + 39307.9) * r + 21213.8) * r + 5394.2);
  }
  const r = Math.sqrt(-2 * Math.log(p < 0.5 ? p : 1 - p));
  return (p < 0.5 ? -1 : 1) *
    (r - (((7.71e-2 * r + 0.481) * r + 1.207) * r + 1.504) /
      (((1.05 * r + 0.548) * r + 0.061) * r + 1));
}
function simulate(regime) {
  const cfg = REGIMES[regime];
  const rng = mulberry32(cfg.seed);
  const xi = {
    A: normalSample(rng, cfg.xi_mu, cfg.xi_sd),
    B: normalSample(rng, cfg.xi_mu, cfg.xi_sd),
    C: normalSample(rng, cfg.xi_mu, cfg.xi_sd),
  };
  const ti = ndtri(Q_IN), to = ndtri(Q_OUT);
  return FIRMS.map(f => {
    let errors = 0;
    const pi_eff = Math.max(0.05, Math.min(0.95, f.epi * (cfg.pi / PI_REF)));
    for (let k = 0; k < K; k++) {
      const inside = rng() < pi_eff;
      const thr = inside ? ti : to;
      const Z = Math.sqrt(f.alpha) * xi[f.p] + Math.sqrt(1 - f.alpha) * normalSample(rng, 0, 1);
      const aiErr = Z > thr ? 1 : 0;
      for (let i = 0; i < N_AGENTS; i++)
        errors += rng() < P0 ? aiErr : (rng() < (1 - H_MEAN) ? 1 : 0);
    }
    const lossIndex = Math.round(errors / BASELINE_MEAN * 100);
    return { ...f, lossIndex, inCrisis: lossIndex > CRISIS_THRESHOLD };
  });
}

// ── Canvas layout constants (height fixed, width dynamic) ─────────────────────
const CH = 260;
const ML = 62, MR = 14, MT = 22, MB = 50;
const CHART_H = CH - MT - MB;
const X_MIN = 0, X_MAX = 260;
const Y_MIN = 0.40, Y_MAX = 0.92;

function makeCoords(cw) {
  const chartW = cw - ML - MR;
  return {
    xPx: v => ML + (v - X_MIN) / (X_MAX - X_MIN) * chartW,
    yPx: v => MT + (1 - (v - Y_MIN) / (Y_MAX - Y_MIN)) * CHART_H,
    chartW,
  };
}

// ── Draw ──────────────────────────────────────────────────────────────────────
function drawScene(canvas, firms, selectedId, regime) {
  const dpr = window.devicePixelRatio || 1;
  const CW = canvas.clientWidth || 600;
  if (canvas.width !== Math.round(CW * dpr) || canvas.height !== Math.round(CH * dpr)) {
    canvas.width = Math.round(CW * dpr);
    canvas.height = Math.round(CH * dpr);
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, CW, CH);

  const { xPx, yPx, chartW } = makeCoords(CW);

  // Chart area background
  ctx.fillStyle = '#FAFAF8';
  ctx.fillRect(ML, MT, chartW, CHART_H);

  // Crisis zone tint (right of threshold)
  if (regime === 'crisis') {
    const cx150 = xPx(CRISIS_THRESHOLD);
    ctx.fillStyle = 'rgba(181,64,63,0.04)';
    ctx.fillRect(cx150, MT, ML + chartW - cx150, CHART_H);
  }

  // Horizontal gridlines
  [0.45, 0.50, 0.55, 0.60, 0.65, 0.70, 0.75, 0.80, 0.85, 0.90].forEach(v => {
    const y = yPx(v);
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0,0,0,0.04)';
    ctx.lineWidth = 1;
    ctx.moveTo(ML, y); ctx.lineTo(ML + chartW, y);
    ctx.stroke();
  });

  // Y-axis tick labels
  ctx.fillStyle = '#B0AFA9';
  ctx.font = "10px 'JetBrains Mono', monospace";
  ctx.textAlign = 'right';
  [0.45, 0.55, 0.65, 0.75, 0.85].forEach(v =>
    ctx.fillText(v.toFixed(2), ML - 8, yPx(v) + 3.5)
  );

  // Provider band labels (PA / PB / PC) — colored, left of tick labels
  PROV_BANDS.forEach(({ key, y }) => {
    ctx.save();
    ctx.fillStyle = PROV[key].color;
    ctx.font = "600 9px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = 'right';
    ctx.globalAlpha = 0.75;
    ctx.fillText('P' + key, ML - 32, yPx(y) + 3.5);
    ctx.restore();
  });

  // Y-axis label
  ctx.save();
  ctx.translate(13, MT + CHART_H / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#888780';
  ctx.font = "11px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText('Domain exposure E[\u03c0]', 0, 0);
  ctx.restore();

  // Baseline reference line (100)
  ctx.save();
  ctx.strokeStyle = 'rgba(136,135,128,0.35)';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 4]);
  const bx = xPx(100);
  ctx.beginPath(); ctx.moveTo(bx, MT); ctx.lineTo(bx, MT + CHART_H); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(136,135,128,0.55)';
  ctx.font = "9px 'JetBrains Mono', monospace";
  ctx.textAlign = 'center';
  ctx.fillText('baseline', bx, MT - 7);
  ctx.restore();

  // Crisis threshold line (150)
  ctx.save();
  ctx.strokeStyle = 'rgba(181,64,63,0.48)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 3]);
  const cx150 = xPx(CRISIS_THRESHOLD);
  ctx.beginPath(); ctx.moveTo(cx150, MT); ctx.lineTo(cx150, MT + CHART_H); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(181,64,63,0.68)';
  ctx.font = "9px 'JetBrains Mono', monospace";
  ctx.textAlign = 'center';
  ctx.fillText('crisis \u2192 150', cx150, MT - 7);
  ctx.restore();

  // Chart border
  ctx.strokeStyle = 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 1;
  ctx.strokeRect(ML, MT, chartW, CHART_H);

  // X-axis labels
  ctx.fillStyle = '#B0AFA9';
  ctx.font = "10px 'JetBrains Mono', monospace";
  ctx.textAlign = 'center';
  [0, 50, 100, 150, 200, 250].forEach(v => ctx.fillText(String(v), xPx(v), MT + CHART_H + 15));

  // X-axis label
  ctx.fillStyle = '#888780';
  ctx.font = "11px 'Plus Jakarta Sans', sans-serif";
  ctx.textAlign = 'center';
  ctx.fillText('Loss index \u2192', ML + chartW / 2, MT + CHART_H + 36);

  const hasSelection = selectedId !== null;

  // Z-order: non-crisis → crisis → selected
  const ordered = [...firms].sort((a, b) => {
    if (a.id === selectedId) return 1;
    if (b.id === selectedId) return -1;
    if (a.inCrisis !== b.inCrisis) return a.inCrisis ? 1 : -1;
    return 0;
  });

  ordered.forEach(f => {
    const cx = xPx(f.lossIndex);
    const cy = yPx(f.epi);
    const r = PROV[f.p].r;
    const col = PROV[f.p].color;
    const isSel = f.id === selectedId;
    const alpha = hasSelection && !isSel ? 0.18 : 0.82;

    // White halo
    ctx.save();
    ctx.globalAlpha = hasSelection && !isSel ? 0.08 : 0.55;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx, cy, r + 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Fill
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Crisis ring
    if (f.inCrisis) {
      ctx.save();
      ctx.globalAlpha = hasSelection && !isSel ? 0.10 : 0.88;
      ctx.strokeStyle = '#B5403F';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r + 1, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Selected: glow ring + name label above dot
    if (isSel) {
      ctx.save();
      ctx.globalAlpha = 0.20;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(cx, cy, r + 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = col;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, r + 3, 0, Math.PI * 2);
      ctx.stroke();

      // Label bubble
      ctx.font = "600 11px 'Plus Jakarta Sans', sans-serif";
      const tw = ctx.measureText(f.n).width;
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.beginPath();
      ctx.roundRect(cx - tw / 2 - 6, cy - r - 25, tw + 12, 18, 4);
      ctx.fill();
      ctx.fillStyle = col;
      ctx.textAlign = 'center';
      ctx.fillText(f.n, cx, cy - r - 11);
      ctx.restore();
    }
  });
}

// ── Hit test ──────────────────────────────────────────────────────────────────
function hitTest(e, canvas, firms) {
  const rect = canvas.getBoundingClientRect();
  const CW = rect.width;
  const { xPx, yPx } = makeCoords(CW);
  // CSS height is always CH, so no Y scaling needed
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  const ordered = [...firms].sort((a, b) => {
    if (a.inCrisis !== b.inCrisis) return a.inCrisis ? 1 : -1;
    return 0;
  }).reverse();

  for (const f of ordered) {
    const cx = xPx(f.lossIndex);
    const cy = yPx(f.epi);
    const r = PROV[f.p].r + 5;
    if ((mx - cx) ** 2 + (my - cy) ** 2 <= r * r) return f;
  }
  return null;
}

// ── Contextual notes ──────────────────────────────────────────────────────────
const NOTES = {
  normal: 'Normal: domain exposure E[\u03c0] drives loss index. Firms of all providers spread by sector. Shared factor \u03be_t \u2248 0 \u2014 no provider clustering visible.',
  crisis: 'Crisis (\u03be_t = 2.2): Provider A firms sweep right in unison regardless of sector. The shared Vasicek factor \u03be_t dominates. Colour becomes the risk predictor.',
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function D1_Contagion() {
  const [regime, setRegime] = useState('normal');
  const [selectedId, setSelectedId] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const [noteVis, setNoteVis] = useState(true);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const firms = useMemo(() => simulate(regime), [regime]);
  const sortedFirms = useMemo(() => [...firms].sort((a, b) => b.lossIndex - a.lossIndex), [firms]);
  const counters = useMemo(() => ({
    total: firms.filter(f => f.inCrisis).length,
    A: firms.filter(f => f.p === 'A' && f.inCrisis).length,
    B: firms.filter(f => f.p === 'B' && f.inCrisis).length,
    C: firms.filter(f => f.p === 'C' && f.inCrisis).length,
  }), [firms]);

  // Draw on data/selection change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) drawScene(canvas, firms, selectedId, regime);
  }, [firms, selectedId, regime]);

  // Redraw on container resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => {
      const canvas = canvasRef.current;
      if (canvas) drawScene(canvas, firms, selectedId, regime);
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, [firms, selectedId, regime]);

  const handleRegime = useCallback((r) => {
    if (r === regime) return;
    setNoteVis(false);
    setSelectedId(null);
    setTooltip(null);
    setTimeout(() => { setRegime(r); setNoteVis(true); }, 150);
  }, [regime]);

  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const hit = hitTest(e, canvas, firms);
    canvas.style.cursor = hit ? 'pointer' : 'default';
    setTooltip(hit ? { x: e.clientX, y: e.clientY, firm: hit } : null);
  }, [firms]);

  const handleClick = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const hit = hitTest(e, canvas, firms);
    setSelectedId(hit ? (hit.id === selectedId ? null : hit.id) : null);
  }, [firms, selectedId]);

  const handleLeave = useCallback(() => {
    setTooltip(null);
    if (canvasRef.current) canvasRef.current.style.cursor = 'default';
  }, []);

  return (
    <GraphCard
      id="d1"
      title={'Provider contagion \u2014 in crisis, colour becomes predictive'}
      subtitle={'30 firms across three AI providers. X\u00a0=\u00a0loss index, Y\u00a0=\u00a0domain exposure E[\u03c0]. In normal quarters, sector determines each firm\'s position; in crisis, all Provider\u00a0A firms shift right as a single cluster.'}
      footnote={'Vasicek single-factor correlation model. Systematic shock shared within provider. v5 simulation.'}
    >

      {/* ── Toggles + note ────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{
          display: 'flex', flexShrink: 0,
          border: '0.5px solid rgba(34,55,90,0.25)', borderRadius: 7, overflow: 'hidden',
        }}>
          {[
            { k: 'normal', l: 'Normal (\u03c0\u22480.75)' },
            { k: 'crisis', l: 'Crisis (\u03c0\u22480.30)' },
          ].map(({ k, l }, i) => (
            <button key={k} onClick={() => handleRegime(k)} style={{
              padding: '7px 20px',
              background: regime === k ? '#22375A' : '#fff',
              color: regime === k ? '#fff' : '#22375A',
              border: 'none',
              borderLeft: i > 0 ? '0.5px solid rgba(34,55,90,0.22)' : 'none',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
              transition: 'background 0.15s, color 0.15s',
            }}>{l}</button>
          ))}
        </div>
        <div style={{
          flex: 1, minWidth: 200,
          fontSize: 11,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          lineHeight: 1.55,
          color: regime === 'crisis' ? '#7a3232' : '#3a5a3a',
          background: regime === 'crisis' ? 'rgba(181,64,63,0.07)' : 'rgba(74,124,89,0.07)',
          border: `0.5px solid ${regime === 'crisis' ? 'rgba(181,64,63,0.20)' : 'rgba(74,124,89,0.20)'}`,
          borderRadius: 6, padding: '7px 12px',
          opacity: noteVis ? 1 : 0,
          transition: 'opacity 0.15s',
        }}>
          {NOTES[regime]}
        </div>
      </div>

      {/* ── Counters ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 9, marginBottom: 16 }}>
        {[
          { label: 'Firms in crisis', val: counters.total, max: 30, color: null },
          { label: 'Provider A',       val: counters.A,     max: 15,  color: PROV.A.color },
          { label: 'Provider B',       val: counters.B,     max: 10,  color: PROV.B.color },
          { label: 'Provider C',       val: counters.C,     max: 5,   color: PROV.C.color },
        ].map(({ label, val, max, color }) => (
          <div key={label} style={{
            background: '#F5F4EF', borderRadius: 8, padding: '10px 13px',
            border: '0.5px solid rgba(0,0,0,0.07)',
          }}>
            <div style={{
              fontSize: 9.5, color: '#B0AFA9', marginBottom: 5, letterSpacing: '0.01em',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>{label}</div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 21, fontWeight: 500, color: val > 0 ? '#B5403F' : '#C8C7C1', lineHeight: 1,
            }}>
              {val}<span style={{ fontSize: 10, color: '#C8C7C1', marginLeft: 2 }}>/{max}</span>
            </div>
            {color && (
              <div style={{
                marginTop: 6, height: 3, borderRadius: 2,
                background: val > 0 ? color : '#E0DFD9',
                width: `${Math.max(0, (val / max) * 100)}%`,
                transition: 'width 0.28s, background 0.28s',
              }} />
            )}
          </div>
        ))}
      </div>

      {/* ── Scatter + list ────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>

        {/* Canvas — fills all available width */}
        <div ref={containerRef} style={{ flex: 1, minWidth: 0 }}>
          <canvas
            ref={canvasRef}
            style={{
              display: 'block',
              width: '100%',
              height: CH + 'px',
              borderRadius: 6,
              border: '0.5px solid rgba(0,0,0,0.07)',
              cursor: 'default',
            }}
            onMouseMove={handleMouseMove}
            onClick={handleClick}
            onMouseLeave={handleLeave}
          />
        </div>

        {/* Ranked list */}
        <div style={{
          width: 188, flexShrink: 0,
          height: CH + 'px',
          overflowY: 'auto',
          border: '0.5px solid rgba(0,0,0,0.08)',
          borderRadius: 8, background: '#fff',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            position: 'sticky', top: 0, zIndex: 1,
            padding: '7px 11px',
            fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
            color: '#B0AFA9', borderBottom: '0.5px solid rgba(0,0,0,0.07)',
            fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#fff',
          }}>
            All firms \u2014 sorted by loss
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {sortedFirms.map((f, idx) => {
              const isSel = f.id === selectedId;
              return (
                <div
                  key={f.id}
                  onClick={() => setSelectedId(f.id === selectedId ? null : f.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '5px 11px',
                    cursor: 'pointer',
                    background: isSel ? PROV[f.p].color + '15' : 'transparent',
                    borderBottom: idx < sortedFirms.length - 1 ? '0.5px solid rgba(0,0,0,0.04)' : 'none',
                    borderLeft: `2.5px solid ${isSel ? PROV[f.p].color : 'transparent'}`,
                    transition: 'background 0.1s',
                  }}
                >
                  <span style={{
                    display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
                    background: PROV[f.p].color, flexShrink: 0, opacity: 0.85,
                  }} />
                  <span style={{
                    flex: 1, fontSize: 10.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    color: isSel ? PROV[f.p].color : '#22375A',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: isSel ? 600 : 400,
                  }}>{f.n}</span>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, fontWeight: 500, flexShrink: 0,
                    color: f.inCrisis ? '#B5403F' : '#A0A09A',
                  }}>
                    {f.lossIndex}
                    {f.inCrisis && (
                      <span style={{ marginLeft: 2, fontSize: 9, verticalAlign: 'middle' }}>&#9888;</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Legend ────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap', alignItems: 'center',
        paddingTop: 11, borderTop: '0.5px solid rgba(0,0,0,0.07)',
      }}>
        {Object.entries(PROV).map(([k, v]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width={v.r * 2 + 6} height={v.r * 2 + 6} style={{ flexShrink: 0 }}>
              <circle cx={v.r + 3} cy={v.r + 3} r={v.r} fill="white" />
              <circle cx={v.r + 3} cy={v.r + 3} r={v.r} fill={v.color} fillOpacity={0.82} />
            </svg>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#22375A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {v.label}
              </div>
              <div style={{ fontSize: 9, color: '#A0A09A', fontFamily: "'JetBrains Mono', monospace" }}>
                {v.meta}
              </div>
            </div>
          </div>
        ))}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width={22} height={10}>
              <line x1={0} y1={5} x2={22} y2={5} stroke="#B5403F" strokeWidth={1.5} strokeDasharray="5 3" opacity={0.6} />
            </svg>
            <span style={{ fontSize: 9.5, color: '#B5403F', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Crisis threshold (150)
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width={14} height={14}>
              <circle cx={7} cy={7} r={5.5} fill="none" stroke="#B5403F" strokeWidth={1.5} opacity={0.6} />
            </svg>
            <span style={{ fontSize: 9.5, color: '#888780', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              In crisis
            </span>
          </div>
        </div>
      </div>

      {/* ── Tooltip ───────────────────────────────────────────────────────── */}
      {tooltip && (() => {
        const f = tooltip.firm;
        return (
          <div style={{
            position: 'fixed', left: tooltip.x + 14, top: tooltip.y - 12,
            background: '#fff', border: '0.5px solid rgba(0,0,0,0.11)', borderRadius: 9,
            padding: '10px 13px', pointerEvents: 'none', zIndex: 300, minWidth: 180,
          }}>
            <div style={{
              fontWeight: 700, fontSize: 12, marginBottom: 6,
              color: PROV[f.p].color,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>{f.n}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#73726C', lineHeight: 1.7 }}>
              <div>Provider {f.p} &nbsp;&middot;&nbsp; &alpha; = {f.alpha.toFixed(2)}</div>
              <div>E[&pi;] = {f.epi.toFixed(2)}</div>
            </div>
            <div style={{
              marginTop: 7, paddingTop: 7, borderTop: '0.5px solid rgba(0,0,0,0.07)',
              display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: "'JetBrains Mono', monospace", fontSize: 15, fontWeight: 600,
              color: f.inCrisis ? '#B5403F' : '#22375A',
            }}>
              {f.lossIndex}
              {f.inCrisis && (
                <span style={{
                  fontSize: 9.5, fontWeight: 600,
                  background: 'rgba(181,64,63,0.09)', color: '#B5403F',
                  padding: '2px 7px', borderRadius: 4,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>
                  &#9888; IN CRISIS
                </span>
              )}
            </div>
          </div>
        );
      })()}
    </GraphCard>
  );
}
