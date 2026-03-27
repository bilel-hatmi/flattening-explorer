import { useState, useMemo, useCallback } from 'react';
import { useCSV } from '../../hooks/useCSV';
import { PROFILES as V5_PROFILES } from '../../data/v5_reference';
import { useProfile } from '../../context/ProfileContext';
import GraphCard from '../ui/GraphCard';
import GraphSkeleton from '../ui/GraphSkeleton';
import { fmt, hexToRgba as rgba } from '../../utils/helpers';

// ── SVG layout ──────────────────────────────────────────────────────────────
const SVG_W = 680, SVG_H = 210;
const PAD = { l: 44, r: 44, t: 36, b: 18 };
const chartH = SVG_H - PAD.t - PAD.b;
const X_G0 = PAD.l + 30;
const X_G1 = 340;
const X_G2 = SVG_W - PAD.r - 30;
const Y_MIN = 850, Y_MAX = 2500;

function yPx(v) { return PAD.t + chartH * (1 - (v - Y_MIN) / (Y_MAX - Y_MIN)); }

const PROFILE_IDS = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8'];
const GRID_VALS = [1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400];

const SCAFFOLD_COLOR = (v) => v >= 1.0 ? '#4A7C59' : v > 0 ? 'rgba(100,100,100,0.60)' : '#B5403F';
const SCAFFOLD_FMT = (v) => (v >= 0 ? '+' : '') + Math.round(v * 100) + '%';

// G2 visual position — 10% closer to G1 than actual data
// displayed_G2 = G1 + 0.9 × (G2_actual − G1)
function displayG2(p99_G1, p99_G2) {
  return p99_G1 + 0.75 * (p99_G2 - p99_G1);
}

// Diamond path for G1 marker
function diamond(cx, cy, r) {
  return `M ${cx},${cy - r} L ${cx + r},${cy} L ${cx},${cy + r} L ${cx - r},${cy} Z`;
}

export default function C5_Slope() {
  const { profileId } = useProfile();
  const { data, loading } = useCSV('sweep_profiles_v3_b030.csv');
  const [tooltip, setTooltip] = useState(null);
  const [visibleProfiles, setVisibleProfiles] = useState(new Set(['P1', 'P2', 'P5', 'P6']));

  const profiles = useMemo(() => {
    if (!data) return [];
    const byProfile = {};
    data.forEach((row) => {
      const id = row.profile_id;
      if (!byProfile[id]) {
        byProfile[id] = {
          id,
          city: row.city,
          color: row.color,
          name: V5_PROFILES[id]?.name || id,
          scaffold: +row.scaffold_benefit,
        };
      }
      const sc = row.scenario;
      if (sc === 'G0' || sc === 'G1' || sc === 'G2') {
        byProfile[id][`p99_${sc}`] = +row.p99_theta;
      }
    });
    return PROFILE_IDS.map((id) => byProfile[id]).filter(Boolean);
  }, [data]);

  const toggleProfile = useCallback((pid) => {
    setVisibleProfiles(prev => {
      const next = new Set(prev);
      if (next.has(pid)) next.delete(pid); else next.add(pid);
      return next;
    });
  }, []);

  if (loading) return <GraphCard title={'Governance is regressive — it helps most where it is needed least'}><GraphSkeleton /></GraphCard>;

  const showTooltip = (e, p) => {
    const g0g1 = Math.round((1 - p.p99_G1 / p.p99_G0) * 100);
    const g0g2 = Math.round((1 - p.p99_G2 / p.p99_G0) * 100);
    setTooltip({
      x: e.clientX, y: e.clientY,
      name: `${p.name} — ${p.city}`,
      color: p.color,
      g0: fmt(p.p99_G0), g1: fmt(p.p99_G1), g2: fmt(p.p99_G2),
      dg1: `-${g0g1}%`, dg2: `-${g0g2}%`,
      scaffold: SCAFFOLD_FMT(p.scaffold),
      scaffoldColor: SCAFFOLD_COLOR(p.scaffold),
    });
  };

  const visible = profiles.filter(p => visibleProfiles.has(p.id));

  return (
    <GraphCard
      id="c5"
      title={'Governance is regressive — it helps most where it is needed least'}
      subtitle={'Eight organisational profiles traced through three governance states. Dashed segments show passive guardrails (G0\u2192G1, nearly flat); solid segments show active governance (G1\u2192G2, variable slope). Steeper solid segments indicate greater governance benefit.'}
    >
      {/* Line type legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 8, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#73726C' }}>
          <svg width="40" height="10"><line x1="0" y1="5" x2="40" y2="5" stroke="#888" strokeWidth="1.5" strokeDasharray="5 3" /></svg>
          G0→G1 (passive guardrails — dashed)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#73726C' }}>
          <svg width="40" height="10"><line x1="0" y1="5" x2="40" y2="5" stroke="#888" strokeWidth="2.4" /></svg>
          G1→G2 (active governance — solid)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#73726C' }}>
          <svg width="14" height="14">
            <path d={diamond(7, 7, 5)} fill="rgba(120,120,120,0.55)" stroke="white" strokeWidth="1.5" />
          </svg>
          G1 position
        </div>
      </div>

      {/* Profile toggle buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
        {profiles.map(p => {
          const active = visibleProfiles.has(p.id);
          return (
            <button
              key={p.id}
              onClick={() => toggleProfile(p.id)}
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
              <span style={{
                display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
                background: active ? p.color : '#C0BFB9',
              }} />
              {p.name} — {p.city}
            </button>
          );
        })}
      </div>

      <div style={{ width: '100%', marginBottom: 12 }}>
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ display: 'block', width: '100%', overflow: 'visible' }}>
          {/* Gridlines */}
          {GRID_VALS.map((v) => (
            <g key={v}>
              <line x1={X_G0 - 10} y1={yPx(v)} x2={X_G2 + 10} y2={yPx(v)}
                stroke="rgba(0,0,0,0.05)" strokeWidth={1} strokeDasharray="2 4" />
              <text x={X_G0 - 14} y={yPx(v) + 4} textAnchor="end"
                fontFamily="'JetBrains Mono', monospace" fontSize={8.5} fill="#A0A09A">
                {(v / 1000).toFixed(1)}k
              </text>
            </g>
          ))}

          {/* Column axis lines */}
          {[X_G0, X_G1, X_G2].map((x) => (
            <line key={x} x1={x} y1={PAD.t} x2={x} y2={PAD.t + chartH}
              stroke="rgba(0,0,0,0.08)" strokeWidth={1} />
          ))}

          {/* Column headers */}
          <text x={X_G0} y={PAD.t - 18} textAnchor="middle" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize={11} fontWeight={600} fill="#B5403F">Unmanaged AI</text>
          <text x={X_G0} y={PAD.t - 6}  textAnchor="middle" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize={8.5} fill="#A0A09A">(G0)</text>
          <text x={X_G1} y={PAD.t - 18} textAnchor="middle" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize={11} fontWeight={600} fill="#C49A3C">Passive guardrails</text>
          <text x={X_G1} y={PAD.t - 6}  textAnchor="middle" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize={8.5} fill="#A0A09A">(G1)</text>
          <text x={X_G2} y={PAD.t - 18} textAnchor="middle" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize={11} fontWeight={600} fill="#4A7C59">Active governance</text>
          <text x={X_G2} y={PAD.t - 6}  textAnchor="middle" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize={8.5} fill="#A0A09A">(G2)</text>

          {/* Dashed lines G0→G1 */}
          {visible.map((p) => {
            const hl = !profileId || p.id === profileId;
            return <line key={`d-${p.id}`}
              x1={X_G0} y1={yPx(p.p99_G0)} x2={X_G1} y2={yPx(p.p99_G1)}
              stroke={rgba(p.color, hl ? 0.35 : 0.18)} strokeWidth={hl ? 1.5 : 0.8}
              strokeDasharray="5 3" strokeLinecap="round" />;
          })}

          {/* Solid lines G1→G2 (visual G2 = 10% closer to G1) */}
          {visible.map((p) => {
            const hl = !profileId || p.id === profileId;
            const g2vis = displayG2(p.p99_G1, p.p99_G2);
            return <line key={`s-${p.id}`}
              x1={X_G1} y1={yPx(p.p99_G1)} x2={X_G2} y2={yPx(g2vis)}
              stroke={rgba(p.color, hl ? 0.85 : 0.35)} strokeWidth={hl ? 3.5 : 1.5}
              strokeLinecap="round" />;
          })}

          {/* Markers */}
          {visible.map((p) => {
            const hl = !profileId || p.id === profileId;
            const g2vis = displayG2(p.p99_G1, p.p99_G2);
            const cy1 = yPx(p.p99_G1);
            return (
              <g key={`m-${p.id}`} opacity={hl ? 1 : 0.5}>
                <circle cx={X_G0} cy={yPx(p.p99_G0)} r={6}
                  fill={rgba(p.color, 0.88)} stroke="white" strokeWidth={1.5}
                  cursor="pointer" onMouseEnter={(e) => showTooltip(e, p)} onMouseLeave={() => setTooltip(null)} />
                <path d={diamond(X_G1, cy1, 5)}
                  fill={rgba(p.color, 0.50)} stroke="white" strokeWidth={1.5}
                  cursor="pointer" onMouseEnter={(e) => showTooltip(e, p)} onMouseLeave={() => setTooltip(null)} />
                <circle cx={X_G2} cy={yPx(g2vis)} r={6}
                  fill={rgba(p.color, 0.88)} stroke="white" strokeWidth={1.5}
                  cursor="pointer" onMouseEnter={(e) => showTooltip(e, p)} onMouseLeave={() => setTooltip(null)} />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Profile legend — 4 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '5px 16px', marginBottom: 14 }}>
        {profiles.map((p) => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="12" height="12"><circle cx="6" cy="6" r="4.5" fill={p.color} stroke="white" strokeWidth="1.2" /></svg>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 9, fontWeight: 600, color: '#22375A' }}>
              {p.name} — {p.city}
            </span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8.5, color: SCAFFOLD_COLOR(p.scaffold), marginLeft: 'auto', whiteSpace: 'nowrap' }}>
              {SCAFFOLD_FMT(p.scaffold)}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom note */}
      <div style={{
        background: 'rgba(34,55,90,0.04)', borderLeft: '2px solid rgba(34,55,90,0.20)',
        borderRadius: '0 6px 6px 0', padding: '9px 14px',
        fontSize: 10, color: '#22375A', lineHeight: 1.6,
      }}>
        The regressivity paradox: Singapore (P6), already the safest, gains the most from governance.
        Seoul (P8), the most exposed, gains the least — and still finishes above Singapore after governance.
      </div>

      {/* Tooltip (actual data values, not visual adjustment) */}
      {tooltip && (
        <div style={{
          position: 'fixed', left: tooltip.x + 14, top: tooltip.y - 10,
          background: '#fff', border: '0.5px solid rgba(0,0,0,0.12)', borderRadius: 8,
          padding: '10px 13px', pointerEvents: 'none', zIndex: 100, maxWidth: 240, lineHeight: 1.5,
        }}>
          <div style={{ fontWeight: 600, fontSize: 11, color: tooltip.color, marginBottom: 5 }}>{tooltip.name}</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#B5403F' }}>G0: {tooltip.g0}</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#C49A3C' }}>G1: {tooltip.g1} ({tooltip.dg1} vs G0)</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#4A7C59' }}>G2: {tooltip.g2} ({tooltip.dg2} vs G0)</div>
          <div style={{ borderTop: '0.5px solid rgba(0,0,0,0.07)', paddingTop: 5, marginTop: 5, fontSize: 10, color: tooltip.scaffoldColor }}>
            Scaffold benefit: {tooltip.scaffold}
          </div>
        </div>
      )}
    </GraphCard>
  );
}
