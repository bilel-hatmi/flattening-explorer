import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useCSV } from '../../hooks/useCSV';
import { useProfile } from '../../context/ProfileContext';
import GraphCard from '../ui/GraphCard';
import GraphSkeleton from '../ui/GraphSkeleton';
import { hexToRgba, buildKDE } from '../../utils/helpers';

const SCENARIOS = ['baseline', 'G0', 'G1', 'G2'];
const SC_META = {
  baseline: { label: 'No AI (baseline)', color: '#888780', fillAlpha: 0.10 },
  G0:       { label: 'Unmanaged AI',      color: '#B5403F', fillAlpha: 0.07 },
  G1:       { label: 'Passive guardrails', color: '#C49A3C', fillAlpha: 0.07 },
  G2:       { label: 'Active governance',  color: '#4A7C59', fillAlpha: 0.07 },
};

function pct(val, ref) {
  const d = Math.round((val / ref - 1) * 100);
  return (d >= 0 ? '+' : '') + d + '%';
}

// ─── Main histogram chart on Canvas ───
function drawMainChart(ctx, W, H, kdeData, activeSet, metrics) {
  const dpr = window.devicePixelRatio || 1;
  ctx.canvas.width = W * dpr;
  ctx.canvas.height = H * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const PAD = { l: 40, r: 16, t: 24, b: 36 };
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;

  const xMin = 0, xMax = 1900;
  const xPx = (v) => PAD.l + ((v - xMin) / (xMax - xMin)) * cW;

  // Y range: auto from visible KDE
  let yMax = 0;
  SCENARIOS.forEach((sc) => {
    if (!activeSet.has(sc) || !kdeData[sc]) return;
    kdeData[sc].forEach((pt) => { if (pt.y > yMax) yMax = pt.y; });
  });
  yMax *= 1.15;
  if (yMax === 0) yMax = 0.004;
  const yPx = (v) => PAD.t + cH * (1 - v / yMax);

  // X gridlines + ticks
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  for (let v = 250; v <= 1750; v += 250) {
    const x = xPx(v);
    ctx.strokeStyle = 'rgba(0,0,0,0.04)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, PAD.t);
    ctx.lineTo(x, PAD.t + cH);
    ctx.stroke();
    ctx.fillStyle = '#73726C';
    ctx.fillText(v.toLocaleString(), x, PAD.t + cH + 14);
  }

  ctx.font = '11px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#73726C';
  ctx.fillText('Quarterly loss (total errors)', PAD.l + cW / 2, H - 4);

  // Draw KDE curves for each active scenario
  const drawOrder = ['baseline', 'G2', 'G1', 'G0'];
  drawOrder.forEach((sc) => {
    if (!activeSet.has(sc) || !kdeData[sc]) return;
    const meta = SC_META[sc];
    const pts = kdeData[sc];

    // Fill area under curve
    ctx.fillStyle = hexToRgba(meta.color, meta.fillAlpha);
    ctx.beginPath();
    ctx.moveTo(xPx(pts[0].x), yPx(0));
    pts.forEach((pt) => ctx.lineTo(xPx(pt.x), yPx(pt.y)));
    ctx.lineTo(xPx(pts[pts.length - 1].x), yPx(0));
    ctx.closePath();
    ctx.fill();

    // Stroke curve
    ctx.strokeStyle = meta.color;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    pts.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(xPx(pt.x), yPx(pt.y));
      else ctx.lineTo(xPx(pt.x), yPx(pt.y));
    });
    ctx.stroke();
  });

  // Annotation lines: Mean (dashed) and P99 (solid) for active scenarios
  SCENARIOS.forEach((sc) => {
    if (!activeSet.has(sc) || !metrics[sc]) return;
    const meta = SC_META[sc];
    const m = metrics[sc];

    // Mean — dashed, faint
    ctx.save();
    ctx.setLineDash([3, 5]);
    ctx.strokeStyle = hexToRgba(meta.color, 0.30);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(xPx(m.mean), PAD.t);
    ctx.lineTo(xPx(m.mean), PAD.t + cH);
    ctx.stroke();
    ctx.restore();

    // P99 — solid
    ctx.save();
    ctx.setLineDash([]);
    ctx.strokeStyle = hexToRgba(meta.color, 0.75);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(xPx(m.p99), PAD.t);
    ctx.lineTo(xPx(m.p99), PAD.t + cH);
    ctx.stroke();
    // P99 label
    if (activeSet.size <= 2 || sc === 'G0') {
      ctx.fillStyle = hexToRgba(meta.color, 0.85);
      ctx.font = '500 9px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('P99', xPx(m.p99), PAD.t - 5);
    }
    ctx.restore();
  });

  // "Invisible to KPIs"
  if (activeSet.has('G0') && metrics.G0) {
    const m = metrics.G0;
    const xMid = (xPx(m.mean) + xPx(m.p99)) / 2;
    const yPos = PAD.t + cH * 0.42;
    ctx.save();
    ctx.fillStyle = 'rgba(115,114,108,0.55)';
    ctx.font = 'italic 12px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Invisible to KPIs', xMid, yPos);
    ctx.restore();
  }
}

// ─── Inset chart (tail zoom) ───
function drawInsetChart(ctx, W, H, kdeData, activeSet) {
  const dpr = window.devicePixelRatio || 1;
  ctx.canvas.width = W * dpr;
  ctx.canvas.height = H * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const PAD = { l: 4, r: 4, t: 4, b: 18 };
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;
  const xMin = 900, xMax = 1850;
  const xPx = (v) => PAD.l + ((v - xMin) / (xMax - xMin)) * cW;

  // Auto Y range from visible KDE in inset range
  let yMinV = Infinity, yMaxV = -Infinity;
  SCENARIOS.forEach((sc) => {
    if (!activeSet.has(sc) || !kdeData[sc]) return;
    kdeData[sc].forEach((pt) => {
      if (pt.x >= xMin && pt.x <= xMax) {
        if (pt.y < yMinV) yMinV = pt.y;
        if (pt.y > yMaxV) yMaxV = pt.y;
      }
    });
  });
  if (!isFinite(yMaxV)) { yMinV = 0; yMaxV = 0.001; }
  const pad = (yMaxV - yMinV) * 0.18;
  yMinV = Math.max(0, yMinV - pad);
  yMaxV = yMaxV + pad;
  const yPx = (v) => PAD.t + cH * (1 - (v - yMinV) / (yMaxV - yMinV));

  ctx.font = '8px "JetBrains Mono", monospace';
  ctx.fillStyle = '#A0A09A';
  ctx.textAlign = 'center';
  for (let v = 1000; v <= 1800; v += 200) {
    const x = xPx(v);
    ctx.strokeStyle = 'rgba(0,0,0,0.04)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, PAD.t);
    ctx.lineTo(x, PAD.t + cH);
    ctx.stroke();
    ctx.fillText(v.toString(), x, H - 4);
  }

  const drawOrder = ['baseline', 'G2', 'G1', 'G0'];
  drawOrder.forEach((sc) => {
    if (!activeSet.has(sc) || !kdeData[sc]) return;
    const meta = SC_META[sc];
    const pts = kdeData[sc].filter((pt) => pt.x >= xMin && pt.x <= xMax);
    if (pts.length === 0) return;

    ctx.fillStyle = hexToRgba(meta.color, 0.07);
    ctx.beginPath();
    ctx.moveTo(xPx(pts[0].x), yPx(yMinV));
    pts.forEach((pt) => ctx.lineTo(xPx(pt.x), yPx(pt.y)));
    ctx.lineTo(xPx(pts[pts.length - 1].x), yPx(yMinV));
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = meta.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    pts.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(xPx(pt.x), yPx(pt.y));
      else ctx.lineTo(xPx(pt.x), yPx(pt.y));
    });
    ctx.stroke();
  });
}

// ─── Metric Cards ───
function MetricCards({ metrics }) {
  if (!metrics.G2) return null;

  const mG2 = metrics.G2;
  const mB = metrics.baseline;
  const mG0 = metrics.G0;

  const cards = [
    {
      label: 'Average quarterly loss',
      sublabel: 'What dashboards and KPIs report — the visible signal',
      value: Math.round(mG2.mean),
      valueClass: '',
      refB: mB.mean,
      refG0: mG0.mean,
    },
    {
      label: 'Worst-case quarter (P99)',
      sublabel: 'One-in-a-hundred quarter — raw, unadjusted for output gains',
      value: Math.round(mG2.p99),
      valueClass: 'warning',
      refB: mB.p99,
      refG0: mG0.p99,
    },
    {
      label: 'Risk-adjusted worst case',
      sublabel: 'Worst-case adjusted for throughput gain AI provides (P99 \× \θ)',
      value: Math.round(mG2.theta),
      valueClass: 'warning',
      refB: mB.theta,
      refG0: mG0.theta,
    },
  ];

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#22375A', marginBottom: 10, display: 'flex', alignItems: 'baseline', gap: 8 }}>
        Outcomes under <strong style={{ marginLeft: 4 }}>Active governance (G2)</strong>
        <span style={{ fontSize: 10, fontWeight: 400, color: '#73726C' }}>{'\— what changes under active governance'}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {cards.map((c) => {
          const vsBase = pct(c.value, c.refB);
          const vsG0 = pct(c.value, c.refG0);
          return (
            <div key={c.label} style={{ background: '#F5F4EF', borderRadius: 8, padding: '13px 13px 11px' }}>
              <div style={{ fontSize: 10, color: '#73726C', fontWeight: 600, marginBottom: 1 }}>{c.label}</div>
              <div style={{ fontSize: 9, color: '#A0A09A', lineHeight: 1.4, marginBottom: 7 }}>{c.sublabel}</div>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 500, lineHeight: 1.15, marginBottom: 9,
                color: c.valueClass === 'warning' ? '#C49A3C' : '#22375A',
              }}>
                {c.value.toLocaleString()}
              </div>
              <div style={{ borderTop: '0.5px solid rgba(0,0,0,0.07)', paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 9, color: '#A0A09A' }}>vs No AI</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 500, color: vsBase.startsWith('+') ? '#B5403F' : '#4A7C59' }}>{vsBase}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 9, color: '#A0A09A' }}>vs Unmanaged AI</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 500, color: vsG0.startsWith('+') ? '#B5403F' : '#4A7C59' }}>{vsG0}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Toggle buttons ───
function ScenarioToggles({ active, onToggle }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
      {SCENARIOS.map((sc) => {
        const meta = SC_META[sc];
        const isActive = active.has(sc);
        return (
          <button
            key={sc}
            onClick={() => onToggle(sc)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '5px 13px 5px 9px', borderRadius: 6,
              border: isActive ? '0.5px solid #22375A' : '0.5px solid rgba(0,0,0,0.14)',
              background: isActive ? '#22375A' : 'transparent',
              color: isActive ? '#fff' : '#73726C',
              fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, fontWeight: 500,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            <span style={{ width: 10, height: 10, borderRadius: 2, flexShrink: 0, background: meta.color, opacity: isActive ? 1 : 0.45 }} />
            {meta.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main Component ───
export default function A1_BimodalHero() {
  const { profileId } = useProfile();
  const profile = profileId || 'P3';
  const { data, loading } = useCSV('histograms_by_profile_b030.csv');
  const [activeSet, setActiveSet] = useState(new Set(SCENARIOS));
  const mainRef = useRef(null);
  const insetRef = useRef(null);
  const wrapRef = useRef(null);

  // Process CSV into KDE curves + metrics per scenario
  const { kdeData, metrics } = useMemo(() => {
    if (!data) return { kdeData: {}, metrics: {} };
    const binsByScenario = {};
    const mt = {};
    data.forEach((row) => {
      if (row.profile_id !== profile) return;
      const sc = row.scenario;
      if (!binsByScenario[sc]) binsByScenario[sc] = [];
      binsByScenario[sc].push({ lo: +row.bin_lo, hi: +row.bin_hi, count: +row.count });
      if (!mt[sc]) {
        mt[sc] = { mean: +row.mean_loss, p99: +row.p99_brut, theta: +row.p99_theta };
      }
    });
    // Build KDE from bins for each scenario
    const kd = {};
    Object.entries(binsByScenario).forEach(([sc, bins]) => {
      kd[sc] = buildKDE(bins, 80);
    });
    return { kdeData: kd, metrics: mt };
  }, [data, profile]);

  const handleToggle = useCallback((sc) => {
    setActiveSet((prev) => {
      const next = new Set(prev);
      if (next.has(sc)) {
        if (next.size === 1) return prev; // min 1 active
        next.delete(sc);
      } else {
        next.add(sc);
      }
      return next;
    });
  }, []);

  // Draw both canvases
  const draw = useCallback(() => {
    if (!mainRef.current || !insetRef.current || !wrapRef.current) return;
    const W = wrapRef.current.clientWidth;
    drawMainChart(mainRef.current.getContext('2d'), W, 220, kdeData, activeSet, metrics);
    drawInsetChart(insetRef.current.getContext('2d'), 200, 80, kdeData, activeSet);
  }, [kdeData, activeSet, metrics]);

  useEffect(() => {
    draw();
    const onResize = () => draw();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [draw]);

  if (loading) return <GraphCard title="Quarterly loss distribution under AI adoption"><GraphSkeleton height={220} /></GraphCard>;

  return (
    <GraphCard
      id="a1"
      title="Quarterly loss distribution under AI adoption"
      subtitle={`Distribution of total quarterly errors across several hundred Monte Carlo replications \— ${profile === 'P3' ? 'Strategy consulting profile (P3)' : profile}`}
    >
      <div style={{ fontSize: 12, fontWeight: 600, color: '#22375A', marginBottom: 16, lineHeight: 1.5, maxWidth: 640 }}>
        Under unmanaged AI, average errors fall while worst-case losses rise. Dashboards capture only the first signal.
      </div>

      <ScenarioToggles active={activeSet} onToggle={handleToggle} />

      <div ref={wrapRef} style={{ position: 'relative', height: 220, marginBottom: 8 }}>
        <canvas ref={mainRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
        <div style={{
          position: 'absolute', top: 8, right: 8, width: 200, height: 110,
          background: '#FAFAF8', border: '0.5px solid rgba(0,0,0,0.10)', borderRadius: 8,
          padding: '6px 8px 4px', zIndex: 10,
        }}>
          <div style={{ fontSize: 9, color: '#73726C', fontStyle: 'italic', marginBottom: 3 }}>
            {'Tail detail \— P99 zone (\×8 zoom)'}
          </div>
          <canvas ref={insetRef} style={{ width: '100%', height: 80 }} />
        </div>
      </div>

      <MetricCards metrics={metrics} />

      <div style={{ marginTop: 14, fontSize: 10, color: '#C0BFB9', fontStyle: 'italic', textAlign: 'right' }}>
        {'v5 Monte Carlo simulation. See Calibration.'}
      </div>
    </GraphCard>
  );
}
