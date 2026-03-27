import { useNavigate, useLocation } from 'react-router-dom';

const ExploreIcon = ({ opacity }) => (
  <svg width={14} height={14} viewBox="0 0 14 14" fill="none" style={{ opacity }}>
    <circle cx={6} cy={6} r={4.5} stroke="#FFFFFF" strokeWidth={1.3} fill="none" />
    <line x1={9.5} y1={9.5} x2={12.5} y2={12.5} stroke="#FFFFFF" strokeWidth={1.3} strokeLinecap="round" />
  </svg>
);

const ModelIcon = ({ opacity }) => (
  <svg width={14} height={14} viewBox="0 0 14 14" fill="none" style={{ opacity }}>
    <text x={7} y={11} textAnchor="middle" fontFamily="serif" fontSize={13} fontWeight={700} fill="#FFFFFF">
      {'\u03A3'}
    </text>
  </svg>
);

const AboutIcon = ({ opacity }) => (
  <svg width={14} height={14} viewBox="0 0 14 14" fill="none" style={{ opacity }}>
    <circle cx={7} cy={4} r={2.5} fill="#FFFFFF" />
    <path d="M2.5 13 C2.5 9.5 11.5 9.5 11.5 13" fill="#FFFFFF" />
  </svg>
);

const NAV_ICONS = { Explore: ExploreIcon, Model: ModelIcon, About: AboutIcon };

const NAV_ITEMS = [
  { label: 'Explore', route: '/explore' },
  { label: 'Model',   route: '/model' },
  { label: 'About',   route: '/about' },
];

export default function Nav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 1000, height: 44,
      background: '#22375A', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 20px',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span
          style={{ fontFamily: "'Instrument Serif', serif", fontSize: 17, fontWeight: 400, color: '#FFFFFF', marginRight: 24, cursor: 'pointer', letterSpacing: '-0.01em' }}
          onClick={() => navigate('/')}
        >
          The Flattening
        </span>
        {NAV_ITEMS.map(item => {
          const active = location.pathname === item.route || (item.route === '/explore' && location.pathname.startsWith('/explore'));
          const Icon = NAV_ICONS[item.label];
          return (
            <button key={item.label} onClick={() => navigate(item.route)} style={{
              background: active ? 'rgba(255,255,255,0.12)' : 'none',
              border: 'none', color: '#FFFFFF', fontSize: 13, fontWeight: active ? 600 : 400,
              cursor: 'pointer', padding: '6px 16px', borderRadius: 5,
              fontFamily: 'inherit', opacity: active ? 1 : 0.65, transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.opacity = '0.9'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.opacity = '0.65'; }}
            >
              {Icon && <Icon opacity={active ? 1 : 0.65} />}
              {item.label}
            </button>
          );
        })}
      </div>
      <a href="/docs/essay_prize.pdf" target="_blank" rel="noopener noreferrer" style={{
        color: '#FFFFFF', fontSize: 12, fontWeight: 500, padding: '5px 14px',
        border: '1px solid rgba(255,255,255,0.20)', borderRadius: 5,
        textDecoration: 'none', fontFamily: 'inherit', opacity: 0.8,
      }}>
        Read the essay
      </a>
    </nav>
  );
}
