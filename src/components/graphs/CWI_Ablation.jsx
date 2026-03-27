import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useCSV } from '../../hooks/useCSV';
import { useProfile } from '../../context/ProfileContext';
import GraphCard from '../ui/GraphCard';
import GraphSkeleton from '../ui/GraphSkeleton';
import { PROFILES } from '../../data/v5_reference';

// ── G2 — governance ceiling (separate from ablations) ────────────────────────
const G2_DEF = {
  key: 'g2',
  csvKey: 'G2',
  name: 'Governance ceiling (G2)',
  desc: 'Full scaffold: Socratic questioning gates + audit loops + diversity targets',
};

// ── Ablation toggles (sorted by effect amplitude per profile) ─────────────────
const ABLATION_DEFS = [
  {
    key: 'noScreen',
    csvKey: 'no_screen',
    name: 'Remove AI screening',
    desc: 'Disable algorithmic filtering in hiring \u2014 restore cognitive diversity to baseline',
  },
  {
    key: 'noConform',
    csvKey: 'no_conform',
    name: 'Remove conformism pressure',
    desc: 'Simulate a cognitively diverse team resistant to AI override',
  },
  {
    key: 'divStack',
    csvKey: 'div_stack',
    name: 'Diversify the AI stack',
    desc: 'Move to multi-provider architecture (\u03b1 \u2192 0.30) \u2014 one procurement decision',
  },
  {
    key: 'noDeskill',
    csvKey: 'no_deskill',
    name: 'Halt deskilling',
    desc: 'Freeze skill decay (\u03b7 \u2192 0) \u2014 maintain current human judgment levels',
  },
];

// ── Profile notes (exact wording from spec, with <strong> tags) ──────────────
const NOTES = {
  P1: "Frankfurt\u2019s main lever is <strong>stack diversification</strong> (\u221213%) followed by conformism removal (\u22126%). Governance (G2) eliminates \u221232%. Scaffold benefit is slightly negative (\u22123%) \u2014 the velocity cost marginally exceeds the risk reduction.",
  P2: "London is already near-optimal structurally. <strong>Active governance (G2)</strong> produces the largest single reduction (\u221241%). Stack diversification has minimal effect \u2014 \u03b1=0.40 is already partially diversified. Scaffold benefit is the highest in the model (+146%).",
  P3: "Paris responds strongly to both <strong>stack diversification</strong> (\u221213%) and <strong>conformism removal</strong> (\u22129%). The grandes \u00e9coles pipeline and centralised LLM are Paris\u2019s two structural constraints. Governance (G2) yields \u221236%. Scaffold benefit: +77%.",
  P4: "Brussels is dominated by <strong>stack concentration</strong> \u2014 diversification yields \u221213%. Domain exposure (E[\u03c0]=0.45) is structural and cannot be toggled away. Governance (G2) provides \u221230%, but scaffold benefit is slightly negative (\u22128%).",
  P5: "<strong>Governance is counterproductive for this profile.</strong> Stack diversification helps (\u22127%). Conformism has near-zero effect \u2014 the pipeline is already diverse. G2 reduces tail risk but the velocity cost dominates: scaffold benefit \u221236%. This grounds the Nash equilibrium argument.",
  P6: "Singapore is already protected by architecture. <strong>No single ablation produces meaningful reduction</strong> \u2014 the profile has near-optimal stack diversification and inside-frontier domain. Governance (G2) is the only lever with visible effect (\u221239%). Scaffold benefit: +40%.",
  P7: "Bangalore\u2019s dominant lever is <strong>stack diversification</strong> (\u221221%) \u2014 the most responsive profile on this dimension. Conformism and screening effects are muted. Governance (G2): \u221224%. Scaffold benefit is negative (\u221226%) \u2014 forcing independent judgment in a low-skill workforce is counterproductive.",
  P8: "Seoul has the highest absolute tail risk and <strong>the weakest response to any single intervention</strong>. Stack diversification yields \u221212%. Governance yields \u221220%. Scaffold benefit: \u22126%. Structural reform across multiple dimensions is the only effective path.",
};

// ── Profile meta (labels + colors from v5_reference) ─────────────────────────
const PROFILE_IDS = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8'];

const PROFILE_META = PROFILE_IDS.map((id) => ({
  id,
  name: PROFILES[id].city,
  color: PROFILES[id].color,
}));

// ── Styles ───────────────────────────────────────────────────────────────────
const S = {
  profileRow: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  profBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 14px',
    borderRadius: 6,
    border: '0.5px solid rgba(0,0,0,0.14)',
    background: 'transparent',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 11,
    fontWeight: 500,
    color: '#73726C',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  profBtnActive: {
    color: '#fff',
    borderColor: 'transparent',
  },
  profDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  mainLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr 240px',
    gap: 28,
    alignItems: 'start',
    marginBottom: 20,
  },
  barSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  barWrap: {
    position: 'relative',
    background: '#F5F4EF',
    borderRadius: 8,
    padding: '18px 16px 14px',
  },
  barLabel: {
    fontSize: 10,
    fontWeight: 600,
    color: '#73726C',
    marginBottom: 8,
  },
  valRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 10,
  },
  valMain: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 28,
    fontWeight: 500,
    transition: 'color 0.3s',
  },
  valDelta: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 15,
    fontWeight: 500,
    color: '#4A7C59',
    minWidth: 60,
    textAlign: 'right',
    transition: 'color 0.3s',
  },
  valLabel: {
    fontSize: 9,
    color: '#A0A09A',
    marginTop: 2,
  },
  toggleSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  toggleHeader: {
    fontSize: 10,
    fontWeight: 600,
    color: '#73726C',
    paddingBottom: 6,
    borderBottom: '0.5px solid rgba(0,0,0,0.08)',
  },
  toggleRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 8,
    border: '0.5px solid rgba(0,0,0,0.08)',
    background: '#FAFAF8',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  toggleRowActive: {
    background: 'rgba(74,124,89,0.07)',
    borderColor: 'rgba(74,124,89,0.35)',
  },
  toggleText: {
    flex: 1,
  },
  toggleName: {
    fontSize: 10,
    fontWeight: 600,
    color: '#22375A',
    marginBottom: 2,
  },
  toggleDesc: {
    fontSize: 8.5,
    color: '#A0A09A',
    lineHeight: 1.4,
  },
  toggleEffect: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    fontWeight: 500,
    marginTop: 4,
    minHeight: 14,
    transition: 'color 0.2s',
  },
  resetBtn: {
    width: '100%',
    padding: 8,
    borderRadius: 6,
    border: '0.5px solid rgba(0,0,0,0.14)',
    background: 'transparent',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 11,
    color: '#73726C',
    cursor: 'pointer',
    transition: 'all 0.15s',
    marginTop: 4,
  },
  interactionWarn: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    padding: '8px 12px',
    borderRadius: 6,
    background: 'rgba(196,154,60,0.08)',
    border: '0.5px solid rgba(196,154,60,0.28)',
    fontSize: 9.5,
    color: '#8a6d22',
    lineHeight: 1.5,
    transition: 'opacity 0.25s',
  },
  p5Banner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    padding: '10px 14px',
    borderRadius: 6,
    background: 'rgba(181,64,63,0.08)',
    border: '0.5px solid rgba(181,64,63,0.35)',
    fontSize: 10,
    color: '#B5403F',
    lineHeight: 1.55,
    fontWeight: 500,
    marginBottom: 14,
    transition: 'opacity 0.25s',
  },
  bottomNote: {
    background: 'rgba(34,55,90,0.04)',
    borderLeft: '2px solid rgba(34,55,90,0.20)',
    borderRadius: '0 6px 6px 0',
    padding: '9px 14px',
    fontSize: 10,
    color: '#22375A',
    lineHeight: 1.6,
  },
  disclaimer: {
    marginTop: 10,
    fontSize: 10,
    color: '#C0BFB9',
    fontStyle: 'italic',
    textAlign: 'right',
  },
};

// ── Custom toggle switch ─────────────────────────────────────────────────────
const switchStyles = {
  label: {
    position: 'relative',
    width: 32,
    height: 18,
    flexShrink: 0,
    marginTop: 1,
    display: 'inline-block',
  },
  input: {
    opacity: 0,
    width: 0,
    height: 0,
    position: 'absolute',
  },
  slider: (checked, activeColor) => ({
    position: 'absolute',
    cursor: 'pointer',
    inset: 0,
    background: checked ? (activeColor || '#4A7C59') : '#C8C7C1',
    borderRadius: 18,
    transition: 'background 0.2s',
  }),
  knob: (checked) => ({
    content: "''",
    position: 'absolute',
    width: 12,
    height: 12,
    left: 3,
    bottom: 3,
    background: '#fff',
    borderRadius: '50%',
    transition: 'transform 0.2s',
    transform: checked ? 'translateX(14px)' : 'translateX(0)',
  }),
};

function ToggleSwitch({ checked, onChange, activeColor }) {
  return (
    <label style={switchStyles.label} onClick={(e) => e.stopPropagation()}>
      <input
        type="checkbox"
        style={switchStyles.input}
        checked={checked}
        onChange={onChange}
      />
      <span style={switchStyles.slider(checked, activeColor)}>
        <span style={switchStyles.knob(checked)} />
      </span>
    </label>
  );
}

// ── SVG Bar Component ────────────────────────────────────────────────────────
const SVG_W = 500;
const SVG_H = 80;
const BAR_Y = 18;
const BAR_H = 34;

function AblationBar({ fullVal, currentVal, profileColor }) {
  // Axis starts at ~58% of fullVal so variations are clearly visible
  const xMin = Math.floor(fullVal * 0.58 / 100) * 100;
  const xMax = Math.ceil(fullVal * 1.07 / 100) * 100;
  const range = xMax - xMin;
  const xPx = (v) => Math.max(0, Math.min(SVG_W, ((v - xMin) / range) * SVG_W));

  const fullX = xPx(fullVal);
  const currentX = Math.max(4, xPx(currentVal));

  // Compute readable ticks between xMin and xMax
  const rawStep = range / 4;
  const tickStep = rawStep <= 100 ? 100 : rawStep <= 150 ? 150 : rawStep <= 200 ? 200 : 250;
  const ticks = [];
  for (let v = Math.ceil(xMin / tickStep) * tickStep; v <= xMax; v += tickStep) {
    ticks.push(v);
  }

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      style={{ display: 'block', width: '100%' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Track background */}
      <rect x={0} y={BAR_Y} width={SVG_W} height={BAR_H} fill="rgba(0,0,0,0.06)" rx={5} />
      {/* Full reference region (grey zone from currentX to fullX) */}
      <rect x={currentX} y={BAR_Y} width={Math.max(0, fullX - currentX)} height={BAR_H}
        fill="rgba(34,55,90,0.10)" rx={3} />
      {/* Current value bar */}
      <rect x={0} y={BAR_Y} width={currentX} height={BAR_H}
        fill={profileColor} rx={5} opacity={0.88} />
      {/* Full model tick line */}
      <line x1={fullX} y1={BAR_Y - 2} x2={fullX} y2={BAR_Y + BAR_H + 2}
        stroke="rgba(34,55,90,0.35)" strokeWidth={1.5} strokeDasharray="3 2" />
      {/* Reference label */}
      <text x={fullX + 3} y={BAR_Y - 4} textAnchor="start"
        fontFamily="Plus Jakarta Sans, sans-serif" fontSize={8} fill="rgba(34,55,90,0.45)">
        full: {Math.round(fullVal).toLocaleString()}
      </text>
      {/* X axis ticks */}
      {ticks.map((v) => {
        const x = xPx(v);
        return (
          <g key={v}>
            <line x1={x} y1={BAR_Y + BAR_H + 4} x2={x} y2={BAR_Y + BAR_H + 8}
              stroke="rgba(0,0,0,0.15)" strokeWidth={1} />
            <text x={x} y={BAR_Y + BAR_H + 20} textAnchor="middle"
              fontFamily="JetBrains Mono, monospace" fontSize={8.5} fill="#A0A09A">
              {(v / 1000).toFixed(1)}k
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function CWI_Ablation() {
  const { profileId } = useProfile();
  const { data: rawData, loading, error } = useCSV('ablation_results.csv');
  const [selectedProfile, setSelectedProfile] = useState(profileId || 'P3');

  // Sync with ProfileContext when it changes
  useEffect(() => {
    if (profileId) setSelectedProfile(profileId);
  }, [profileId]);
  const [activeToggles, setActiveToggles] = useState(new Set());

  // ── Parse CSV into lookup: { P1: { full: 2124, noScreen: 2090, ... }, ... }
  const profileData = useMemo(() => {
    if (!rawData) return null;

    // Map CSV ablation keys to our internal toggle keys
    const csvKeyMap = {
      full: 'full',
      no_screen: 'noScreen',
      no_conform: 'noConform',
      div_stack: 'divStack',
      no_deskill: 'noDeskill',
      G2: 'g2',
    };

    const result = {};
    rawData.forEach((row) => {
      const pid = row.profile_id;
      if (!result[pid]) result[pid] = {};
      const internalKey = csvKeyMap[row.ablation];
      if (internalKey) {
        result[pid][internalKey] = Math.round(row.p99_theta);
      }
    });
    return result;
  }, [rawData]);

  // ── Current profile data ───────────────────────────────────────────────────
  const pData = profileData ? profileData[selectedProfile] : null;
  const fullVal = pData ? pData.full : 0;
  const profileColor = PROFILES[selectedProfile]?.color || '#22375A';

  // ── Compute current value (non-additive: min of active toggles) ────────────
  const currentVal = useMemo(() => {
    if (!pData || activeToggles.size === 0) return fullVal;
    let minVal = fullVal;
    activeToggles.forEach((key) => {
      if (pData[key] !== undefined && pData[key] < minVal) {
        minVal = pData[key];
      }
    });
    return minVal;
  }, [pData, activeToggles, fullVal]);

  // ── Sort ablation toggles by effect amplitude (most effective first) ─────────
  const sortedToggles = useMemo(() => {
    if (!pData) return ABLATION_DEFS;
    return [...ABLATION_DEFS].sort((a, b) => {
      const effA = (pData[a.key] || fullVal) - fullVal;
      const effB = (pData[b.key] || fullVal) - fullVal;
      return effA - effB; // most negative first
    });
  }, [pData, fullVal]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleToggle = useCallback((key) => {
    setActiveToggles((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const handleProfileSwitch = useCallback((pid) => {
    setSelectedProfile(pid);
    setActiveToggles(new Set()); // clear all toggles on profile switch
  }, []);

  const handleReset = useCallback(() => {
    setActiveToggles(new Set());
  }, []);

  // ── Derived display values ─────────────────────────────────────────────────
  const delta = currentVal - fullVal;
  const deltaPct = fullVal > 0 ? Math.round((delta / fullVal) * 100) : 0;
  const hasActiveToggles = activeToggles.size > 0;
  const showInteractionWarn =
    activeToggles.size > 1 &&
    !(selectedProfile === 'P5' && activeToggles.has('g2'));
  const showP5Banner =
    selectedProfile === 'P5' && activeToggles.has('g2');

  // ── Effect label for a single toggle ───────────────────────────────────────
  function getEffectLabel(toggleKey) {
    if (!pData) return { text: '', className: '' };
    const togVal = pData[toggleKey];
    if (togVal === undefined) return { text: '', className: '' };

    const tDelta = Math.round(((togVal - fullVal) / fullVal) * 100);
    const tAbs = Math.abs(togVal - fullVal);

    // Special case: P2 London + divStack
    if (toggleKey === 'divStack' && selectedProfile === 'P2') {
      return {
        text: 'minimal effect \u2014 stack already partially diversified (\u03b1=0.40)',
        color: '#C49A3C',
      };
    }

    if (togVal === fullVal) {
      return { text: 'no effect for this profile', color: '#C49A3C' };
    }
    if (togVal > fullVal) {
      return { text: `+${tDelta}% (worsens)`, color: '#B5403F' };
    }
    return {
      text: `${tDelta}%  (\u2212${tAbs.toLocaleString()})`,
      color: '#4A7C59',
    };
  }

  // ── Loading / error states ─────────────────────────────────────────────────
  if (loading) {
    return (
      <GraphCard
        id="cwi-ablation"
        title="What if you removed one risk driver?"
        subtitle={'Activate a structural intervention to see how much tail risk it removes. Effects are ablation results \u2014 each toggle removes one mechanism independently. Combining multiple toggles does not produce additive effects.'}
      >
        <GraphSkeleton height={400} />
      </GraphCard>
    );
  }

  if (error || !profileData) {
    return (
      <GraphCard
        id="cwi-ablation"
        title="What if you removed one risk driver?"
        subtitle="Activate a structural intervention to see how much tail risk it removes."
      >
        <div
          style={{
            padding: 24,
            color: '#B5403F',
            fontSize: 13,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          Failed to load ablation data{error ? `: ${error}` : '.'}
        </div>
      </GraphCard>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <GraphCard
      id="cwi-ablation"
      title="What if you removed one risk driver?"
      subtitle={'Activate a structural intervention to see how much tail risk it removes. Effects are ablation results \u2014 each toggle removes one mechanism independently. Combining multiple toggles does not produce additive effects.'}
    >
      {/* ── Profile selector buttons ─────────────────────────────────────── */}
      <div style={S.profileRow}>
        {PROFILE_META.map((p) => {
          const isActive = selectedProfile === p.id;
          return (
            <button
              key={p.id}
              style={{
                ...S.profBtn,
                ...(isActive
                  ? { ...S.profBtnActive, background: p.color }
                  : {}),
              }}
              onClick={() => handleProfileSwitch(p.id)}
            >
              <span style={{ ...S.profDot, background: p.color }} />
              {p.name}
            </button>
          );
        })}
      </div>

      {/* ── Main layout: bar left, toggles right ────────────────────────── */}
      <div style={S.mainLayout}>
        {/* ── Bar section ─────────────────────────────────────────────────── */}
        <div style={S.barSection}>
          <div style={S.barWrap}>
            <div style={S.barLabel}>
              P99&times;&theta; &mdash; risk-adjusted worst-case quarterly loss
            </div>
            <AblationBar
              fullVal={fullVal}
              currentVal={currentVal}
              profileColor={profileColor}
            />
            <div style={S.valRow}>
              <div>
                <div
                  style={{
                    ...S.valMain,
                    color: hasActiveToggles ? '#4A7C59' : '#22375A',
                  }}
                >
                  {currentVal.toLocaleString()}
                </div>
                <div style={S.valLabel}>current P99&times;&theta;</div>
              </div>
              {delta < 0 && (
                <div style={S.valDelta}>
                  {`${deltaPct}%\u00a0\u00a0(\u2212${Math.abs(delta).toLocaleString()})`}
                </div>
              )}
            </div>
          </div>

          {/* ── Interaction warning ──────────────────────────────────────── */}
          <div
            style={{
              ...S.interactionWarn,
              opacity: showInteractionWarn ? 1 : 0,
              height: showInteractionWarn ? 'auto' : 0,
              padding: showInteractionWarn ? '8px 12px' : 0,
              overflow: 'hidden',
              border: showInteractionWarn
                ? '0.5px solid rgba(196,154,60,0.28)'
                : 'none',
            }}
          >
            {'\u26a0'} Multiple interventions active. Effects interact &mdash;
            the combined reduction is not the sum of individual effects. Showing
            independent ablation estimates only.
          </div>
        </div>

        {/* ── Toggle section ──────────────────────────────────────────────── */}
        <div style={S.toggleSection}>
          {/* G2 governance ceiling — separated from ablations */}
          <div style={{ marginBottom: 4 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#22375A', marginBottom: 5,
              letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Governance ceiling
            </div>
            <div
              style={{
                ...S.toggleRow,
                background: activeToggles.has('g2') ? 'rgba(34,55,90,0.08)' : 'rgba(34,55,90,0.03)',
                borderColor: activeToggles.has('g2') ? 'rgba(34,55,90,0.30)' : 'rgba(34,55,90,0.14)',
              }}
              onClick={() => handleToggle('g2')}
            >
              <ToggleSwitch
                checked={activeToggles.has('g2')}
                onChange={() => handleToggle('g2')}
                activeColor="#22375A"
              />
              <div style={S.toggleText}>
                <div style={{ ...S.toggleName, color: '#22375A' }}>{G2_DEF.name}</div>
                <div style={S.toggleDesc}>{G2_DEF.desc}</div>
                <div style={{ ...S.toggleEffect, color: getEffectLabel('g2').color || '#22375A' }}>
                  {getEffectLabel('g2').text}
                </div>
              </div>
            </div>
            <div style={{ fontSize: 8, color: '#A0A09A', marginTop: 4, paddingLeft: 2, fontStyle: 'italic' }}>
              Upper bound &mdash; combining all interventions cannot exceed this
            </div>
          </div>

          {/* Ablation toggles */}
          <div style={{ fontSize: 9, fontWeight: 700, color: '#73726C', paddingBottom: 5,
            paddingTop: 6, borderTop: '0.5px solid rgba(0,0,0,0.08)',
            letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Structural interventions
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sortedToggles.map((t) => {
              const isActive = activeToggles.has(t.key);
              const effect = getEffectLabel(t.key);
              return (
                <div
                  key={t.key}
                  style={{ ...S.toggleRow, ...(isActive ? S.toggleRowActive : {}) }}
                  onClick={() => handleToggle(t.key)}
                >
                  <ToggleSwitch
                    checked={isActive}
                    onChange={() => handleToggle(t.key)}
                  />
                  <div style={S.toggleText}>
                    <div style={S.toggleName}>{t.name}</div>
                    <div style={S.toggleDesc}>{t.desc}</div>
                    <div style={{ ...S.toggleEffect, color: effect.color || '#4A7C59' }}>
                      {effect.text}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <button style={S.resetBtn} onClick={handleReset}>
            Reset all
          </button>
        </div>
      </div>

      {/* ── P5 counterproductive banner ────────────────────────────────── */}
      <div
        style={{
          ...S.p5Banner,
          opacity: showP5Banner ? 1 : 0,
          height: showP5Banner ? 'auto' : 0,
          padding: showP5Banner ? '10px 14px' : 0,
          marginBottom: showP5Banner ? 14 : 0,
          overflow: 'hidden',
          border: showP5Banner
            ? '0.5px solid rgba(181,64,63,0.35)'
            : 'none',
        }}
      >
        {'\u26d4'} For this profile, active governance is counterproductive. The
        velocity cost exceeds the risk reduction &mdash; scaffold benefit:
        &minus;36%. This grounds the Nash equilibrium argument.
      </div>

      {/* ── Bottom note ───────────────────────────────────────────────────── */}
      <div
        style={S.bottomNote}
        dangerouslySetInnerHTML={{ __html: NOTES[selectedProfile] || '' }}
      />

      {/* ── Disclaimer ────────────────────────────────────────────────────── */}
      <div style={S.disclaimer}>
        Independent ablation &mdash; one mechanism removed at a time. Effects
        are not additive. Based on v5 Monte Carlo simulation.
      </div>
    </GraphCard>
  );
}
