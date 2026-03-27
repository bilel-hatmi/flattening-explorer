import React, { useState, useRef, useEffect, useCallback } from 'react';
import GraphCard from '../ui/GraphCard';
import { useProfile } from '../../context/ProfileContext';
import { getPairByKey } from '../../data/pair_data';

// ── Profile data (v5, beta_conform=0.30) ────────────────────────────────────
const PROFILE_DATA = {
  P1: { id: 'P1', name: 'Big Four',        city: 'Frankfurt',  color: '#D85A30', alpha: 0.70, beta: 3.5, epi: 0.50, hlo: 0.55, hhi: 0.85, EL: 572.9, P99t: 2124, tail: 2.97 },
  P2: { id: 'P2', name: 'Inv. bank',       city: 'London',     color: '#378ADD', alpha: 0.40, beta: 1.5, epi: 0.55, hlo: 0.65, hhi: 0.95, EL: 507.4, P99t: 1668, tail: 2.63 },
  P3: { id: 'P3', name: 'Strategy',        city: 'Paris',      color: '#B5403F', alpha: 0.90, beta: 4.0, epi: 0.55, hlo: 0.65, hhi: 0.95, EL: 480.8, P99t: 2041, tail: 3.40 },
  P4: { id: 'P4', name: 'Corp. legal',     city: 'Brussels',   color: '#534AB7', alpha: 0.90, beta: 3.0, epi: 0.45, hlo: 0.40, hhi: 0.80, EL: 597.2, P99t: 2254, tail: 3.02 },
  P5: { id: 'P5', name: 'Tech startup',    city: 'S.F.',       color: '#639922', alpha: 0.60, beta: 2.5, epi: 0.70, hlo: 0.50, hhi: 0.85, EL: 467.7, P99t: 2154, tail: 3.68 },
  P6: { id: 'P6', name: 'Creative agency', city: 'Singapore',  color: '#1D9E75', alpha: 0.30, beta: 1.5, epi: 0.85, hlo: 0.40, hhi: 0.80, EL: 440.3, P99t: 1845, tail: 3.35 },
  P7: { id: 'P7', name: 'Back-office',     city: 'Bangalore',  color: '#BA7517', alpha: 0.70, beta: 2.0, epi: 0.75, hlo: 0.30, hhi: 0.60, EL: 509.8, P99t: 2310, tail: 3.63 },
  P8: { id: 'P8', name: 'Central admin',   city: 'Seoul',      color: '#888780', alpha: 0.95, beta: 4.5, epi: 0.60, hlo: 0.40, hhi: 0.75, EL: 479.8, P99t: 2318, tail: 3.86 },
};

const PROFILE_IDS = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8'];

// ── Gaussian mixture model ──────────────────────────────────────────────────
function mixtureParams(p) {
  const w2 = Math.max(0.04, (1 - p.epi) * 0.20 * (1 + p.alpha));
  const w1 = 1 - w2;
  const mu1 = p.EL * (1 - w2 * 0.3);
  const s1 = 80 + p.alpha * 60;
  const mu2 = p.P99t * 0.92;
  const s2 = 100 + p.alpha * 80;
  return { w1, w2, mu1: Math.max(100, mu1), s1, mu2, s2 };
}

function density(x, mp) {
  const g = (mu, s) =>
    Math.exp(-0.5 * ((x - mu) / s) ** 2) / (s * Math.sqrt(2 * Math.PI));
  return mp.w1 * g(mp.mu1, mp.s1) + mp.w2 * g(mp.mu2, mp.s2);
}

// ── Dynamic title ────────────────────────────────────────────────────────────
function dynamicTitle(pL, pR) {
  const hOverlap = Math.min(pL.hhi, pR.hhi) - Math.max(pL.hlo, pR.hlo);
  const hRange = Math.min(pL.hhi - pL.hlo, pR.hhi - pR.hlo);
  const hPct = hRange > 0 ? hOverlap / hRange : 0;

  const p99diff = Math.abs(pL.P99t - pR.P99t);
  const pct = Math.round(p99diff / Math.min(pL.P99t, pR.P99t) * 100);

  let title;
  if (hPct >= 0.6) title = `Same talent tier, different tail risk — ${pct}% gap`;
  else if (pct <= 3) title = 'Converging risk, diverging causes';
  else title = 'Different structure, different tail risk';

  const sameEpi  = Math.abs(pL.epi - pR.epi) <= 0.05;
  const betaDiff = Math.abs(pL.beta - pR.beta) > 1.0;
  const alphaDiff = Math.abs(pL.alpha - pR.alpha) > 0.3;
  const subs = [];
  if (sameEpi)   subs.push('Same domain exposure');
  if (betaDiff)  subs.push('Labour market structure drives the gap');
  if (alphaDiff) subs.push('Stack architecture is the primary driver');
  const sub = subs.length
    ? subs.join(' · ') + '.'
    : 'Multiple structural factors diverge simultaneously.';

  return { title, sub };
}

// ── Badge ────────────────────────────────────────────────────────────────────
function getInterpretationBadge(pL, pR) {
  const diffAlpha = Math.abs(pL.alpha - pR.alpha) > 0.15;
  const diffBeta  = Math.abs(pL.beta  - pR.beta)  > 0.5;
  const diffEpi   = Math.abs(pL.epi   - pR.epi)   > 0.10;
  const diffs = [
    diffAlpha && 'stack (α)',
    diffBeta  && 'talent pipeline (β)',
    diffEpi   && 'domain exposure (E[π])',
  ].filter(Boolean);

  if (diffs.length === 0) return { label: 'Similar profiles',        color: 'green',  note: 'Small structural differences — gap reflects noise' };
  if (diffs.length === 1) return { label: 'Clean comparison',        color: 'green',  note: `Primary driver: ${diffs[0]}` };
  if (diffs.length === 2) return { label: 'Two structural drivers',  color: 'orange', note: `Drivers: ${diffs.join(' + ')}` };
  return               { label: 'Mixed — interpret with care',   color: 'orange', note: `All three drivers differ: ${diffs.join(', ')}` };
}

// ── Canvas constants ────────────────────────────────────────────────────────
const X_MIN = 0, X_MAX = 2800;
const CANVAS_H = 130;
const PAD = { l: 6, r: 6, t: 10, b: 22 };
const N_POINTS = 400;

function drawHistogram(canvas, profile) {
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.getBoundingClientRect().width || 320;
  canvas.width = W * dpr;
  canvas.height = CANVAS_H * dpr;
  canvas.style.width = W + 'px';
  canvas.style.height = CANVAS_H + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, CANVAS_H);

  const chartW = W - PAD.l - PAD.r;
  const chartH = CANVAS_H - PAD.t - PAD.b;
  const xp = (v) => PAD.l + ((v - X_MIN) / (X_MAX - X_MIN)) * chartW;
  const yp = (d, maxD) => PAD.t + chartH * (1 - (d / maxD) * 0.90);

  const mp = mixtureParams(profile);
  const xs = Array.from({ length: N_POINTS }, (_, i) => X_MIN + ((X_MAX - X_MIN) * i) / (N_POINTS - 1));
  const ys = xs.map((x) => density(x, mp));
  const maxY = Math.max(...ys);
  const p99px = xp(profile.P99t);

  // Safe fill (left of P99)
  ctx.beginPath();
  ctx.moveTo(xp(xs[0]), yp(0, maxY));
  xs.forEach((x, i) => { if (x <= profile.P99t) ctx.lineTo(xp(x), yp(ys[i], maxY)); });
  ctx.lineTo(p99px, yp(0, maxY));
  ctx.closePath();
  ctx.fillStyle = profile.color + '1E';
  ctx.fill();

  // Danger fill (right of P99)
  ctx.beginPath();
  ctx.moveTo(p99px, yp(0, maxY));
  xs.forEach((x, i) => { if (x >= profile.P99t) ctx.lineTo(xp(x), yp(ys[i], maxY)); });
  ctx.lineTo(xp(xs[N_POINTS - 1]), yp(0, maxY));
  ctx.closePath();
  ctx.fillStyle = 'rgba(181,64,63,0.13)';
  ctx.fill();

  // Curve
  ctx.beginPath();
  xs.forEach((x, i) => {
    const px = xp(x), py = yp(ys[i], maxY);
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  });
  ctx.strokeStyle = profile.color;
  ctx.lineWidth = 2;
  ctx.stroke();

  // P99 vertical dashed line
  ctx.beginPath();
  ctx.moveTo(p99px, PAD.t);
  ctx.lineTo(p99px, PAD.t + chartH);
  ctx.strokeStyle = 'rgba(181,64,63,0.65)';
  ctx.lineWidth = 1.2;
  ctx.setLineDash([4, 3]);
  ctx.stroke();
  ctx.setLineDash([]);

  // P99 label
  ctx.fillStyle = 'rgba(181,64,63,0.75)';
  ctx.font = "8px 'JetBrains Mono', monospace";
  ctx.textAlign = 'left';
  ctx.fillText('P99: ' + (profile.P99t / 1000).toFixed(2) + 'k', p99px + 3, PAD.t + 10);

  // X ticks
  [500, 1000, 1500, 2000, 2500].forEach((v) => {
    const x = xp(v);
    ctx.fillStyle = '#A0A09A';
    ctx.font = "8px 'JetBrains Mono', monospace";
    ctx.textAlign = 'center';
    ctx.fillText((v / 1000).toFixed(1) + 'k', x, PAD.t + chartH + 14);
    ctx.beginPath();
    ctx.moveTo(x, PAD.t + chartH);
    ctx.lineTo(x, PAD.t + chartH + 3);
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 1;
    ctx.stroke();
  });
}

// Format numbers with English locale (dot decimal, comma thousands)
function fmtNum(n, decimals = 0) {
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

// ── Styles ──────────────────────────────────────────────────────────────────
const S = {
  selectors:     { display: 'flex', gap: 16, alignItems: 'flex-end', marginBottom: 12, flexWrap: 'wrap' },
  selectorWrap:  { display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 180 },
  selectorLabel: { fontSize: 10, fontWeight: 600, color: '#73726C' },
  select: {
    padding: '8px 12px', borderRadius: 6, border: '0.5px solid rgba(0,0,0,0.18)',
    background: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, color: '#22375A',
    cursor: 'pointer', appearance: 'none',
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2373726C'/%3E%3C/svg%3E\")",
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', paddingRight: 28,
  },
  badgeRow:    { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, minHeight: 24 },
  badgeBase:   { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 4, fontSize: 9.5, fontWeight: 600, lineHeight: 1 },
  badgeGreen:  { background: 'rgba(74,124,89,0.12)',  color: '#4A7C59', border: '0.5px solid rgba(74,124,89,0.30)' },
  badgeOrange: { background: 'rgba(196,154,60,0.12)', color: '#8a6d22', border: '0.5px solid rgba(196,154,60,0.30)' },
  badgeGrey:   { background: 'rgba(160,160,154,0.12)',color: '#73726C', border: '0.5px solid rgba(160,160,154,0.30)' },
  badgeDrivers: { fontSize: 9.5, color: '#A0A09A' },
  dualWrap:    { display: 'grid', gridTemplateColumns: '1fr 72px 1fr', gap: 0, alignItems: 'center', marginBottom: 10 },
  histPanel:   { background: '#FAFAF8', borderRadius: 8, border: '0.5px solid rgba(0,0,0,0.07)', padding: '14px 14px 10px' },
  histName:    { fontSize: 11, fontWeight: 600, marginBottom: 1 },
  histSub:     { fontSize: 8.5, color: '#A0A09A', marginBottom: 10, lineHeight: 1.4 },
  canvas:      { display: 'block', width: '100%' },
  metrics:     { display: 'flex', gap: 6, marginTop: 10 },
  metric:      { flex: 1, padding: '6px 8px', background: '#fff', borderRadius: 5, border: '0.5px solid rgba(0,0,0,0.07)' },
  metricLbl:   { fontSize: 7.5, color: '#A0A09A', marginBottom: 2, lineHeight: 1.3 },
  metricVal:   { fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 500 },
  deltaCol:    { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '0 8px' },
  deltaArrow:  { fontSize: 22, lineHeight: 1 },
  deltaVal:    { fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700 },
  deltaLbl:    { fontSize: 8, color: '#73726C', textAlign: 'center', lineHeight: 1.4 },
  xLabel:      { textAlign: 'center', fontSize: 9.5, fontWeight: 600, color: '#22375A', marginBottom: 14 },
  whyBlock:    { background: 'rgba(34,55,90,0.04)', borderLeft: '2px solid rgba(34,55,90,0.20)', borderRadius: '0 6px 6px 0', padding: '10px 14px', fontSize: 10, color: '#22375A', lineHeight: 1.65, minHeight: 48 },
  titleText:   { fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 18, fontWeight: 400, color: '#22375A', marginBottom: 4, transition: 'opacity 0.25s' },
  subtitleText:{ fontSize: 11, color: '#73726C', lineHeight: 1.55, marginBottom: 20, maxWidth: 700, minHeight: 32, transition: 'opacity 0.25s' },
};

const BADGE_STYLES = { green: S.badgeGreen, orange: S.badgeOrange, grey: S.badgeGrey };

function MetricCard({ label, value, color }) {
  return (
    <div style={S.metric}>
      <div style={S.metricLbl}>{label}</div>
      <div style={{ ...S.metricVal, color }}>{value}</div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export default function C6_Comparator() {
  const { profileId } = useProfile();
  const [leftId,  setLeftId]  = useState('P3');
  const [rightId, setRightId] = useState('P2');
  const canvasLeftRef  = useRef(null);
  const canvasRightRef = useRef(null);

  // Connect ProfileContext — left panel tracks questionnaire profile
  useEffect(() => {
    if (profileId && profileId !== rightId) setLeftId(profileId);
  }, [profileId]);

  const pLeft  = PROFILE_DATA[leftId];
  const pRight = PROFILE_DATA[rightId];
  const sameProfile = leftId === rightId;

  // Delta: positive = right is riskier, negative = right is safer
  const deltaRaw  = !sameProfile ? (pRight.P99t - pLeft.P99t) / pLeft.P99t * 100 : 0;
  const deltaAbs  = Math.abs(deltaRaw);
  const deltaSign = deltaRaw > 0 ? '+' : '-';
  // Arrow points toward the SAFER panel
  const arrowDir  = deltaRaw > 0 ? '←' : '→';
  const arrowColor = deltaRaw > 0 ? '#B5403F' : '#4A7C59';
  const deltaLabel = deltaRaw > 0 ? 'P99×θ gap' : 'P99×θ reduction';

  // Pair text from pair_data.js (canonical key is sorted)
  const pair = !sameProfile ? getPairByKey(leftId, rightId) : null;

  // Dynamic title and badge
  const { title: dynTitle, sub: dynSub } = !sameProfile && pLeft && pRight
    ? dynamicTitle(pLeft, pRight)
    : { title: 'Profile Comparator', sub: 'Select two profiles to compare their loss distributions on a shared axis.' };

  const badge = !sameProfile && pLeft && pRight ? getInterpretationBadge(pLeft, pRight) : null;

  // Draw canvases — left always draws leftId, right always draws rightId
  const redraw = useCallback(() => {
    if (sameProfile) return;
    if (canvasLeftRef.current  && pLeft)  drawHistogram(canvasLeftRef.current,  pLeft);
    if (canvasRightRef.current && pRight) drawHistogram(canvasRightRef.current, pRight);
  }, [pLeft, pRight, sameProfile]);

  useEffect(() => {
    const id = requestAnimationFrame(redraw);
    return () => cancelAnimationFrame(id);
  }, [redraw]);

  useEffect(() => {
    const onResize = () => requestAnimationFrame(redraw);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [redraw]);

  return (
    <GraphCard
      id="C6"
      footnote={'KDE from v5 Monte Carlo simulation, G0 scenario. See Calibration.'}
    >
      <div style={S.titleText}>{dynTitle}</div>
      <div style={S.subtitleText}>{dynSub}</div>

      {/* Selectors */}
      <div style={S.selectors}>
        {[['Left profile', leftId, setLeftId], ['Right profile', rightId, setRightId]].map(([lbl, val, setter]) => (
          <div key={lbl} style={S.selectorWrap}>
            <div style={S.selectorLabel}>{lbl}</div>
            <select style={S.select} value={val} onChange={(e) => setter(e.target.value)}>
              {PROFILE_IDS.map((pid) => {
                const p = PROFILE_DATA[pid];
                return <option key={pid} value={pid}>{pid} — {p.name}, {p.city}</option>;
              })}
            </select>
          </div>
        ))}
      </div>

      {sameProfile ? (
        <div style={S.whyBlock}><em>Select two different profiles to see the structural analysis.</em></div>
      ) : (
        <>
          {/* Badge */}
          {badge && (
            <div style={S.badgeRow}>
              <div style={{ ...S.badgeBase, ...(BADGE_STYLES[badge.color] || S.badgeGrey) }}>
                {badge.label}
              </div>
              {badge.note && <div style={S.badgeDrivers}>{badge.note}</div>}
            </div>
          )}

          {/* Dual histogram grid — left panel = leftId, right panel = rightId (no auto-swap) */}
          <div style={S.dualWrap}>
            {/* Left panel */}
            <div style={S.histPanel}>
              <div style={{ ...S.histName, color: pLeft.color }}>{pLeft.name} — {pLeft.city}</div>
              <div style={S.histSub}>{`α=${pLeft.alpha} · Beta(${pLeft.beta},${pLeft.beta}) · E[π]=${pLeft.epi}`}</div>
              <canvas ref={canvasLeftRef} style={S.canvas} height={CANVAS_H} />
              <div style={S.metrics}>
                <MetricCard label="E[L] — mean" value={fmtNum(pLeft.EL, 1)} color={pLeft.color} />
                <MetricCard label="P99×θ"       value={fmtNum(pLeft.P99t)} color="#B5403F" />
                <MetricCard label="Tail ratio"  value={pLeft.tail.toFixed(2)} color="#22375A" />
              </div>
            </div>

            {/* Delta column — arrow toward safer panel */}
            <div style={S.deltaCol}>
              <div style={{ ...S.deltaArrow, color: arrowColor }}>{arrowDir}</div>
              <div style={{ ...S.deltaVal, color: arrowColor }}>
                {deltaSign}{deltaAbs.toFixed(1)}%
              </div>
              <div style={S.deltaLbl}>{deltaLabel}</div>
            </div>

            {/* Right panel */}
            <div style={S.histPanel}>
              <div style={{ ...S.histName, color: pRight.color }}>{pRight.name} — {pRight.city}</div>
              <div style={S.histSub}>{`α=${pRight.alpha} · Beta(${pRight.beta},${pRight.beta}) · E[π]=${pRight.epi}`}</div>
              <canvas ref={canvasRightRef} style={S.canvas} height={CANVAS_H} />
              <div style={S.metrics}>
                <MetricCard label="E[L] — mean" value={fmtNum(pRight.EL, 1)} color={pRight.color} />
                <MetricCard label="P99×θ"       value={fmtNum(pRight.P99t)} color="#B5403F" />
                <MetricCard label="Tail ratio"  value={pRight.tail.toFixed(2)} color="#22375A" />
              </div>
            </div>
          </div>

          <div style={S.xLabel}>← Quarterly loss (total errors) · same axis scale for both panels →</div>

          <div
            style={S.whyBlock}
            dangerouslySetInnerHTML={{
              __html: pair?.insight ?? '<em>No structural analysis available for this pair.</em>',
            }}
          />
        </>
      )}
    </GraphCard>
  );
}
