import { useState } from 'react';
import GraphCard from '../ui/GraphCard';
import { fmt } from '../../utils/helpers';

const NASH_THRESHOLD = 3.5;

// P3 Paris payoffs — v5 confirmed
const G0_OUTPUT = 1899;
const G2_OUTPUT = 1833;
const G0_P99   = 2041;
const G2_P99   = 1303; // NOT 1330

// Deltas calculated from constants — not hardcoded
const DELTA_POS = ((G0_OUTPUT - G2_OUTPUT) / G2_OUTPUT * 100).toFixed(1); // → "3.6"
const DELTA_NEG = ((G2_OUTPUT - G0_OUTPUT) / G0_OUTPUT * 100).toFixed(1); // → "-3.5"

const PAYOFFS = {
  outputG0: G0_OUTPUT,
  outputG2: G2_OUTPUT,
  p99G0: G0_P99,
  p99G2: G2_P99,
  pctGain: '+' + DELTA_POS + '%',
  pctLoss: DELTA_NEG + '%',
};

function getNash(pressure, regulated) {
  if (regulated) return 'pp';
  return pressure >= NASH_THRESHOLD ? 'gg' : 'pp';
}

const S = {
  layout: { display: 'grid', gridTemplateColumns: '1fr 240px', gap: 20, alignItems: 'start' },
  matrixTitle: { fontSize: 10, fontWeight: 600, color: '#73726C', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 },
  firmNote: { fontSize: 10, color: '#619EA8', fontWeight: 600, marginBottom: 6 },
  grid: { display: 'grid', gridTemplateColumns: '90px 1fr 1fr', gridTemplateRows: '40px 1fr 1fr', gap: 4 },
  mh: { display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: '#22375A', padding: 4 },
  mhFirmB: { background: 'rgba(97,158,168,0.10)', borderRadius: 6 },
  stratLabel: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, fontSize: 10, fontWeight: 600, color: '#22375A', paddingRight: 8, textAlign: 'right' },
  badge: { fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, flexShrink: 0 },
  badgeG0: { background: 'rgba(181,64,63,0.12)', color: '#B5403F' },
  badgeG2: { background: 'rgba(74,124,89,0.12)', color: '#4A7C59' },
  cell: { borderRadius: 8, padding: '10px 10px', display: 'flex', flexDirection: 'column', gap: 6, border: '1.5px solid transparent', transition: 'border-color 0.35s, background 0.35s, box-shadow 0.35s', cursor: 'default' },
  nash: { borderColor: '#B5403F', boxShadow: '0 0 0 2px rgba(181,64,63,0.15)' },
  pareto: { borderColor: '#4A7C59', boxShadow: '0 0 0 2px rgba(74,124,89,0.15)' },
  bgGG: { background: 'rgba(181,64,63,0.07)' },
  bgGP: { background: 'rgba(196,154,60,0.07)' },
  bgPP: { background: 'rgba(74,124,89,0.08)' },
  firm: { fontSize: 8, fontWeight: 600, color: '#A0A09A' },
  output: { fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 500, color: '#22375A' },
  riskHigh: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#B5403F' },
  riskLow: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#4A7C59' },
  note: { fontSize: 7.5, color: '#A0A09A', fontStyle: 'italic', marginTop: 2 },
  controls: { display: 'flex', flexDirection: 'column', gap: 14 },
  sliderSection: { background: '#F5F4EF', borderRadius: 8, padding: '10px 12px 10px' },
  sliderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 },
  sliderLabel: { fontSize: 10, fontWeight: 600, color: '#22375A' },
  sliderPct: { fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 500 },
  sliderEnds: { display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 8, color: '#A0A09A', fontFamily: "'JetBrains Mono', monospace" },
  nashCard: { borderRadius: 8, padding: 10, border: '0.5px solid rgba(0,0,0,0.08)', transition: 'background 0.4s, border-color 0.4s' },
  nashTrap: { background: 'rgba(181,64,63,0.07)', borderColor: 'rgba(181,64,63,0.30)' },
  nashOk: { background: 'rgba(74,124,89,0.07)', borderColor: 'rgba(74,124,89,0.30)' },
  nashTitle: { fontSize: 10, fontWeight: 600, marginBottom: 6 },
  nashVal: { fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700, marginBottom: 5 },
  nashDesc: { fontSize: 9, color: '#73726C', lineHeight: 1.5 },
  velocityCost: { background: '#F5F4EF', borderRadius: 7, padding: '10px 12px', fontSize: 9, color: '#73726C', lineHeight: 1.5 },
  regBtn: { width: '100%', padding: 10, borderRadius: 7, border: '0.5px solid rgba(74,124,89,0.40)', background: 'rgba(74,124,89,0.08)', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, fontWeight: 600, color: '#4A7C59', cursor: 'pointer', transition: 'all 0.2s' },
  regBtnDisabled: { opacity: 0.45, cursor: 'not-allowed', background: '#F5F4EF', color: '#A0A09A', borderColor: 'rgba(0,0,0,0.10)' },
  regNote: { fontSize: 9, color: '#A0A09A', marginTop: 5, lineHeight: 1.4 },
  threshNote: { fontSize: 9, fontStyle: 'italic', lineHeight: 1.4 },
  bottomNote: { background: 'rgba(34,55,90,0.04)', borderLeft: '2px solid rgba(34,55,90,0.20)', borderRadius: '0 6px 6px 0', padding: '8px 12px', fontSize: 10, color: '#22375A', lineHeight: 1.6, marginTop: 14 },
  disclaimer: { marginTop: 10, fontSize: 10, color: '#C0BFB9', fontStyle: 'italic', textAlign: 'right' },
  explain: { marginTop: 4 },
  explainToggle: { fontSize: 10, fontWeight: 600, color: '#619EA8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, userSelect: 'none', background: 'none', border: 'none', fontFamily: 'inherit' },
  explainBody: { fontSize: 10, color: '#73726C', lineHeight: 1.65, paddingTop: 10 },
  arrowHint: { fontSize: 9, color: '#A0A09A', marginTop: 4, fontStyle: 'italic' },
};

export default function DNASH_Game() {
  const [pressure, setPressure] = useState(0);
  const [regulated, setRegulated] = useState(false);
  const [explainOpen, setExplainOpen] = useState(false);

  const nash = getNash(pressure, regulated);

  const pctColor = pressure >= 15 ? '#B5403F' : pressure >= 3.5 ? '#C49A3C' : '#4A7C59';

  const cellStyle = (id) => {
    const bg = id === 'gg' ? S.bgGG : id === 'pp' ? S.bgPP : S.bgGP;
    let highlight = {};
    if (id === nash) {
      highlight = nash === 'gg' ? S.nash : S.pareto;
    }
    if (id === 'pp' && nash !== 'pp') {
      highlight = S.pareto;
    }
    return { ...S.cell, ...bg, ...highlight };
  };

  const nashState = regulated
    ? { cls: S.nashOk, title: 'Nash equilibrium (regulated)', titleColor: '#4A7C59', val: '(G2, G2)', valColor: '#4A7C59', desc: 'Regulation adds tail risk tax \u2014 G0 now costly. Both firms govern. Pareto optimal outcome restored.' }
    : nash === 'gg'
    ? { cls: S.nashTrap, title: 'Nash equilibrium \u2014 governance trap', titleColor: '#B5403F', val: '(G0, G0)', valColor: '#B5403F', desc: 'Competitive pressure makes G2 individually costly. Neither firm can defect first. Collective outcome is worse than either firm wants.' }
    : { cls: S.nashOk, title: 'Nash equilibrium', titleColor: '#4A7C59', val: '(G2, G2)', valColor: '#4A7C59', desc: 'No competitive pressure \u2014 both firms govern voluntarily. Pareto optimal outcome.' };

  return (
    <GraphCard
      id="d-nash"
      title={'The governance trap \u2014 why rational firms choose collective harm'}
      subtitle={'Two competing firms choose between unmanaged AI (G0) and active governance (G2). At low pressure, both govern. As pressure rises, each defects to G0; governance costs speed, and no firm can absorb that disadvantage unilaterally. The resulting Nash equilibrium traps both at the collectively worse outcome.'}
    >
      <div style={S.layout}>
        {/* Matrix */}
        <div>
          <div style={S.matrixTitle}>{'Payoff matrix \u2014 output \u00d7 tail risk for each strategy combination'}</div>
          <div style={S.firmNote}>You are Firm A. Firm B is your competitor.</div>

          <div style={S.grid}>
            {/* Header row */}
            <div style={S.mh} />
            <div style={{ ...S.mh, ...S.mhFirmB }}>Firm B: <span style={{ ...S.badge, ...S.badgeG0, marginLeft: 4 }}>G0</span></div>
            <div style={{ ...S.mh, ...S.mhFirmB }}>Firm B: <span style={{ ...S.badge, ...S.badgeG2, marginLeft: 4 }}>G2</span></div>

            {/* Row 1: A=G0 */}
            <div style={S.stratLabel}>Firm A: <span style={{ ...S.badge, ...S.badgeG0 }}>G0</span></div>

            {/* cell-gg */}
            <div style={cellStyle('gg')}>
              <div style={{ fontSize: 8, fontWeight: 600, color: '#B5403F', marginBottom: 2 }}>Both unmanaged</div>
              <div>
                <div style={S.output}>Output: <strong>{fmt(PAYOFFS.outputG0)}</strong> each &middot; P99&times;&theta;: {fmt(PAYOFFS.p99G0)} <span style={{ fontSize: 8 }}>(correlated)</span></div>
                <div style={S.riskHigh}></div>
              </div>
            </div>

            {/* cell-gp */}
            <div style={cellStyle('gp')}>
              <div>
                <div style={S.firm}>Firm A (G0)</div>
                <div style={S.output}>Output: <strong>{fmt(PAYOFFS.outputG0)}</strong> <span style={{ color: '#4A7C59', fontSize: 9 }}>{PAYOFFS.pctGain}</span></div>
                <div style={S.riskHigh}>P99&times;&theta;: {fmt(PAYOFFS.p99G0)}</div>
              </div>
              <div style={{ borderTop: '0.5px solid rgba(0,0,0,0.07)', paddingTop: 6 }}>
                <div style={S.firm}>Firm B (G2)</div>
                <div style={S.output}>Output: <strong>{fmt(PAYOFFS.outputG2)}</strong> <span style={{ color: '#B5403F', fontSize: 9 }}>{PAYOFFS.pctLoss}</span></div>
                <div style={S.riskLow}>P99&times;&theta;: {fmt(PAYOFFS.p99G2)}</div>
              </div>
            </div>

            {/* Row 2: A=G2 */}
            <div style={S.stratLabel}>Firm A: <span style={{ ...S.badge, ...S.badgeG2 }}>G2</span></div>

            {/* cell-pg */}
            <div style={cellStyle('pg')}>
              <div>
                <div style={S.firm}>Firm A (G2)</div>
                <div style={S.output}>Output: <strong>{fmt(PAYOFFS.outputG2)}</strong> <span style={{ color: '#B5403F', fontSize: 9 }}>{PAYOFFS.pctLoss}</span></div>
                <div style={S.riskLow}>P99&times;&theta;: {fmt(PAYOFFS.p99G2)}</div>
              </div>
              <div style={{ borderTop: '0.5px solid rgba(0,0,0,0.07)', paddingTop: 6 }}>
                <div style={S.firm}>Firm B (G0)</div>
                <div style={S.output}>Output: <strong>{fmt(PAYOFFS.outputG0)}</strong> <span style={{ color: '#4A7C59', fontSize: 9 }}>{PAYOFFS.pctGain}</span></div>
                <div style={S.riskHigh}>P99&times;&theta;: {fmt(PAYOFFS.p99G0)}</div>
              </div>
            </div>

            {/* cell-pp */}
            <div style={cellStyle('pp')}>
              <div style={{ fontSize: 8, fontWeight: 600, color: '#4A7C59', marginBottom: 2 }}>Both governed</div>
              <div>
                <div style={S.output}>Output: <strong>{fmt(PAYOFFS.outputG2)}</strong> each &middot; P99&times;&theta;: {fmt(PAYOFFS.p99G2)} <span style={{ fontSize: 8 }}>(independent)</span></div>
                <div style={S.riskLow}></div>
              </div>
            </div>
          </div>

          <div style={S.arrowHint}>
            Highlighted border = Nash equilibrium (red) or Pareto optimum (green). Slide the competitive pressure to shift the equilibrium.
          </div>

          {/* Explain accordion */}
          <div style={S.explain}>
            <button style={S.explainToggle} onClick={() => setExplainOpen(!explainOpen)}>
              {explainOpen ? '\u25be' : '\u25b8'} Why is (G0, G0) a Nash equilibrium?
            </button>
            {explainOpen && (
              <div style={S.explainBody}>
                A Nash equilibrium is a state where no player can improve their outcome by changing
                strategy alone. At (G0, G0): if Firm A unilaterally switches to G2, its output drops
                from {fmt(G0_OUTPUT)} to {fmt(G2_OUTPUT)} ({DELTA_NEG}%) while Firm B stays at {fmt(G0_OUTPUT)}. Under competitive pressure,
                this output gap translates to market share loss. Firm A cannot afford to defect first
                {'\u2014'} and neither can Firm B. Both firms are trapped. The only exit is a simultaneous
                binding commitment {'\u2014'} which is what regulation provides.
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div style={S.controls}>
          <div style={S.sliderSection}>
            <div style={S.sliderHeader}>
              <span style={S.sliderLabel}>Competitive pressure</span>
              <span style={{ ...S.sliderPct, color: pctColor }}>{pressure}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={15}
              step={0.5}
              value={pressure}
              onChange={(e) => { setPressure(Number(e.target.value)); setRegulated(false); }}
              style={{ width: '100%', accentColor: '#619EA8', cursor: 'pointer', background: 'linear-gradient(to right, #4A7C59, #C49A3C, #B5403F)', height: 6, borderRadius: 3 }}
            />
            <div style={S.sliderEnds}>
              <span>{'0% \u2014 no penalty'}</span>
              <span>{'15% \u2014 severe'}</span>
            </div>
          </div>

          {/* Nash status */}
          <div style={{ ...S.nashCard, ...nashState.cls }}>
            <div style={{ ...S.nashTitle, color: nashState.titleColor }}>{nashState.title}</div>
            <div style={{ ...S.nashVal, color: nashState.valColor }}>{nashState.val}</div>
            <div style={S.nashDesc}>{nashState.desc}</div>
          </div>

          {/* Velocity cost */}
          <div style={S.velocityCost}>
            <strong style={{ color: '#22375A' }}>Velocity cost of G2:</strong>{' '}
            Active governance reduces output by ~3.5% for this profile (&theta; drops from 1.25 to 1.10 {'\u2014'} a 12% reduction in throughput multiplier). Under competitive pressure, this output gap triggers market share loss {'\u2014'} making G2 individually irrational even when collectively optimal.
          </div>

          {/* Regulator button */}
          <div>
            <button
              style={{ ...S.regBtn, ...(regulated ? S.regBtnDisabled : {}) }}
              disabled={regulated}
              onClick={() => setRegulated(true)}
            >
              {regulated ? '\u2713 Regulator active \u2014 G2 mandated' : '\u2696 Add regulator \u2014 mandate G2 for all'}
            </button>
            <div style={S.regNote}>
              {regulated
                ? 'Tail risk tax in force. Nash = (G2,G2) regardless of competitive pressure. Remove by resetting pressure to 0%.'
                : 'Regulation adds a tail risk tax that makes G0 individually costly. Nash shifts back to (G2, G2) regardless of competitive pressure.'}
            </div>
          </div>

          {/* Threshold note */}
          <div style={{ ...S.threshNote, color: pressure >= NASH_THRESHOLD && !regulated ? '#B5403F' : '#A0A09A' }}>
            The Nash equilibrium shifts to (G0, G0) when competitive pressure exceeds ~3.5% {'\u2014'}
            at current simulation parameters (P3 Paris). The threshold varies with the velocity cost of
            governance and the time horizon of the firm.
          </div>
        </div>
      </div>

      {/* Bottom note */}
      <div style={S.bottomNote}>
        <strong>The tragedy of the cognitive commons:</strong>{' '}
        Each firm's rational choice destroys the collective resource {'\u2014'} cognitive diversity across
        the market. Under pressure, governance becomes a competitive disadvantage.
        The market will not self-correct. This is the structural argument for regulation:
        not because firms are irresponsible, but because the Nash equilibrium is at the wrong point.{' '}
        The failure lies in market structure, not intentions. Regulation that internalises the tail risk externality is the only mechanism that shifts the equilibrium without requiring any firm to act against its own interest.
      </div>

      <div style={S.disclaimer}>
        Payoffs derived from simulation outputs (P3 Paris). Market share effects assumed {'\u2014'} not simulated.
        Competitive pressure threshold (~3.5%) varies with velocity cost and time horizon.
      </div>
    </GraphCard>
  );
}
