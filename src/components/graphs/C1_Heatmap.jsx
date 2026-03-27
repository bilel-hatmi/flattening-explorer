import React, { useState, useRef, useCallback, useMemo } from 'react';
import GraphCard from '../ui/GraphCard';
import GraphSkeleton from '../ui/GraphSkeleton';
import { useCSV } from '../../hooks/useCSV';

/* ── DATA ──────────────────────────────────────────────────────────────────── */

const ALPHA_ROWS = [
  { val: 0.90, label: 'α = 0.90', sub: 'Single provider' },
  { val: 0.70, label: 'α = 0.70', sub: 'Concentrated' },
  { val: 0.45, label: 'α = 0.45', sub: 'Mixed' },
  { val: 0.30, label: 'α = 0.30', sub: 'Diversified' },
];

const PI_COLS = [
  { val: 0.85, label: 'E[π] = 0.85', sub: 'Operations' },
  { val: 0.70, label: 'E[π] = 0.70', sub: 'Mixed work' },
  { val: 0.55, label: 'E[π] = 0.55', sub: 'Consulting / Legal' },
  { val: 0.45, label: 'E[π] = 0.45', sub: 'Strategy / M&A' },
];

/* ── CSV → GRID BUILDER ───────────────────────────────────────────────────── */

// Find the closest value in an array of numbers
function findClosest(arr, target) {
  let best = arr[0];
  let bestDist = Math.abs(arr[0] - target);
  for (let i = 1; i < arr.length; i++) {
    const d = Math.abs(arr[i] - target);
    if (d < bestDist) { best = arr[i]; bestDist = d; }
  }
  return best;
}

const BASELINE_OUTPUT = 1198.27; // output_mean under baseline scenario

// Returns { risk: 4×4 grid of premium_pct%, output: 4×4 grid of output_gain% }
function buildGrids(csvRows, scenario) {
  const filtered = csvRows.filter(r => r.scenario === scenario);
  if (filtered.length === 0) return { risk: null, output: null };

  const alphaSet = [...new Set(filtered.map(r => +r.alpha))].sort((a, b) => a - b);
  const epiSet   = [...new Set(filtered.map(r => +r.epi_mean))].sort((a, b) => a - b);
  const alphaMap = ALPHA_ROWS.map(r => findClosest(alphaSet, r.val));
  const epiMap   = PI_COLS.map(c => findClosest(epiSet, c.val));

  const lookupRisk   = {};
  const lookupOutput = {};
  filtered.forEach(r => {
    const key = `${r.alpha}|${r.epi_mean}`;
    lookupRisk[key]   = +r.premium_pct;
    lookupOutput[key] = +r.output_mean;
  });

  // risk = raw premium_pct rounded (e.g. 95 means +95% above no-AI baseline)
  const risk = alphaMap.map(alpha =>
    epiMap.map(epi => {
      const raw = lookupRisk[`${alpha}|${epi}`];
      return raw != null ? Math.round(raw) : null;
    })
  );

  const output = alphaMap.map(alpha =>
    epiMap.map(epi => {
      const raw = lookupOutput[`${alpha}|${epi}`];
      return raw != null ? Math.round((raw - BASELINE_OUTPUT) / BASELINE_OUTPUT * 100) : null;
    })
  );

  return { risk, output };
}

const PROFILES = [
  { id: 'P3', label: 'P3 — Strategy, Paris', color: '#B5403F', row: 0, col: 2 },
  { id: 'P8', label: 'P8 — Central admin, nat. exam', color: '#888780', row: 0, col: 1 },
  { id: 'P2', label: 'P2 — Inv. bank, London', color: '#378ADD', row: 2, col: 2 },
  { id: 'P6', label: 'P6 — Creative agency, Singapore', color: '#1D9E75', row: 3, col: 0 },
];

// Build profile lookup by cell key "row-col"
const PROFILE_MAP = {};
PROFILES.forEach(p => {
  const key = `${p.row}-${p.col}`;
  if (!PROFILE_MAP[key]) PROFILE_MAP[key] = [];
  PROFILE_MAP[key].push(p);
});

/* ── HELPERS ───────────────────────────────────────────────────────────────── */

// riskVal = premium_pct rounded (e.g. 95 = +95% above no-AI P99)
function getCellColors(riskVal) {
  if (riskVal > 75) return {
    bg: 'rgba(181,64,63,0.15)',
    text: '#B5403F',
    tag: 'high tail risk',
  };
  if (riskVal > 35) return {
    bg: 'rgba(196,154,60,0.13)',
    text: '#8a6d22',
    tag: 'moderate risk',
  };
  return {
    bg: 'rgba(74,124,89,0.12)',
    text: '#4A7C59',
    tag: 'risk managed',
  };
}

/* ── STYLES ────────────────────────────────────────────────────────────────── */

const S = {
  controls: {
    display: 'flex',
    gap: 6,
    marginBottom: 24,
  },
  toggleBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    padding: '6px 16px',
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
  colorLegend: {
    display: 'flex',
    gap: 16,
    alignItems: 'center',
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  clItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 10,
    color: '#73726C',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  heatmapOuter: {
    display: 'flex',
    gap: 0,
    marginBottom: 20,
  },
  yAxisWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    gap: 4,
    flexShrink: 0,
  },
  yAxisLabel: {
    fontSize: 10,
    fontWeight: 600,
    color: '#22375A',
    writingMode: 'vertical-rl',
    transform: 'rotate(180deg)',
    textAlign: 'center',
    lineHeight: 1.3,
    whiteSpace: 'nowrap',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  yAxisDanger: {
    fontSize: 8,
    color: '#B5403F',
    writingMode: 'vertical-rl',
    transform: 'rotate(180deg)',
    whiteSpace: 'nowrap',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  gridXWrap: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  gridArea: {
    display: 'flex',
    flexDirection: 'row',
    gap: 0,
    flex: 1,
  },
  rowLabelCol: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    width: 60,
    flexShrink: 0,
    paddingRight: 8,
  },
  rowLabel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  rowLabelMain: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    fontWeight: 500,
    color: '#22375A',
    lineHeight: 1,
  },
  rowLabelSub: {
    fontSize: 8,
    color: '#A0A09A',
    lineHeight: 1.2,
    textAlign: 'right',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  heatmapGrid: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gridTemplateRows: 'repeat(4, 1fr)',
    gap: 3,
    aspectRatio: '2.8 / 1',
  },
  cell: {
    borderRadius: 5,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    cursor: 'default',
    transition: 'background-color 0.4s ease',
    minHeight: 36,
  },
  cellValue: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 13,
    fontWeight: 500,
    lineHeight: 1,
    transition: 'color 0.4s ease',
  },
  cellSublabel: {
    fontSize: 8,
    marginTop: 2,
    lineHeight: 1,
    transition: 'color 0.4s ease',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  profileDot: {
    position: 'absolute',
    right: 5,
    width: 8,
    height: 8,
    borderRadius: '50%',
    border: '1.5px solid #fff',
  },
  profileLabel: {
    position: 'absolute',
    bottom: 4,
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: 7.5,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    background: 'rgba(255,255,255,0.85)',
    padding: '1px 3px',
    borderRadius: 2,
    lineHeight: 1.2,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  xAxisRow: {
    display: 'flex',
    marginTop: 6,
    marginLeft: 60,
  },
  xLabel: {
    flex: 1,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1,
  },
  xLabelMain: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    fontWeight: 500,
    color: '#22375A',
  },
  xLabelSub: {
    fontSize: 8,
    color: '#A0A09A',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  xAxisTitle: {
    display: 'flex',
    marginLeft: 60,
    justifyContent: 'center',
    marginTop: 8,
    gap: 8,
    alignItems: 'center',
  },
  xAxisTitleText: {
    fontSize: 10,
    fontWeight: 600,
    color: '#22375A',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  xAxisDanger: {
    fontSize: 8,
    color: '#B5403F',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  profileLegend: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 6,
  },
  plItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 9,
    color: '#73726C',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  plDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
    border: '1.5px solid #fff',
    boxShadow: '0 0 0 1px rgba(0,0,0,0.15)',
  },
  tooltip: {
    position: 'fixed',
    background: '#fff',
    border: '0.5px solid rgba(0,0,0,0.12)',
    borderRadius: 7,
    padding: '10px 12px',
    fontSize: 10,
    color: '#1A1A1A',
    pointerEvents: 'none',
    zIndex: 100,
    maxWidth: 200,
    lineHeight: 1.6,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
};

/* ── CELL COMPONENT ────────────────────────────────────────────────────────── */

function HeatmapCell({ riskVal, outputVal, row, col, onMouseEnter, onMouseLeave }) {
  const colors = getCellColors(riskVal);
  const profilesHere = PROFILE_MAP[`${row}-${col}`] || [];

  return (
    <div
      style={{ ...S.cell, backgroundColor: colors.bg }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div style={{ ...S.cellValue, color: '#22375A' }}>
        +{outputVal}%
        <span style={{ fontSize: 9, fontWeight: 400, color: '#A0A09A', marginLeft: 3 }}>output</span>
      </div>
      <div style={{ ...S.cellSublabel, color: colors.text, fontWeight: 600 }}>
        {colors.tag}
      </div>
      {profilesHere.map((p, i) => (
        <div
          key={p.id}
          style={{ ...S.profileDot, top: 5 + i * 12, background: p.color }}
        />
      ))}
      {profilesHere.length > 0 && (
        <div style={{ ...S.profileLabel, color: profilesHere[0].color }}>
          {profilesHere.map(p => p.id).join('/')}
        </div>
      )}
    </div>
  );
}

/* ── TOOLTIP COMPONENT ─────────────────────────────────────────────────────── */

function Tooltip({ row, col, riskVal, outputVal, pos }) {
  if (row === null || !pos) return null;

  const alpha = ALPHA_ROWS[row];
  const pi = PI_COLS[col];
  const profilesHere = PROFILE_MAP[`${row}-${col}`] || [];
  const colors = getCellColors(riskVal);

  const tooltipStyle = {
    ...S.tooltip,
    top: pos.top,
    left: pos.left,
  };

  return (
    <div style={tooltipStyle}>
      <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 11 }}>
        {alpha.label} &middot; {pi.label}
      </div>
      <div>{alpha.sub} &middot; {pi.sub}</div>
      <div style={{ margin: '6px 0' }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 15, fontWeight: 500, lineHeight: 1.2,
          color: '#22375A',
        }}>
          +{outputVal}%{' '}
          <span style={{ fontSize: 10, color: '#73726C' }}>output gain</span>
        </div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11, marginTop: 2,
          color: colors.text,
        }}>
          +{riskVal}% P99 risk premium
        </div>
      </div>
      {profilesHere.length > 0 && (
        <div style={{ marginTop: 4 }}>
          Profiles:{' '}
          {profilesHere.map((p, i) => (
            <span key={p.id}>
              {i > 0 && ', '}
              <span style={{ color: p.color, fontWeight: 600 }}>{p.label}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── MAIN COMPONENT ────────────────────────────────────────────────────────── */

export default function C1_Heatmap() {
  const { data: csvData, loading } = useCSV('heatmap_alpha_pi_b030.csv');
  const [scenario, setScenario] = useState('G0');
  const [hover, setHover] = useState({ row: null, col: null, riskVal: null, outputVal: null, pos: null });
  const gridRef = useRef(null);

  const grids = useMemo(() => {
    if (!csvData) return null;
    const g0 = buildGrids(csvData, 'G0');
    const g2 = buildGrids(csvData, 'G2');
    // G1 not in CSV — interpolated with weight 0.36 from central-case values
    const interp = (a, b) =>
      a && b ? a.map((row, ri) => row.map((v0, ci) => {
        const v2 = b[ri][ci];
        return v0 != null && v2 != null ? Math.round(v0 + 0.36 * (v2 - v0)) : null;
      })) : null;
    return {
      G0: g0,
      G1: { risk: interp(g0.risk, g2.risk), output: interp(g0.output, g2.output) },
      G2: g2,
    };
  }, [csvData]);

  // Hooks must be declared before any early return
  const handleMouseEnter = useCallback((row, col, riskVal, outputVal, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    let top = rect.bottom + 6;
    let left = rect.left;
    if (left + 210 > window.innerWidth) left = window.innerWidth - 215;
    if (top + 120 > window.innerHeight) top = rect.top - 120;
    setHover({ row, col, riskVal, outputVal, pos: { top, left } });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHover({ row: null, col: null, riskVal: null, outputVal: null, pos: null });
  }, []);

  if (loading || !grids) {
    return (
      <GraphCard title="Where your organisation sits on the risk map">
        <GraphSkeleton height={400} />
      </GraphCard>
    );
  }

  const riskGrid   = grids[scenario].risk;
  const outputGrid = grids[scenario].output;

  const subtitle = (
    <span>
      Each cell shows the <strong style={{ color: '#22375A' }}>productivity output gain</strong> from
      AI adoption. Cell colour = <strong style={{ color: '#22375A' }}>P99 tail risk premium</strong>{' '}
      above no-AI baseline: red &gt;75% (counterproductive), amber 35–75%, green &lt;35% (managed).
      The α axis drives risk; E[π] drives output.
    </span>
  );

  return (
    <GraphCard
      id="c1-heatmap"
      title="Where your organisation sits on the risk map"
      subtitle={subtitle}
    >
      {/* Toggle */}
      <div style={S.controls}>
        <button
          style={{ ...S.toggleBtn, ...(scenario === 'G0' ? S.toggleBtnActive : {}) }}
          onClick={() => setScenario('G0')}
        >
          Unmanaged AI (G0)
        </button>
        <button
          style={{ ...S.toggleBtn, ...(scenario === 'G1' ? S.toggleBtnActive : {}) }}
          onClick={() => setScenario('G1')}
        >
          Light governance (G1)
        </button>
        <button
          style={{ ...S.toggleBtn, ...(scenario === 'G2' ? S.toggleBtnActive : {}) }}
          onClick={() => setScenario('G2')}
        >
          Active governance (G2)
        </button>
      </div>

      {/* Color legend */}
      <div style={S.colorLegend}>
        <div style={S.clItem}>
          <div style={{
            width: 14, height: 14, borderRadius: 3, flexShrink: 0,
            background: 'rgba(181,64,63,0.22)',
            border: '1px solid rgba(181,64,63,0.50)',
          }} />
          P99 risk premium &gt;75% — counterproductive
        </div>
        <div style={S.clItem}>
          <div style={{
            width: 14, height: 14, borderRadius: 3, flexShrink: 0,
            background: 'rgba(196,154,60,0.22)',
            border: '1px solid rgba(196,154,60,0.50)',
          }} />
          P99 risk premium 35–75% — governance needed
        </div>
        <div style={S.clItem}>
          <div style={{
            width: 14, height: 14, borderRadius: 3, flexShrink: 0,
            background: 'rgba(74,124,89,0.22)',
            border: '1px solid rgba(74,124,89,0.45)',
          }} />
          P99 risk premium &lt;35% — managed
        </div>
      </div>

      {/* Heatmap */}
      <div style={S.heatmapOuter}>
        {/* Y axis label */}
        <div style={S.yAxisWrap}>
          <div style={S.yAxisDanger}>↑ worse</div>
          <div style={S.yAxisLabel}>AI stack concentration (α)</div>
        </div>

        <div style={S.gridXWrap}>
          <div style={S.gridArea}>
            {/* Row labels */}
            <div style={S.rowLabelCol}>
              {ALPHA_ROWS.map((r, i) => (
                <div key={i} style={S.rowLabel}>
                  <div style={S.rowLabelMain}>{r.label}</div>
                  <div style={S.rowLabelSub}>{r.sub}</div>
                </div>
              ))}
            </div>

            {/* Grid */}
            <div style={S.heatmapGrid} ref={gridRef}>
              {riskGrid.flatMap((row, ri) =>
                row.map((riskVal, ci) => (
                  <HeatmapCell
                    key={`${ri}-${ci}-${scenario}`}
                    riskVal={riskVal}
                    outputVal={outputGrid[ri][ci]}
                    row={ri}
                    col={ci}
                    onMouseEnter={(e) => handleMouseEnter(ri, ci, riskVal, outputGrid[ri][ci], e)}
                    onMouseLeave={handleMouseLeave}
                  />
                ))
              )}
            </div>
          </div>

          {/* X axis labels */}
          <div style={S.xAxisRow}>
            {PI_COLS.map((c, i) => (
              <div key={i} style={S.xLabel}>
                <div style={S.xLabelMain}>{c.label}</div>
                <div style={S.xLabelSub}>{c.sub}</div>
              </div>
            ))}
          </div>

          {/* X axis title */}
          <div style={S.xAxisTitle}>
            <div style={S.xAxisTitleText}>
              Domain exposure — share of work inside AI frontier (E[π])
            </div>
            <div style={S.xAxisDanger}>riskier →</div>
          </div>
        </div>
      </div>

      {/* Profile legend */}
      <div style={S.profileLegend}>
        {PROFILES.map(p => (
          <div key={p.id} style={S.plItem}>
            <div style={{ ...S.plDot, background: p.color }} />
            {p.label}
          </div>
        ))}
      </div>

      {/* Tooltip (portal-free, fixed position) */}
      {hover.row !== null && (
        <Tooltip row={hover.row} col={hover.col} riskVal={hover.riskVal} outputVal={hover.outputVal} pos={hover.pos} />
      )}
    </GraphCard>
  );
}
