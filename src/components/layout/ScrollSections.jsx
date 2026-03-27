import { useProfile } from '../../context/ProfileContext';
import { PROFILES } from '../../data/v5_reference';
import ActA from '../../sections/ActA';
import ActB from '../../sections/ActB';
import ActC from '../../sections/ActC';
import ActD from '../../sections/ActD';
import Lab from '../../pages/Lab';

const SECTIONS = [
  { id: 0, num: 'I',   label: 'The paradox',          Component: ActA },
  { id: 1, num: 'II',  label: 'The mechanisms',        Component: ActB },
  { id: 2, num: 'III', label: 'The levers',            Component: ActC },
  { id: 3, num: 'IV',  label: 'The systemic picture',  Component: ActD },
  { id: 4, num: null,  label: 'Parameter explorer',    Component: Lab,  isLab: true },
];

const SIDEBAR_W = 230;

function NumCircle({ num, active }) {
  return (
    <svg width={26} height={26} viewBox="0 0 26 26" style={{ flexShrink: 0 }}>
      <circle cx={13} cy={13} r={12}
        fill={active ? '#619EA8' : 'transparent'}
        stroke={active ? '#619EA8' : 'rgba(255,255,255,0.20)'}
        strokeWidth={1.2}
      />
      <text x={13} y={14} textAnchor="middle" dominantBaseline="central"
        fontFamily="'JetBrains Mono', monospace" fontSize={10} fontWeight={600}
        fill={active ? '#FFFFFF' : 'rgba(255,255,255,0.50)'}
      >
        {num}
      </text>
    </svg>
  );
}

function ProfileBadge() {
  const { profileId } = useProfile();
  if (!profileId) return null;
  const p = PROFILES[profileId];
  if (!p) return null;
  return (
    <div style={{
      margin: '0 16px 14px', padding: '12px 14px', borderRadius: 8,
      background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.08)',
    }}>
      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.40)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
        Your profile
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: p.color, marginBottom: 2 }}>{p.name}</div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>{p.city}</div>
      <div style={{
        display: 'inline-block', padding: '2px 7px', borderRadius: 3,
        background: 'rgba(255,255,255,0.06)', fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10, color: 'rgba(255,255,255,0.65)', fontWeight: 500,
      }}>
        P99{'\u00d7'}{'\u03b8'} {p.p99G0.toLocaleString()}
      </div>
    </div>
  );
}

export default function ScrollSections({ currentAct, setCurrentAct }) {
  const Section = SECTIONS[currentAct];
  const Component = Section.Component;

  const goTo = (idx) => {
    setCurrentAct(idx);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 44px)' }}>

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside style={{
        width: SIDEBAR_W, flexShrink: 0,
        background: '#1B2D4A',
        position: 'sticky', top: 44, height: 'calc(100vh - 44px)',
        display: 'flex', flexDirection: 'column',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        overflowY: 'auto',
      }}>
        <div style={{ padding: '16px 0 6px' }}>
          <ProfileBadge />
        </div>

        {/* Actes */}
        {SECTIONS.filter(s => !s.isLab).map(s => {
          const active = s.id === currentAct;
          return (
            <button key={s.id} onClick={() => goTo(s.id)} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              width: '100%', textAlign: 'left',
              padding: '12px 16px', border: 'none', cursor: 'pointer',
              background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
              borderLeft: `3px solid ${active ? '#619EA8' : 'transparent'}`,
              transition: 'all 0.12s',
            }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? 'rgba(255,255,255,0.08)' : 'transparent'; }}
            >
              <NumCircle num={s.num} active={active} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: active ? '#FFFFFF' : 'rgba(255,255,255,0.55)', lineHeight: 1.2 }}>
                  Acte {s.num}
                </div>
                <div style={{ fontSize: 11, color: active ? '#619EA8' : 'rgba(255,255,255,0.28)', marginTop: 2 }}>
                  {s.label}
                </div>
              </div>
            </button>
          );
        })}

        {/* Separator */}
        <div style={{ height: '0.5px', background: 'rgba(255,255,255,0.06)', margin: '10px 16px' }} />

        {/* Lab */}
        {(() => {
          const labSection = SECTIONS.find(s => s.isLab);
          const active = currentAct === labSection.id;
          return (
            <button onClick={() => goTo(labSection.id)} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              width: '100%', textAlign: 'left',
              padding: '12px 16px', border: 'none', cursor: 'pointer',
              background: active ? 'rgba(97,158,168,0.12)' : 'transparent',
              borderLeft: `3px solid ${active ? '#619EA8' : 'transparent'}`,
              transition: 'all 0.12s',
            }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? 'rgba(97,158,168,0.12)' : 'transparent'; }}
            >
              <svg width={26} height={26} viewBox="0 0 26 26" style={{ flexShrink: 0 }}>
                <rect x={3} y={3} width={20} height={20} rx={4}
                  fill={active ? '#619EA8' : 'transparent'}
                  stroke={active ? '#619EA8' : 'rgba(255,255,255,0.20)'}
                  strokeWidth={1.2}
                />
                <text x={13} y={14} textAnchor="middle" dominantBaseline="central"
                  fontFamily="'JetBrains Mono', monospace" fontSize={9} fontWeight={600}
                  fill={active ? '#FFFFFF' : 'rgba(255,255,255,0.50)'}
                >
                  LAB
                </text>
              </svg>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: active ? '#FFFFFF' : 'rgba(255,255,255,0.55)', lineHeight: 1.2 }}>
                  Lab
                </div>
                <div style={{ fontSize: 11, color: active ? '#619EA8' : 'rgba(255,255,255,0.28)', marginTop: 2 }}>
                  Parameter explorer
                </div>
              </div>
            </button>
          );
        })()}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Bottom nav */}
        <div style={{ padding: '10px 16px', borderTop: '0.5px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8 }}>
          {currentAct > 0 && (
            <button onClick={() => goTo(currentAct - 1)} style={{
              flex: 1, padding: '7px 0', borderRadius: 5,
              border: '0.5px solid rgba(255,255,255,0.12)', background: 'transparent',
              fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
              {'\u2190'} Prev
            </button>
          )}
          {currentAct < SECTIONS.length - 1 && (
            <button onClick={() => goTo(currentAct + 1)} style={{
              flex: 1, padding: '7px 0', borderRadius: 5,
              border: 'none', background: '#619EA8',
              fontSize: 11, fontWeight: 600, color: '#FFFFFF', cursor: 'pointer',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
              Next {'\u2192'}
            </button>
          )}
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────── */}
      <main style={{ flex: 1, minWidth: 0, padding: Section.isLab ? '0' : '12px 20px 32px', background: '#F5F4EF' }}>
        <Component key={currentAct} />
      </main>
    </div>
  );
}
