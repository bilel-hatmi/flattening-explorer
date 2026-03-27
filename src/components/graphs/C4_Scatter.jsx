import React, { useState, useRef, useCallback, useMemo } from 'react';
import GraphCard from '../ui/GraphCard';
import GraphSkeleton from '../ui/GraphSkeleton';
import { useProfile } from '../../context/ProfileContext';
import { useCSV } from '../../hooks/useCSV';

/* -- All 8 profiles ------------------------------------------------------- */
const PROFILES = [
  { id: 'P1', num: '1', label: 'Big Four, Frankfurt',    city: 'Frankfurt',  color: '#D85A30' },
  { id: 'P2', num: '2', label: 'Inv. bank, London',      city: 'London',     color: '#378ADD' },
  { id: 'P3', num: '3', label: 'Strategy, Paris',        city: 'Paris',      color: '#B5403F' },
  { id: 'P4', num: '4', label: 'Corp. legal, Brussels',  city: 'Brussels',   color: '#534AB7' },
  { id: 'P5', num: '5', label: 'Tech startup, S.F.',     city: 'S.F.',       color: '#639922' },
  { id: 'P6', num: '6', label: 'Creative, Singapore',    city: 'Singapore',  color: '#1D9E75' },
  { id: 'P7', num: '7', label: 'Back-office, Bangalore', city: 'Bangalore',  color: '#BA7517' },
  { id: 'P8', num: '8', label: 'Central admin, Seoul',   city: 'Seoul',      color: '#888780' },
];

/* -- Label offsets from actual dot (tweak if overlap detected) ------------ */
const LPOS = {
  P1: { dx: 14,  dy: -14 },
  P2: { dx: 14,  dy: -14 },
  P3: { dx: -8,  dy: -16 },
  P4: { dx: 14,  dy: 6   },
  P5: { dx: 14,  dy: 14  },
  P6: { dx: -88, dy: -14 },
  P7: { dx: 14,  dy: 6   },
  P8: { dx: 14,  dy: -14 },
};

/* -- Tooltip notes (v5 values) ------------------------------------------- */
const NOTES = {
  P1: {
    G1: 'Passive guardrails: 2,124 → 1,858 (−12%). Professional services culture limits passive governance adoption.',
    G2: 'Active governance: −31% vs G0. Scaffold counterproductive (−3%). Stack diversification is the primary lever.',
  },
  P2: {
    G1: 'Passive guardrails: tail risk 1,668 → 1,331 (−20%). Structural advantage already present.',
    G2: 'Active governance: −38% vs G0. Global recruitment + diversified stack.',
  },
  P3: {
    G1: 'Passive guardrails: −19% vs G0. Elite national pipeline limits the gain.',
    G2: 'Active governance: −36% vs G0. Still 22% above London — structural, not failure.',
  },
  P4: {
    G1: 'Passive guardrails: 2,254 → 2,009 (−11%). Legal compliance culture resists light-touch guardrails.',
    G2: 'Active governance: −29% vs G0. Scaffold counterproductive (−8%). Highest absolute tail risk.',
  },
  P5: {
    G1: 'Passive guardrails: −21% tail risk. Output drops less than G2.',
    G2: 'Scaffold counterproductive: velocity cost > risk gain. Benefit = −36% (efficiency ratio). Grounds Nash argument.',
  },
  P6: {
    G1: 'Passive guardrails: minimal gain. Singapore already has the best structural profile.',
    G2: 'Active governance: excess tail risk near zero. Safest profile. Scaffold benefit +40% (efficiency ratio).',
  },
  P7: {
    G1: 'Passive guardrails nearly ineffective. Low-skill profile needs active intervention.',
    G2: 'Active governance: −24% vs G0. Scaffold benefit −26% (efficiency ratio) — governance counterproductive.',
  },
  P8: {
    G1: 'Passive guardrails almost no effect. National exam pipeline resists governance.',
    G2: 'Active governance: −20% vs G0. Still highest risk. Scaffold benefit −6%. No market signal — invisible.',
  },
};

/* -- SVG layout constants ------------------------------------------------ */
const SVG_W = 700, SVG_H = 240;
const PAD = { l: 58, r: 22, t: 18, b: 54 };
const CW = SVG_W - PAD.l - PAD.r;
const CH = SVG_H - PAD.t - PAD.b;

// perceived.y = G0.output_mean / PERCEIVED_RATIO
// 0.824 = ratio Exhibit 1: perceived_mean / actual_mean = 411 / 499
// Manager sees AI productivity but excludes crisis quarters
const PERCEIVED_RATIO = 0.824;

function rgba(hex, a) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function fmtK(v) { return (v / 1000).toFixed(1) + 'k'; }

function niceRange(min, max, padding) {
  const span = max - min;
  const pad = span * padding;
  const lo = min - pad;
  const hi = max + pad;
  return { lo: Math.floor(lo / 100) * 100, hi: Math.ceil(hi / 100) * 100 };
}

function makeTicks(lo, hi, step) {
  const ticks = [];
  const start = Math.ceil(lo / step) * step;
  for (let v = start; v <= hi; v += step) ticks.push(v);
  return ticks;
}

const SCENARIO_NOTES = {
  G1: 'Short arrows show passive guardrails capture 30\u201350% of the tail reduction achievable under active governance.',
  G2: 'Active governance moves profiles significantly — especially Singapore (P6) and London (P2).',
};

const GOVERNED_LABELS = {
  G1: 'With passive guardrails (G1)',
  G2: 'With active governance (G2)',
};

/* -- Styles -------------------------------------------------------------- */
const styles = {
  controls: {
    display: 'flex',
    gap: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  toggleBtn: {
    padding: '7px 18px',
    borderRadius: 6,
    border: '0.5px solid rgba(0,0,0,0.14)',
    background: 'transparent',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 12,
    fontWeight: 500,
    color: '#73726C',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  toggleBtnActive: {
    background: '#22375A',
    color: '#fff',
    borderColor: '#22375A',
  },
  profileFilter: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 5,
    marginBottom: 10,
  },
  profileBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: '4px 10px',
    borderRadius: 5,
    border: '0.5px solid',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 10,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
    background: 'transparent',
  },
  scNote: {
    fontSize: 10,
    color: '#A0A09A',
    fontStyle: 'italic',
    minHeight: 16,
    marginBottom: 14,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  legendRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 10,
  },
  legItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    fontSize: 10,
    color: '#73726C',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  chartWrap: { width: '100%', marginBottom: 14 },
  svg: { display: 'block', width: '100%', overflow: 'visible' },
  disclaimer: {
    marginTop: 8,
    fontSize: 10,
    color: '#C0BFB9',
    fontStyle: 'italic',
    textAlign: 'right',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  tooltip: {
    position: 'fixed',
    background: '#fff',
    border: '0.5px solid rgba(0,0,0,0.12)',
    borderRadius: 8,
    padding: '10px 13px',
    fontSize: 10,
    pointerEvents: 'none',
    zIndex: 100,
    maxWidth: 240,
    lineHeight: 1.5,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  ttName:  { fontWeight: 600, fontSize: 11, marginBottom: 5 },
  ttRow:   { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#73726C' },
  ttNote:  { fontSize: 9, color: '#A0A09A', marginTop: 5, borderTop: '0.5px solid rgba(0,0,0,0.07)', paddingTop: 5, fontStyle: 'italic' },
};

/* -- Component ----------------------------------------------------------- */
export default function C4_Scatter() {
  const { profileId } = useProfile();
  const [scenario, setScenario] = useState('G1');
  const [tooltip, setTooltip] = useState(null);
  const [visibleProfiles, setVisibleProfiles] = useState(
    new Set(['P2', 'P4', 'P6'])
  );
  const svgRef = useRef(null);

  const { data: csvData, loading } = useCSV('scatter_profiles_b030.csv');

  /* Build DATA object from CSV — all 8 profiles */
  const DATA = useMemo(() => {
    if (!csvData) return null;
    const result = {};
    PROFILES.forEach(({ id: pid }) => {
      const rows = csvData.filter(r => r.profile_id === pid);
      const baseline = rows.find(r => r.scenario === 'baseline');
      const g0 = rows.find(r => r.scenario === 'G0');
      const g1 = rows.find(r => r.scenario === 'G1');
      const g2 = rows.find(r => r.scenario === 'G2');
      if (baseline && g0 && g1 && g2) {
        result[pid] = {
          // perceived: x = baseline risk (dashboard shows no-AI level),
          //            y = G0 output / 0.824 (manager sees AI productivity but excludes crises)
          perceived: { x: +baseline.p99_theta, y: +g0.output_mean / PERCEIVED_RATIO },
          actual:    { x: +g0.p99_theta,       y: +g0.output_mean },
          G1:        { x: +g1.p99_theta,       y: +g1.output_mean },
          G2:        { x: +g2.p99_theta,       y: +g2.output_mean },
        };
      }
    });
    return result;
  }, [csvData]);

  /* Compute dynamic axis ranges from data */
  const { xMin, xMax, yMin, yMax, xGrid, yGrid, yTicks } = useMemo(() => {
    if (!DATA) return { xMin: 0, xMax: 1, yMin: 0, yMax: 1, xGrid: [], yGrid: [], yTicks: [] };

    let allX = [], allY = [];
    Object.values(DATA).forEach(d => {
      ['perceived', 'actual', 'G1', 'G2'].forEach(key => {
        allX.push(d[key].x);
        allY.push(d[key].y);
      });
    });

    const rawXMin = Math.min(...allX);
    const rawXMax = Math.max(...allX);
    const rawYMin = Math.min(...allY);
    const rawYMax = Math.max(...allY);

    const xRange = niceRange(rawXMin, rawXMax, 0.08);
    const yRange = niceRange(rawYMin, rawYMax, 0.08);

    return {
      xMin: xRange.lo, xMax: xRange.hi,
      yMin: yRange.lo, yMax: yRange.hi,
      xGrid: makeTicks(xRange.lo, xRange.hi, 200),
      yGrid: makeTicks(yRange.lo, yRange.hi, 200),
      yTicks: makeTicks(yRange.lo, yRange.hi, 300),
    };
  }, [DATA]);

  const xPx = useCallback((v) => PAD.l + (v - xMin) / (xMax - xMin) * CW, [xMin, xMax]);
  const yPx = useCallback((v) => PAD.t + CH * (1 - (v - yMin) / (yMax - yMin)), [yMin, yMax]);

  /* Tooltip handlers */
  const showTooltip = useCallback((e, profile, dotType) => {
    if (!DATA) return;
    const d = DATA[profile.id];
    if (!d) return;
    const hiddenPct = Math.round((d.actual.x - d.perceived.x) / d.perceived.x * 100);
    const govGain   = Math.round((d.actual.x - d[scenario].x) / d.actual.x * 100);
    const scLabel   = scenario === 'G1' ? 'G1 guardrails' : 'G2 governance';
    setTooltip({
      x: e.clientX, y: e.clientY,
      profile, perceived: d.perceived.x, actual: d.actual.x,
      governed: d[scenario].x, hiddenPct, govGain, scLabel,
      note: NOTES[profile.id]?.[scenario] ?? '',
    });
  }, [scenario, DATA]);

  const moveTooltip = useCallback((e) => {
    setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
  }, []);

  const hideTooltip = useCallback(() => setTooltip(null), []);

  /* Toggle profile visibility */
  const toggleProfile = useCallback((pid) => {
    setVisibleProfiles(prev => {
      const next = new Set(prev);
      if (next.has(pid)) next.delete(pid);
      else next.add(pid);
      return next;
    });
  }, []);

  if (loading || !DATA) return <GraphSkeleton id="c4-scatter" height={460} />;

  const ttLeft = tooltip
    ? (tooltip.x + 250 > (typeof window !== 'undefined' ? window.innerWidth : 1200) ? tooltip.x - 254 : tooltip.x + 14)
    : 0;
  const ttTop = tooltip ? tooltip.y - 10 : 0;

  /* P2/P3 bracket annotation — dynamic gap */
  const p2data = DATA.P2, p3data = DATA.P3;
  const p2ax = p2data ? xPx(p2data.actual.x) : 0;
  const p3ax = p3data ? xPx(p3data.actual.x) : 0;
  const p2ay = p2data ? yPx(p2data.actual.y) : 0;
  const p3ay = p3data ? yPx(p3data.actual.y) : 0;
  const annY = Math.max(p2ay, p3ay) + 18;
  const parisLondonGap = (p2data && p3data)
    ? Math.round((p3data.actual.x - p2data.actual.x) / p2data.actual.x * 100)
    : 22;

  return (
    <GraphCard
      id="c4-scatter"
      title={'What dashboards hide \u2014 actual vs perceived tail risk'}
      subtitle="Open circles mark what dashboards report; filled circles show actual exposure under unmanaged AI. The systematic gap between them is invisible to management. Arrows trace where governance moves each profile."
      footnote={'P99\u00d7\u03b8 = worst-case loss \u00d7 throughput multiplier. Output = productivity. 8 profiles, v5 Monte Carlo simulation. Open circles show what dashboards report, performance measured on normal quarters only, risk measured against the pre-AI baseline; both overstate performance and understate risk.'}
    >
      {/* G1 / G2 Toggle */}
      <div style={styles.controls}>
        {['G1', 'G2'].map(sc => (
          <button
            key={sc}
            style={{ ...styles.toggleBtn, ...(scenario === sc ? styles.toggleBtnActive : {}) }}
            onClick={() => setScenario(sc)}
          >
            {sc === 'G1' ? 'Passive guardrails (G1)' : 'Active governance (G2)'}
          </button>
        ))}
      </div>

      {/* Profile filter buttons */}
      <div style={styles.profileFilter}>
        {PROFILES.map(p => {
          const active = visibleProfiles.has(p.id);
          return (
            <button
              key={p.id}
              style={{
                ...styles.profileBtn,
                borderColor: active ? p.color : 'rgba(0,0,0,0.10)',
                background: active ? rgba(p.color, 0.10) : 'transparent',
                color: active ? p.color : '#A0A09A',
              }}
              onClick={() => toggleProfile(p.id)}
            >
              <span style={{
                display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
                background: active ? p.color : '#C0BFB9',
              }} />
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Scenario note */}
      <div style={styles.scNote}>{SCENARIO_NOTES[scenario]}</div>

      {/* Legend */}
      <div style={styles.legendRow}>
        <div style={styles.legItem}>
          <svg width="18" height="18" viewBox="0 0 18 18">
            <circle cx="9" cy="9" r="7" fill="none" stroke="#888" strokeWidth="2" />
          </svg>
          {'Perceived position \u2014 normal quarters only, pre-AI risk baseline'}
        </div>
        <div style={styles.legItem}>
          <svg width="18" height="18" viewBox="0 0 18 18">
            <circle cx="9" cy="9" r="7" fill="#555" stroke="white" strokeWidth="1.5" />
          </svg>
          Actual risk — unmanaged AI (G0)
        </div>
        <div style={styles.legItem}>
          <svg width="18" height="18" viewBox="0 0 18 18">
            <circle cx="9" cy="9" r="6" fill="rgba(100,100,100,0.40)" stroke="white" strokeWidth="1.5" />
          </svg>
          {GOVERNED_LABELS[scenario]}
        </div>
        <div style={styles.legItem}>
          <svg width="34" height="12" viewBox="0 0 34 12">
            <line x1="2" y1="6" x2="32" y2="6" stroke="#888" strokeWidth="1.5" strokeDasharray="4 3" />
          </svg>
          Hidden risk (perceived → actual)
        </div>
        <div style={styles.legItem}>
          <svg width="34" height="12" viewBox="0 0 34 12">
            <defs>
              <marker id="legend-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="rgba(100,100,100,0.60)" />
              </marker>
            </defs>
            <line x1="2" y1="6" x2="26" y2="6" stroke="rgba(100,100,100,0.55)" strokeWidth="1.5" markerEnd="url(#legend-arrow)" />
          </svg>
          Governance effect
        </div>
      </div>

      {/* SVG Chart */}
      <div style={styles.chartWrap}>
        <svg ref={svgRef} viewBox={`0 0 ${SVG_W} ${SVG_H}`} xmlns="http://www.w3.org/2000/svg" style={styles.svg}>
          <defs>
            {PROFILES.map(p => (
              <marker key={`arr-${p.id}`} id={`arr-${p.id}`}
                markerWidth="7" markerHeight="7" refX="5.5" refY="3.5" orient="auto">
                <path d="M0,0 L0,7 L7,3.5 z" fill={rgba(p.color, 0.65)} />
              </marker>
            ))}
          </defs>

          {/* Gridlines */}
          {xGrid.map(v => (
            <line key={`xg-${v}`} x1={xPx(v)} y1={PAD.t} x2={xPx(v)} y2={PAD.t + CH}
              stroke="rgba(0,0,0,0.05)" strokeWidth="1" strokeDasharray="2 4" />
          ))}
          {yGrid.map(v => (
            <line key={`yg-${v}`} x1={PAD.l} y1={yPx(v)} x2={PAD.l + CW} y2={yPx(v)}
              stroke="rgba(0,0,0,0.05)" strokeWidth="1" strokeDasharray="2 4" />
          ))}

          {/* Axis tick labels */}
          {xGrid.map(v => (
            <text key={`xt-${v}`} x={xPx(v)} y={PAD.t + CH + 14} textAnchor="middle"
              fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="#A0A09A">
              {fmtK(v)}
            </text>
          ))}
          {yTicks.map(v => (
            <text key={`yt-${v}`} x={PAD.l - 6} y={yPx(v) + 4} textAnchor="end"
              fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="#A0A09A">
              {fmtK(v)}
            </text>
          ))}

          {/* Axis titles */}
          <text x={PAD.l + CW / 2} y={PAD.t + CH + 34} textAnchor="middle"
            fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="10.5" fontWeight="600" fill="#22375A">
            Risk-adjusted worst-case loss (P99×θ)
          </text>
          <text x={PAD.l + CW / 2} y={PAD.t + CH + 50} textAnchor="middle"
            fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="8" fill="#A0A09A">
            {'← lower risk                                                        higher risk →'}
          </text>
          <text transform={`translate(13,${PAD.t + CH / 2}) rotate(-90)`} textAnchor="middle"
            fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="10.5" fontWeight="600" fill="#22375A">
            Productivity output
          </text>
          <text transform={`translate(4,${PAD.t + CH / 2 + 14}) rotate(-90)`} textAnchor="middle"
            fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="8" fill="#A0A09A">
            {'higher is better ↑'}
          </text>

          {/* Per-profile layers */}
          {PROFILES.map(p => {
            const d = DATA[p.id];
            if (!d) return null;
            const visible = visibleProfiles.has(p.id);
            const isHighlighted = !profileId || p.id === profileId;
            const groupOpacity = visible ? (isHighlighted ? 1.0 : 0.55) : 0;
            if (!visible) return null;

            const px = xPx(d.perceived.x), py = yPx(d.perceived.y);
            const ax = xPx(d.actual.x),    ay = yPx(d.actual.y);
            const gx = xPx(d[scenario].x), gy = yPx(d[scenario].y);
            const off = LPOS[p.id] || { dx: 14, dy: -14 };

            return (
              <g key={p.id} opacity={groupOpacity}>
                {/* Dashed line: perceived → actual (G0) */}
                <line x1={px} y1={py} x2={ax} y2={ay}
                  stroke={rgba(p.color, 0.38)} strokeWidth="1.3" strokeDasharray="5 3" />

                {/* Arrow: actual (G0) → governed (G1 or G2) */}
                <line x1={ax} y1={ay} x2={gx} y2={gy}
                  stroke={rgba(p.color, 0.55)} strokeWidth="1.6"
                  markerEnd={`url(#arr-${p.id})`} />

                {/* Governed dot (behind) */}
                <circle cx={gx} cy={gy} r="6.5"
                  fill={rgba(p.color, 0.35)} stroke="#fff" strokeWidth="1.5" />

                {/* Actual dot (G0) */}
                <circle cx={ax} cy={ay} r={isHighlighted && profileId ? 14 : 10}
                  fill={rgba(p.color, 0.88)} stroke="#fff" strokeWidth="2"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => showTooltip(e, p, 'actual')}
                  onMouseMove={moveTooltip}
                  onMouseLeave={hideTooltip} />
                <text x={ax} y={ay + 4} textAnchor="middle"
                  fontFamily="'JetBrains Mono', monospace" fontSize="8" fontWeight="700" fill="#fff"
                  style={{ pointerEvents: 'none' }}>
                  {p.num}
                </text>

                {/* Perceived dot (open circle, front) */}
                <circle cx={px} cy={py} r="8.5"
                  fill="#fff" stroke={rgba(p.color, 0.80)} strokeWidth="2"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => showTooltip(e, p, 'perceived')}
                  onMouseMove={moveTooltip}
                  onMouseLeave={hideTooltip} />

              </g>
            );
          })}

          {/* P2 vs P3 bracket annotation */}
          {p2data && p3data && visibleProfiles.has('P2') && visibleProfiles.has('P3') && (
            <>
              <line x1={p2ax} y1={annY} x2={p3ax} y2={annY}
                stroke="rgba(34,55,90,0.22)" strokeWidth="1" />
              <line x1={p2ax} y1={annY - 3} x2={p2ax} y2={annY + 3}
                stroke="rgba(34,55,90,0.22)" strokeWidth="1" />
              <line x1={p3ax} y1={annY - 3} x2={p3ax} y2={annY + 3}
                stroke="rgba(34,55,90,0.22)" strokeWidth="1" />
              <text x={(p2ax + p3ax) / 2} y={annY + 12} textAnchor="middle"
                fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="9" fontWeight="600"
                fill="rgba(34,55,90,0.60)">
                {`Same sector, same talent. Paris +${parisLondonGap}% worst-case loss vs London.`}
              </text>
            </>
          )}
        </svg>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div style={{ ...styles.tooltip, left: ttLeft, top: ttTop }}>
          <div style={{ ...styles.ttName, color: tooltip.profile.color }}>
            {tooltip.profile.label}
          </div>
          <div style={{ ...styles.ttRow, color: rgba(tooltip.profile.color, 0.70) }}>
            {'Perceived: P99×θ '}{tooltip.perceived.toLocaleString()}
          </div>
          <div style={{ ...styles.ttRow, color: tooltip.profile.color, fontWeight: 600 }}>
            Actual (G0): {tooltip.actual.toLocaleString()} (+{tooltip.hiddenPct}% hidden)
          </div>
          <div style={{ ...styles.ttRow, color: 'rgba(80,80,80,0.80)' }}>
            With {tooltip.scLabel}: {tooltip.governed.toLocaleString()} (-{tooltip.govGain}% vs G0)
          </div>
          <div style={styles.ttNote}>{tooltip.note}</div>
        </div>
      )}
    </GraphCard>
  );
}
