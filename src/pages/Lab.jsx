import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { usePyodide } from '../hooks/usePyodide';
import GraphCard from '../components/ui/GraphCard';
import GraphSkeleton from '../components/ui/GraphSkeleton';
import { PROFILES, CENTRAL_CASE } from '../data/v5_reference';
import { hexToRgba, fmt, buildKDE } from '../utils/helpers';

// ── Constants ────────────────────────────────────────────────────────────────
const PROFILE_IDS = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8'];
const PROFILE_ETA = { P1: 0.02, P2: 0.02, P3: 0.02, P4: 0.01, P5: 0.03, P6: 0.01, P7: 0.04, P8: 0.01 };
const SC_COLORS = { G0: '#B5403F', G1: '#C49A3C', G2: '#4A7C59', baseline: '#888780' };
const SC_LABELS = { G0: 'Unmanaged AI (G0)', G1: 'Passive guardrails (G1)', G2: 'Active governance (G2)' };
const BASELINE_P99 = CENTRAL_CASE.baseline.p99theta;
const THETA = { G0: 1.25, G1: 1.20, G2: 1.10, baseline: 1.00 };

const H_PRESETS = {
  elite:        { lo: 0.65, hi: 0.95 },
  professional: { lo: 0.50, hi: 0.85 },
  operational:  { lo: 0.30, hi: 0.60 },
};

// ── Macroscopic options ──────────────────────────────────────────────────────
const STACK_OPTIONS = [
  { key: 'single',      label: 'Single vendor',          desc: 'One AI provider for all decisions', value: 0.95 },
  { key: 'dominant',    label: 'Dominant + backup',       desc: 'One main, some alternatives',      value: 0.70 },
  { key: 'multiple',    label: 'Multiple alternatives',   desc: 'Teams choose their own tools',     value: 0.50 },
  { key: 'diversified', label: 'Fully diversified',       desc: 'Multiple providers by layer',      value: 0.30 },
];
const SCREENING_OPTIONS = [
  { key: 'natexam', label: 'National exam system',   desc: 'France, Korea, Japan',          value: 4.25 },
  { key: 'natuniv', label: 'National university',    desc: 'Germany, Italy, Spain',         value: 3.25 },
  { key: 'mixed',   label: 'Mixed pipeline',         desc: 'US, Brazil, India',             value: 2.25 },
  { key: 'intl',    label: 'International hub',      desc: 'UK, Singapore, Netherlands',    value: 1.50 },
];
const DESKILL_OPTIONS = [
  { key: 'slow',     label: 'Slow',      desc: 'Regulated sectors, low turnover',  value: 0.01 },
  { key: 'moderate', label: 'Moderate',   desc: 'Typical professional services',    value: 0.02 },
  { key: 'fast',     label: 'Fast',       desc: 'High-turnover, competitive',       value: 0.03 },
  { key: 'vfast',    label: 'Very fast',  desc: 'BPO, back-office outsourcing',     value: 0.04 },
];
const TALENT_OPTIONS = [
  { key: 'elite',        label: 'Elite',         desc: 'Top-decile, strong independent judgment' },
  { key: 'professional', label: 'Professional',   desc: 'Solid execution, some AI reliance' },
  { key: 'operational',  label: 'Operational',    desc: 'Structured tasks, process-driven' },
];
const DOMAIN_LIST = [
  { label: 'Strategy consulting', epi: 0.55 }, { label: 'M&A advisory', epi: 0.50 },
  { label: 'Corporate legal', epi: 0.45 }, { label: 'IP law', epi: 0.45 },
  { label: 'Regulatory affairs', epi: 0.45 }, { label: 'Big Four audit', epi: 0.50 },
  { label: 'Tax advisory', epi: 0.45 }, { label: 'Investment banking', epi: 0.55 },
  { label: 'Asset management', epi: 0.60 }, { label: 'Private equity', epi: 0.55 },
  { label: 'Risk advisory', epi: 0.50 }, { label: 'Compliance', epi: 0.45 },
  { label: 'Insurance', epi: 0.50 }, { label: 'Credit rating', epi: 0.55 },
  { label: 'Financial planning', epi: 0.65 }, { label: 'Corporate banking', epi: 0.55 },
  { label: 'Derivatives trading', epi: 0.60 }, { label: 'Private banking', epi: 0.55 },
  { label: 'HR consulting', epi: 0.55 }, { label: 'Procurement', epi: 0.65 },
  { label: 'Supply chain', epi: 0.70 }, { label: 'Public sector', epi: 0.60 },
  { label: 'Healthcare admin', epi: 0.60 }, { label: 'Central admin', epi: 0.60 },
  { label: 'Research analytics', epi: 0.70 }, { label: 'Tech ops', epi: 0.85 },
  { label: 'Tech startup', epi: 0.70 }, { label: 'UX research', epi: 0.80 },
  { label: 'Digital marketing', epi: 0.80 }, { label: 'Content strategy', epi: 0.75 },
  { label: 'Creative agency', epi: 0.85 }, { label: 'Brand strategy', epi: 0.75 },
  { label: 'Back-office ops', epi: 0.75 }, { label: 'Development finance', epi: 0.50 },
];

function profileToMacro(pid) {
  const p = PROFILES[pid]; const eta = PROFILE_ETA[pid];
  return {
    stack: STACK_OPTIONS.reduce((b, o) => Math.abs(o.value - p.alpha) < Math.abs(b.value - p.alpha) ? o : b).key,
    screening: SCREENING_OPTIONS.reduce((b, o) => Math.abs(o.value - p.beta) < Math.abs(b.value - p.beta) ? o : b).key,
    domain: DOMAIN_LIST.reduce((b, o) => Math.abs(o.epi - p.epi) < Math.abs(b.epi - p.epi) ? o : b).label,
    deskill: DESKILL_OPTIONS.reduce((b, o) => Math.abs(o.value - eta) < Math.abs(b.value - eta) ? o : b).key,
    talent: p.epi >= 0.75 ? 'operational' : (p.alpha <= 0.50 ? 'elite' : 'professional'),
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function normBins(bins) {
  return (bins || []).map(b => ({ lo: b.bin_left ?? b.bin_lo ?? b.lo, hi: b.bin_right ?? b.bin_hi ?? b.hi, count: b.count }));
}

// ── UI components ────────────────────────────────────────────────────────────
const cardS = { background: '#FFFFFF', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 10, padding: '14px 16px' };
const lblS = { fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, fontWeight: 700, color: '#22375A', marginBottom: 8, display: 'block' };

function RadioGroup({ label, options, value, onChange }) {
  return (
    <div style={cardS}>
      <span style={lblS}>{label}</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {options.map(o => {
          const on = value === o.key;
          return (
            <button key={o.key} onClick={() => onChange(o.key)} style={{
              padding: '6px 10px', borderRadius: 5, border: 'none', textAlign: 'left',
              background: on ? 'rgba(97,158,168,0.12)' : 'transparent',
              color: on ? '#22375A' : '#888780',
              fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11,
              fontWeight: on ? 600 : 400, cursor: 'pointer', transition: 'all 0.12s',
            }}>
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', marginRight: 8, verticalAlign: 'middle', background: on ? '#619EA8' : 'rgba(0,0,0,0.08)' }} />
              {o.label}
              {o.desc && <span style={{ fontSize: 9, color: '#A0A09A', marginLeft: 6 }}>{o.desc}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DomainSelect({ value, onChange }) {
  return (
    <div style={cardS}>
      <span style={lblS}>Domain</span>
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        width: '100%', padding: '8px 10px', borderRadius: 6,
        border: '0.5px solid rgba(0,0,0,0.12)', background: '#FAFAF8',
        fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12,
        color: '#22375A', cursor: 'pointer',
      }}>
        {DOMAIN_LIST.map(d => (
          <option key={d.label} value={d.label}>{d.label} (E[{'\u03c0'}]={d.epi.toFixed(2)})</option>
        ))}
      </select>
    </div>
  );
}

// ── LabHistogram ─────────────────────────────────────────────────────────────
function LabHistogram({ results }) {
  const canvasRef = useRef(null), wrapRef = useRef(null);

  const kdes = useMemo(() => {
    if (!results) return null;
    const r = {};
    ['G0', 'G1', 'G2'].forEach(sc => {
      if (results[sc]?.histogram_bins) r[sc] = buildKDE(normBins(results[sc].histogram_bins));
    });
    return Object.keys(r).length === 3 ? r : null;
  }, [results]);

  const draw = useCallback(() => {
    const cv = canvasRef.current, wrap = wrapRef.current;
    if (!cv || !wrap || !kdes) return;
    const dpr = window.devicePixelRatio || 1;
    const W = wrap.getBoundingClientRect().width, H = 300;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    const ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);

    const PAD = { l: 40, r: 16, t: 16, b: 36 };
    const cW = W - PAD.l - PAD.r, cH = H - PAD.t - PAD.b, xMax = 2500;
    const allY = [...kdes.G0.map(p => p.y), ...kdes.G1.map(p => p.y), ...kdes.G2.map(p => p.y)];
    const yMax = Math.max(...allY) * 1.15 || 0.001;
    const xPx = v => PAD.l + (v / xMax) * cW;
    const yPx = v => PAD.t + cH * (1 - v / yMax);

    [500, 1000, 1500, 2000].forEach(v => {
      ctx.beginPath(); ctx.moveTo(xPx(v), PAD.t); ctx.lineTo(xPx(v), PAD.t + cH);
      ctx.strokeStyle = 'rgba(0,0,0,0.04)'; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = '#A0A09A'; ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.textAlign = 'center'; ctx.fillText(fmt(v), xPx(v), PAD.t + cH + 14);
    });
    ctx.save(); ctx.strokeStyle = '#888780'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(xPx(BASELINE_P99), PAD.t); ctx.lineTo(xPx(BASELINE_P99), PAD.t + cH); ctx.stroke();
    ctx.setLineDash([]); ctx.fillStyle = '#888780'; ctx.font = "9px 'JetBrains Mono', monospace";
    ctx.textAlign = 'center'; ctx.fillText('baseline', xPx(BASELINE_P99), PAD.t - 4); ctx.restore();

    const drawA = (kde, color, fa) => {
      ctx.beginPath(); ctx.moveTo(xPx(kde[0].x), yPx(0));
      kde.forEach(p => ctx.lineTo(xPx(p.x), yPx(p.y)));
      ctx.lineTo(xPx(kde[kde.length - 1].x), yPx(0)); ctx.closePath();
      ctx.fillStyle = hexToRgba(color, fa); ctx.fill();
      ctx.beginPath(); kde.forEach((p, i) => i === 0 ? ctx.moveTo(xPx(p.x), yPx(p.y)) : ctx.lineTo(xPx(p.x), yPx(p.y)));
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
    };
    drawA(kdes.G2, SC_COLORS.G2, 0.18);
    drawA(kdes.G1, SC_COLORS.G1, 0.15);
    drawA(kdes.G0, SC_COLORS.G0, 0.20);
    ctx.fillStyle = '#888780'; ctx.font = "10px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = 'center'; ctx.fillText('Quarterly loss', PAD.l + cW / 2, H - 4);
  }, [kdes]);

  useEffect(() => { draw(); }, [draw]);
  useEffect(() => { const h = () => draw(); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h); }, [draw]);

  return (
    <GraphCard title="Loss distribution" subtitle="G0 (red), G1 (amber), G2 (green) overlaid. Governance progressively compresses the right tail.">
      <div style={{ display: 'flex', gap: 16, marginBottom: 10, fontSize: 10, fontFamily: "'Plus Jakarta Sans', sans-serif", flexWrap: 'wrap' }}>
        {['G0', 'G1', 'G2'].map(sc => (
          <span key={sc}><span style={{ display: 'inline-block', width: 14, height: 3, background: SC_COLORS[sc], marginRight: 6, verticalAlign: 'middle' }} />{SC_LABELS[sc]}</span>
        ))}
      </div>
      <div ref={wrapRef}><canvas ref={canvasRef} style={{ display: 'block', width: '100%' }} /></div>
    </GraphCard>
  );
}

// ── LabTrajectory ────────────────────────────────────────────────────────────
function LabTrajectory({ results }) {
  const SVG_W = 520, SVG_H = 300;
  const PAD = { l: 44, r: 20, t: 16, b: 30 };
  const cW = SVG_W - PAD.l - PAD.r, cH = SVG_H - PAD.t - PAD.b;

  const { lines, yMin, yMax } = useMemo(() => {
    if (!results) return { lines: {}, yMin: 800, yMax: 2500 };
    const r = {};
    ['G0', 'G1', 'G2'].forEach(sc => {
      const traj = results[sc]?.trajectories;
      if (!traj) return;
      r[sc] = traj.map(t => ({ t: t.quarter, p99: t.P99_L * THETA[sc] }));
    });
    const allY = Object.values(r).flat().map(p => p.p99); allY.push(BASELINE_P99);
    return { lines: r, yMin: Math.min(...allY) * 0.92, yMax: Math.max(...allY) * 1.05 };
  }, [results]);

  const xPx = t => PAD.l + ((t - 1) / 19) * cW;
  const yPx = v => PAD.t + cH * (1 - (v - yMin) / (yMax - yMin));
  const pathD = pts => pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${xPx(p.t).toFixed(1)},${yPx(p.p99).toFixed(1)}`).join(' ');

  const gridVals = useMemo(() => {
    const step = Math.max(100, Math.round((yMax - yMin) / 5 / 100) * 100);
    const v = []; for (let x = Math.ceil(yMin / step) * step; x <= yMax; x += step) v.push(x); return v;
  }, [yMin, yMax]);

  return (
    <GraphCard title={'Tail risk over 20 quarters'} subtitle={'P99\u00d7\u03b8 under three governance regimes. Red\u00a0=\u00a0G0, amber\u00a0=\u00a0G1, green\u00a0=\u00a0G2.'}>
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ display: 'block', width: '100%', overflow: 'visible' }}>
        {gridVals.map(v => (<g key={v}><line x1={PAD.l} y1={yPx(v)} x2={PAD.l+cW} y2={yPx(v)} stroke="rgba(0,0,0,0.04)" strokeWidth={1}/><text x={PAD.l-6} y={yPx(v)+3.5} textAnchor="end" fontFamily="'JetBrains Mono', monospace" fontSize={9} fill="#A0A09A">{(v/1000).toFixed(1)}k</text></g>))}
        <line x1={PAD.l} y1={yPx(BASELINE_P99)} x2={PAD.l+cW} y2={yPx(BASELINE_P99)} stroke="#888780" strokeWidth={1.5} strokeDasharray="4 3" opacity={0.7}/>
        <text x={PAD.l+cW+4} y={yPx(BASELINE_P99)+3.5} fontFamily="'Plus Jakarta Sans', sans-serif" fontSize={8} fill="#888780">baseline</text>
        {['G2','G1','G0'].map(sc => lines[sc]?.length > 0 && (<g key={sc}><path d={pathD(lines[sc])} fill="none" stroke={SC_COLORS[sc]} strokeWidth={2.5} strokeLinecap="round"/>{lines[sc].map(p => <circle key={p.t} cx={xPx(p.t)} cy={yPx(p.p99)} r={2} fill={SC_COLORS[sc]}/>)}</g>))}
        {[1,5,10,15,20].map(t => <text key={t} x={xPx(t)} y={SVG_H-6} textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize={9} fill="#A0A09A">Q{t}</text>)}
      </svg>
    </GraphCard>
  );
}

// ── LabConvergence (3 stacked mini-charts) ───────────────────────────────────
function LabConvergence({ results }) {
  const METRICS = [
    { key: 'var_tau',     label: 'Cognitive diversity',  unit: '' },
    { key: 'h_bar',       label: 'Independent skill',    unit: '' },
    { key: 'follow_rate', label: 'Surrender rate',       unit: '' },
  ];
  const SC_LIST = ['G0', 'G1', 'G2'];

  // Normalise each metric to index=1.0 at Q1
  const seriesByMetric = useMemo(() => {
    if (!results) return null;
    const out = {};
    METRICS.forEach(m => {
      out[m.key] = {};
      SC_LIST.forEach(sc => {
        const traj = results[sc]?.trajectories;
        if (!traj || traj.length === 0) return;
        const raw = traj.map(t => ({ t: t.quarter, v: t[m.key] }));
        const v0 = raw[0]?.v || 1;
        out[m.key][sc] = raw.map(p => ({ t: p.t, v: v0 > 0 ? p.v / v0 : 1 }));
      });
    });
    return out;
  }, [results]);

  if (!seriesByMetric) return null;

  const SVG_W = 520, MINI_H = 80;
  const PAD = { l: 130, r: 16, t: 6, b: 14 };
  const cW = SVG_W - PAD.l - PAD.r, cH = MINI_H - PAD.t - PAD.b;

  return (
    <GraphCard title="How the organisation tightens" subtitle="Three structural indicators tracked over 20 quarters, normalised to 1.0 at Q1. Compare G0 (red), G1 (amber), G2 (green).">
      <div style={{ display: 'flex', gap: 12, marginBottom: 8, fontSize: 10, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {SC_LIST.map(sc => <span key={sc}><span style={{ display: 'inline-block', width: 12, height: 2.5, background: SC_COLORS[sc], marginRight: 5, verticalAlign: 'middle' }}/>{SC_LABELS[sc]}</span>)}
      </div>
      {METRICS.map(m => {
        const data = seriesByMetric[m.key];
        const allV = Object.values(data).flat().map(p => p.v).filter(v => !isNaN(v));
        if (allV.length === 0) return null;
        const yMin = Math.min(...allV) * 0.97, yMax = Math.max(...allV) * 1.03;
        const xPx = t => PAD.l + ((t - 1) / 19) * cW;
        const yPx = v => PAD.t + cH * (1 - (v - yMin) / (yMax - yMin));
        const pathD = pts => pts.filter(p => !isNaN(p.v)).map((p, i) => `${i === 0 ? 'M' : 'L'}${xPx(p.t).toFixed(1)},${yPx(p.v).toFixed(1)}`).join(' ');

        return (
          <div key={m.key} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <svg viewBox={`0 0 ${SVG_W} ${MINI_H}`} style={{ display: 'block', width: '100%', overflow: 'visible' }}>
              {/* Label */}
              <text x={PAD.l - 8} y={MINI_H / 2 + 4} textAnchor="end" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize={10} fontWeight={600} fill="#22375A">{m.label}</text>
              {/* 1.0 reference */}
              <line x1={PAD.l} y1={yPx(1.0)} x2={PAD.l + cW} y2={yPx(1.0)} stroke="rgba(0,0,0,0.06)" strokeWidth={0.5} strokeDasharray="2 3" />
              {/* Lines per scenario */}
              {SC_LIST.map(sc => data[sc]?.length > 0 && (
                <path key={sc} d={pathD(data[sc])} fill="none" stroke={SC_COLORS[sc]} strokeWidth={1.8} strokeLinecap="round" />
              ))}
            </svg>
          </div>
        );
      })}
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 130, paddingRight: 16, fontSize: 9, color: '#A0A09A', fontFamily: "'JetBrains Mono', monospace" }}>
        <span>Q1</span><span>Q5</span><span>Q10</span><span>Q15</span><span>Q20</span>
      </div>
    </GraphCard>
  );
}

// ── LabScaffoldGauge ─────────────────────────────────────────────────────────
function LabScaffoldGauge({ results }) {
  const g0 = results?.G0, g1 = results?.G1, g2 = results?.G2;
  const p99G0 = g0?.p99_theta || 0, p99G1 = g1?.p99_theta || 0, p99G2 = g2?.p99_theta || 0;
  const scaffold = g2?.scaffold_benefit;
  const val = scaffold != null ? Math.round(scaffold * 100) : null;
  const isPos = val != null && val >= 0;
  const color = val == null ? '#A0A09A' : isPos ? '#4A7C59' : '#B5403F';
  const redG1 = p99G0 > 0 ? Math.round((p99G0 - p99G1) / p99G0 * 100) : 0;
  const redG2 = p99G0 > 0 ? Math.round((p99G0 - p99G2) / p99G0 * 100) : 0;

  return (
    <GraphCard title="Governance efficiency" subtitle="Does governance earn its velocity cost? Positive scaffold benefit means governance preserves more output per unit of risk reduced than it costs in speed.">
      <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, textAlign: 'center', padding: '12px 0' }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 36, fontWeight: 700, color, marginBottom: 4 }}>
            {val != null ? `${val >= 0 ? '+' : ''}${val}%` : '\u2014'}
          </div>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, color, fontWeight: 600, marginBottom: 12 }}>
            {val != null ? (isPos ? 'Governance is productive' : 'Governance is counterproductive') : '\u2014'}
          </div>
        </div>
        {p99G0 > 0 && (
          <div style={{ minWidth: 200, background: '#F5F4EF', borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#A0A09A', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
              P99{'\u00d7'}{'\u03b8'} tail risk
            </div>
            {[
              { label: 'G0 (unmanaged)', value: p99G0, color: SC_COLORS.G0 },
              { label: 'G1 (passive)', value: p99G1, color: SC_COLORS.G1, delta: `\u2212${redG1}%` },
              { label: 'G2 (active)', value: p99G2, color: SC_COLORS.G2, delta: `\u2212${redG2}%` },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, color: row.color, fontWeight: 500 }}>{row.label}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600, color: '#22375A' }}>
                  {fmt(row.value)}{row.delta && <span style={{ fontSize: 10, color: '#4A7C59', marginLeft: 6 }}>{row.delta}</span>}
                </span>
              </div>
            ))}
            <div style={{ borderTop: '0.5px solid rgba(0,0,0,0.06)', marginTop: 6, paddingTop: 6, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: '#888780' }}>Baseline (no AI)</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#888780' }}>{fmt(BASELINE_P99)}</span>
            </div>
          </div>
        )}
      </div>
    </GraphCard>
  );
}

// ── Main Lab Component ───────────────────────────────────────────────────────
export default function Lab() {
  const [stack, setStack] = useState('dominant');
  const [screening, setScreening] = useState('natexam');
  const [domainLabel, setDomainLabel] = useState('Strategy consulting');
  const [deskill, setDeskill] = useState('moderate');
  const [talent, setTalent] = useState('elite');

  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null); // { G0: {...}, G1: {...}, G2: {...} }
  const [error, setError] = useState(null);

  const { ready: pyReady, run_custom_scenario } = usePyodide();

  // Numeric params from macroscopic choices
  const numP = useMemo(() => ({
    alpha: STACK_OPTIONS.find(o => o.key === stack)?.value ?? 0.70,
    beta:  SCREENING_OPTIONS.find(o => o.key === screening)?.value ?? 3.0,
    epi:   DOMAIN_LIST.find(d => d.label === domainLabel)?.epi ?? 0.55,
    eta:   DESKILL_OPTIONS.find(o => o.key === deskill)?.value ?? 0.02,
    h_lo:  H_PRESETS[talent]?.lo ?? 0.50,
    h_hi:  H_PRESETS[talent]?.hi ?? 0.85,
  }), [stack, screening, domainLabel, deskill, talent]);

  const selectProfile = useCallback((pid) => {
    const m = profileToMacro(pid);
    setStack(m.stack); setScreening(m.screening); setDomainLabel(m.domain);
    setDeskill(m.deskill); setTalent(m.talent);
    setResults(null); setError(null);
  }, []);

  // Clear results when params change
  useEffect(() => { setResults(null); }, [stack, screening, domainLabel, deskill, talent]);

  // Run simulation: G0 + G1 + G2
  const handleRun = useCallback(async () => {
    if (!pyReady || running) return;
    setRunning(true); setError(null); setResults(null);
    const { alpha, beta, epi, eta, h_lo, h_hi } = numP;
    try {
      const [rG0, rG1, rG2] = await Promise.all([
        run_custom_scenario(alpha, beta, epi, eta, h_lo, h_hi, 'G0', 50),
        run_custom_scenario(alpha, beta, epi, eta, h_lo, h_hi, 'G1', 50),
        run_custom_scenario(alpha, beta, epi, eta, h_lo, h_hi, 'G2', 50),
      ]);
      setResults({ G0: rG0, G1: rG1, G2: rG2 });
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  }, [pyReady, running, numP, run_custom_scenario]);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px 64px' }}>
      <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 36, color: '#22375A', marginBottom: 8 }}>
        Parameter Explorer
      </h1>
      <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, color: '#888780', marginBottom: 28, maxWidth: 640 }}>
        Configure your organisation's structural parameters, then run the Monte Carlo simulation to see how tail risk responds under three governance regimes.
      </p>

      {/* ═══════ CONFIGURATION ═══════ */}
      <div style={{ background: '#FFFFFF', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 14, padding: '24px 24px 20px', marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#A0A09A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
          1. Start from a preset (optional)
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
          {PROFILE_IDS.map(pid => {
            const pr = PROFILES[pid];
            return (
              <button key={pid} onClick={() => selectProfile(pid)} style={{
                padding: '8px 14px', borderRadius: 7, cursor: 'pointer',
                border: '0.5px solid rgba(0,0,0,0.08)', background: '#FFFFFF',
                color: '#73726C', fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 11, fontWeight: 600, transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = pr.color; e.currentTarget.style.color = pr.color; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; e.currentTarget.style.color = '#73726C'; }}
              >
                {pr.name} {'\u2014'} {pr.city}
              </button>
            );
          })}
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, color: '#A0A09A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
          2. Adjust structural parameters
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
          <RadioGroup label="AI stack architecture" options={STACK_OPTIONS} value={stack} onChange={setStack} />
          <RadioGroup label="Screening pipeline" options={SCREENING_OPTIONS} value={screening} onChange={setScreening} />
          <DomainSelect value={domainLabel} onChange={setDomainLabel} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
          <RadioGroup label="Deskilling speed" options={DESKILL_OPTIONS} value={deskill} onChange={setDeskill} />
          <RadioGroup label="Talent tier" options={TALENT_OPTIONS} value={talent} onChange={setTalent} />
          <div style={{ ...cardS, display: 'flex', flexDirection: 'column' }}>
            <span style={lblS}>Resolved parameters</span>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#22375A', lineHeight: 1.8 }}>
              {'\u03b1'} = {numP.alpha.toFixed(2)}<br/>
              {'\u03b2'} = {numP.beta.toFixed(1)}<br/>
              E[{'\u03c0'}] = {numP.epi.toFixed(2)}<br/>
              {'\u03b7'} = {numP.eta.toFixed(3)}<br/>
              h = [{numP.h_lo.toFixed(2)}, {numP.h_hi.toFixed(2)}]
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={handleRun} disabled={!pyReady || running} style={{
            padding: '12px 32px', borderRadius: 8, border: 'none',
            background: !pyReady ? '#E0DFD9' : running ? '#E0DFD9' : '#619EA8',
            color: !pyReady || running ? '#888780' : '#FFFFFF',
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, fontWeight: 700,
            cursor: !pyReady || running ? 'default' : 'pointer',
            transition: 'all 0.2s',
          }}>
            {running ? 'Running simulation\u2026' : 'Run simulation'}
          </button>
          <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: pyReady ? '#4A7C59' : '#C49A3C' }}>
            {pyReady ? '\u2713 Engine ready' : 'Loading engine\u2026'}
          </span>
          {running && <span style={{ fontSize: 11, color: '#888780', fontStyle: 'italic' }}>3 scenarios {'\u00d7'} 50 replications{'\u2026'}</span>}
        </div>
      </div>

      {/* ═══════ ERROR ═══════ */}
      {error && (
        <div style={{ background: 'rgba(181,64,63,0.08)', border: '0.5px solid rgba(181,64,63,0.25)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#B5403F' }}>
          Simulation error: {error}
        </div>
      )}

      {/* ═══════ RESULTS ═══════ */}
      {!results && !running && (
        <div style={{ textAlign: 'center', padding: '80px 24px', color: '#A0A09A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          <div style={{ fontSize: 16, marginBottom: 8 }}>Configure parameters above, then click <strong style={{ color: '#619EA8' }}>Run simulation</strong></div>
          <div style={{ fontSize: 12 }}>Results will appear here {'\u2014'} three governance regimes compared side by side.</div>
        </div>
      )}

      {running && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <GraphSkeleton height={360} /><GraphSkeleton height={360} />
          <GraphSkeleton height={300} /><GraphSkeleton height={200} />
        </div>
      )}

      {results && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#A0A09A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
            Simulation results
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <LabHistogram results={results} />
            <LabTrajectory results={results} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <LabConvergence results={results} />
            <LabScaffoldGauge results={results} />
          </div>
        </>
      )}
    </div>
  );
}
