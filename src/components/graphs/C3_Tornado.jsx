import { useState, useMemo } from 'react';
import { useCSV } from '../../hooks/useCSV';
import GraphCard from '../ui/GraphCard';
import GraphSkeleton from '../ui/GraphSkeleton';
import { fmt, hexToRgba as rgba } from '../../utils/helpers';

// Labels and metadata for each dimension from CSV
// sublabel shows PHYSICAL left→right positions in the bar (lower P99 = left = safer)
const DIM_META = {
  alpha: {
    label: 'AI stack concentration (α)',
    sublabel: '← diversified (3+ providers)      single vendor →',
    mech: 'α is the Vasicek inter-decision correlation factor. At α = 0.90, a bad quarter cascades across all 10 decision types simultaneously. At α = 0.30, failures are decorrelated — errors in one domain don\'t propagate to others.',
    chipText: '① Diversify AI stack — one procurement decision',
    chipStyle: 'primary',
  },
  beta_a: {
    label: 'Cognitive homogeneity',
    sublabel: '← international hire        elite national pipeline →',
    mech: 'Homogeneous teams have fewer cognitive dissenters — employees whose different thinking flags AI errors. The Asch (1951) effect amplifies surrender when no one dissents. A single ally reduces conformity from 37% to 5%.',
    chipText: '③ Widen recruitment — 3–5 year lever',
    chipStyle: 'primary',
  },
  h_range: {
    label: 'Talent quality (h)',
    sublabel: '← elite knowledge work       low-skill operations →',
    mech: 'Elite workers maintain independent judgment more effectively under pressure — lower surrender rate offsets the larger capability gap when AI is wrong. Low-skill operations show higher tail risk despite a smaller AI performance gap.',
    chipText: null,
    chipStyle: null,
  },
  eta: {
    label: 'Deskilling rate (η)',
    sublabel: '← slow skill erosion         accelerated deskilling →',
    mech: 'η is the quarterly skill erosion rate. Even at η = 0.04, the 5-year P99 impact is modest. The tail is dominated by correlated surrenders in bad quarters — not long-run erosion. But deskilling is irreversible: skill rarely returns after extended AI dependence.',
    chipText: '⑤ Deskilling — low P99 impact at 5 years, but locks in irreversibility',
    chipStyle: 'muted',
  },
  epi: {
    label: 'Domain exposure E[π]',
    sublabel: '← operations-heavy         strategy / M&A →',
    mech: 'E[π] is the fraction of decisions inside the AI\'s training data. Strategy/M&A (E[π]=0.45) has 55% outside-frontier decisions — AI is wrong more often. Operations (E[π]=0.85) has only 15% outside frontier. Sector choice is structural — not easily changed.',
    chipText: '② Use AI selectively — depends on sector',
    chipStyle: 'domain',
  },
};

const CHIP_STYLES = {
  primary: { background: 'rgba(97,158,168,0.12)', color: '#22375A', border: '0.5px solid rgba(97,158,168,0.35)' },
  domain:  { background: 'rgba(196,154,60,0.10)',  color: '#8a6d22', border: '0.5px solid rgba(196,154,60,0.30)' },
  muted:   { background: '#F5F4EF',                color: '#73726C', border: '0.5px solid rgba(0,0,0,0.10)' },
};

// ── Profile list ─────────────────────────────────────────────────────────────
const PROFILES_LIST = [
  { id: 'P1', name: 'Big Four',        city: 'Frankfurt',  color: '#D85A30', alpha: 0.70, epi: 0.50 },
  { id: 'P2', name: 'Inv. bank',       city: 'London',     color: '#378ADD', alpha: 0.40, epi: 0.55 },
  { id: 'P3', name: 'Strategy',        city: 'Paris',      color: '#B5403F', alpha: 0.90, epi: 0.55 },
  { id: 'P4', name: 'Corp. legal',     city: 'Brussels',   color: '#534AB7', alpha: 0.90, epi: 0.45 },
  { id: 'P5', name: 'Tech startup',    city: 'S.F.',       color: '#639922', alpha: 0.60, epi: 0.70 },
  { id: 'P6', name: 'Creative agency', city: 'Singapore',  color: '#1D9E75', alpha: 0.30, epi: 0.85 },
  { id: 'P7', name: 'Back-office',     city: 'Bangalore',  color: '#BA7517', alpha: 0.70, epi: 0.75 },
  { id: 'P8', name: 'Central admin',   city: 'Seoul',      color: '#888780', alpha: 0.95, epi: 0.60 },
];

// ── SVG layout constants ────────────────────────────────────────────────────
const SVG_W = 700, SVG_H = 220;
const LABEL_W = 218, PAD_R = 56, PAD_T = 22, PAD_B = 50;
const BAR_AREA_W = SVG_W - LABEL_W - PAD_R;
const BAR_AREA_H = SVG_H - PAD_T - PAD_B;

export default function C3_Tornado() {
  const { data: dimData, loading } = useCSV('sweep_profiles_dimensions_b030.csv');
  const [tooltip, setTooltip] = useState(null);
  const [hoverIdx, setHoverIdx] = useState(-1);
  const [selectedProfile, setSelectedProfile] = useState('P3');

  // All 5 dimensions now in a single CSV — no heatmap derivation needed
  const { dims, xMin, xMax, centralRef } = useMemo(() => {
    if (!dimData) return { dims: [], xMin: 1700, xMax: 2250, centralRef: 2041 };

    const profileRows = dimData.filter(row => row.profile_id === selectedProfile);
    if (!profileRows.length) return { dims: [], xMin: 1700, xMax: 2250, centralRef: 2041 };

    const allDims = profileRows.map(row => {
      const dim = row.dimension;
      const meta = DIM_META[dim] || { label: dim, sublabel: '', mech: '', chipText: null, chipStyle: null };
      return { dim, ...meta, lo: +row.p99_at_lo, hi: +row.p99_at_hi, central: +row.central_p99, rangePct: +row.range_pct };
    });

    allDims.sort((a, b) => b.rangePct - a.rangePct);

    let allMin = Infinity, allMax = -Infinity;
    allDims.forEach(d => {
      const barLo = Math.min(d.lo, d.hi);
      const barHi = Math.max(d.lo, d.hi);
      if (barLo < allMin) allMin = barLo;
      if (barHi > allMax) allMax = barHi;
    });
    const padding = (allMax - allMin) * 0.15;
    const xMin = Math.floor((allMin - padding) / 50) * 50;
    const xMax = Math.ceil((allMax + padding) / 50) * 50;

    // central_p99 is identical across all dims for a given profile (verified)
    const centralRef = allDims[0]?.central || 2041;

    return { dims: allDims, xMin, xMax, centralRef };
  }, [dimData, selectedProfile]);

  if (loading) return <GraphCard title={"What drives tail risk — and what doesn't"}><GraphSkeleton /></GraphCard>;

  const N = dims.length;
  const ROW_H = BAR_AREA_H / N;
  const BAR_H = Math.min(20, ROW_H * 0.50);
  const xPx = (v) => LABEL_W + ((v - xMin) / (xMax - xMin)) * BAR_AREA_W;
  const xC = xPx(centralRef);

  const gridStep = 50;
  const gridTicks = [];
  for (let v = Math.ceil(xMin / gridStep) * gridStep; v <= xMax; v += gridStep) {
    if (v > xMin && v < xMax) gridTicks.push(v);
  }

  const handleMouseEnter = (e, d, i) => {
    setHoverIdx(i);
    const rangeStr = `${fmt(Math.min(d.lo, d.hi))} → ${fmt(Math.max(d.lo, d.hi))} (+${d.rangePct.toFixed(d.rangePct < 10 ? 1 : 0)}% swing)`;
    setTooltip({ x: e.clientX, y: e.clientY, title: d.label, range: rangeStr, mech: d.mech });
  };

  const handleMouseMove = (e) => {
    setTooltip((prev) => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
  };

  const handleMouseLeave = () => {
    setHoverIdx(-1);
    setTooltip(null);
  };

  const getGradOpacity = (rank) => {
    if (rank <= 2) return 1;
    if (rank === 3) return 0.7;
    if (rank === 4) return 0.55;
    return 0.30;
  };

  const getRankStyle = (rank) => {
    if (rank === 0) return { color: '#22375A', fontWeight: 700 };
    if (rank <= 2) return { color: '#619EA8', fontWeight: 500 };
    return { color: '#A0A09A', fontWeight: 500 };
  };

  // Legend y positions (below x-axis labels)
  const legendY = PAD_T + BAR_AREA_H + 38;

  const activeProfile = PROFILES_LIST.find(p => p.id === selectedProfile);
  const profileLabel = activeProfile ? `${selectedProfile} (${activeProfile.name}, ${activeProfile.city})` : selectedProfile;

  return (
    <GraphCard
      id="c3"
      title={"What drives tail risk — and what doesn't"}
      subtitle={"Each bar shows how much P99 changes when one dimension varies from its safest to riskiest value, all others held constant. Moving a bar to the left = lower risk. Stack centralisation (α) accounts for more variation than any other single dimension. This hierarchy is stable across all eight organisational profiles."}
      footnote={"Domain exposure shows near-zero marginal sensitivity at p₀=0.80 — surrender rate is high enough that inside/outside frontier barely affects aggregate tail risk. This is not a modelling artefact: it is the mechanism."}
    >
      {/* Profile toggle buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
        {PROFILES_LIST.map(p => {
          const active = selectedProfile === p.id;
          return (
            <button key={p.id} onClick={() => setSelectedProfile(p.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '4px 10px', borderRadius: 5,
                border: `0.5px solid ${active ? p.color : 'rgba(0,0,0,0.10)'}`,
                background: active ? rgba(p.color, 0.10) : 'transparent',
                color: active ? p.color : '#A0A09A',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 10, fontWeight: 600, cursor: 'pointer',
              }}
            >
              <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: active ? p.color : '#C0BFB9' }} />
              {p.name} — {p.city}
            </button>
          );
        })}
      </div>

      <div style={{ width: '100%', marginBottom: 16 }}>
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ display: 'block', width: '100%', overflow: 'visible' }}>
          <defs>
            {dims.map((d, i) => {
              const op = getGradOpacity(i);
              // Gradient always green(left=lower P99=safer) → red(right=higher P99=riskier)
              return (
                <linearGradient key={i} id={`tgrad${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   stopColor="#4A7C59" stopOpacity={0.90 * op} />
                  <stop offset="45%"  stopColor="#619EA8" stopOpacity={0.85 * op} />
                  <stop offset="100%" stopColor="#B5403F" stopOpacity={0.80 * op} />
                </linearGradient>
              );
            })}
          </defs>

          {/* Gridlines */}
          {gridTicks.map((v) => (
            <g key={v}>
              <line x1={xPx(v)} y1={PAD_T - 6} x2={xPx(v)} y2={PAD_T + BAR_AREA_H}
                stroke="rgba(0,0,0,0.05)" strokeWidth={1} strokeDasharray="2 4" />
              <text x={xPx(v)} y={PAD_T + BAR_AREA_H + 14} textAnchor="middle"
                fontFamily="'JetBrains Mono', monospace" fontSize={8.5} fill="#A0A09A">
                {(v / 1000).toFixed(1)}k
              </text>
            </g>
          ))}

          {/* Direction labels */}
          <text x={LABEL_W + 4} y={PAD_T - 8} textAnchor="start"
            fontFamily="'Plus Jakarta Sans', sans-serif" fontSize={8} fontWeight={600} fill="#4A7C59">
            {'← lower risk'}
          </text>
          <text x={LABEL_W + BAR_AREA_W - 4} y={PAD_T - 8} textAnchor="end"
            fontFamily="'Plus Jakarta Sans', sans-serif" fontSize={8} fontWeight={600} fill="#B5403F">
            {'higher risk →'}
          </text>

          {/* X axis title */}
          <text x={LABEL_W + BAR_AREA_W / 2} y={PAD_T + BAR_AREA_H + 26} textAnchor="middle"
            fontFamily="'Plus Jakarta Sans', sans-serif" fontSize={9.5} fontWeight={600} fill="#22375A">
            P99 worst-case quarterly loss (total errors)
          </text>

          {/* Color legend */}
          <rect x={LABEL_W + 10} y={legendY} width={16} height={7} fill="#4A7C59" rx={1.5} opacity={0.85} />
          <text x={LABEL_W + 30} y={legendY + 6.5}
            fontFamily="'Plus Jakarta Sans', sans-serif" fontSize={8} fill="#4A7C59">
            safer parameter value
          </text>
          <rect x={LABEL_W + 140} y={legendY} width={16} height={7} fill="#B5403F" rx={1.5} opacity={0.85} />
          <text x={LABEL_W + 160} y={legendY + 6.5}
            fontFamily="'Plus Jakarta Sans', sans-serif" fontSize={8} fill="#B5403F">
            riskier parameter value
          </text>

          {/* Rows */}
          {dims.map((d, i) => {
            const yMid = PAD_T + i * ROW_H + ROW_H / 2;
            const yTop = yMid - BAR_H / 2;
            const barLo = Math.min(d.lo, d.hi);
            const barHi = Math.max(d.lo, d.hi);
            const barX = xPx(barLo);
            const barW = xPx(barHi) - barX;
            const rStyle = getRankStyle(i);

            return (
              <g key={d.dim}>
                {/* Hover background */}
                <rect x={0} y={yMid - ROW_H / 2 + 1} width={SVG_W - PAD_R + 20} height={ROW_H - 2}
                  fill={hoverIdx === i ? 'rgba(97,158,168,0.06)' : 'transparent'}
                  cursor="pointer"
                  onMouseEnter={(e) => handleMouseEnter(e, d, i)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave} />

                {/* Label */}
                <text x={LABEL_W - 10} y={yMid - 4} textAnchor="end"
                  fontFamily="'Plus Jakarta Sans', sans-serif" fontSize={10} fontWeight={600} fill="#22375A">
                  {d.label}
                </text>
                <text x={LABEL_W - 10} y={yMid + 9} textAnchor="end"
                  fontFamily="'Plus Jakarta Sans', sans-serif" fontSize={7.5} fill="#757575">
                  {d.sublabel}
                </text>

                {/* Bar */}
                <rect x={barX} y={yTop} width={Math.max(barW, 2)} height={BAR_H}
                  fill={`url(#tgrad${i})`} rx={3} />

                {/* Range % */}
                <text x={LABEL_W + BAR_AREA_W + 5} y={yMid + 4} textAnchor="start"
                  fontFamily="'JetBrains Mono', monospace" fontSize={10}
                  fontWeight={rStyle.fontWeight} fill={rStyle.color}>
                  {d.rangePct < 10 ? `+${d.rangePct.toFixed(1)}%` : `+${Math.round(d.rangePct)}%`}
                </text>
              </g>
            );
          })}

          {/* Reference line — drawn on top of bars */}
          <line x1={xC} y1={PAD_T - 6} x2={xC} y2={PAD_T + BAR_AREA_H}
            stroke="#22375A" strokeWidth={1.5} strokeDasharray="4 3" opacity={0.55}
            pointerEvents="none" />
          {/* Reference label at TOP of line */}
          <text x={xC + 4} y={PAD_T - 10}
            fontFamily="'Plus Jakarta Sans', sans-serif" fontSize={8.5} fontWeight={600}
            fill="rgba(34,55,90,0.80)">{selectedProfile} ref.</text>
          <text x={xC + 4} y={PAD_T + 1}
            fontFamily="'JetBrains Mono', monospace" fontSize={8}
            fill="rgba(34,55,90,0.55)">{fmt(centralRef)}</text>
        </svg>
      </div>

      {/* Action chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
        {dims.filter((d) => d.chipText).map((d) => (
          <div key={d.dim} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 6,
            fontSize: 9.5, fontWeight: 600, cursor: 'default',
            ...CHIP_STYLES[d.chipStyle],
          }}>
            {d.chipText}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 14, fontSize: 10, color: '#C0BFB9', fontStyle: 'italic', textAlign: 'right' }}>
        {`P99 sweep \u2014 one parameter at a time, others held at ${profileLabel} values. v5 Monte Carlo simulation.`}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: 'fixed', left: tooltip.x + 14, top: tooltip.y - 10,
          background: '#fff', border: '0.5px solid rgba(0,0,0,0.12)', borderRadius: 8,
          padding: '10px 13px', fontSize: 10, pointerEvents: 'none', zIndex: 100, maxWidth: 230, lineHeight: 1.5,
        }}>
          <div style={{ fontWeight: 600, fontSize: 11, color: '#22375A', marginBottom: 5 }}>{tooltip.title}</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 500, color: '#619EA8', marginBottom: 4 }}>{tooltip.range}</div>
          <div style={{ fontSize: 9.5, color: '#73726C', lineHeight: 1.5 }}>{tooltip.mech}</div>
        </div>
      )}
    </GraphCard>
  );
}
