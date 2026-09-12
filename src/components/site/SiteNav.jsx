import { NavLink, Link } from 'react-router-dom';
import useIsMobile from '../../hooks/useIsMobile';
import { SITE_META, NAV_LINKS, PERSON } from '../../content/site';
import { SITE } from '../../routes';

// Same shell as the explorer's Nav (sticky, 44px, navy) so the two sites
// read as one. On mobile the items sit in a horizontally scrollable strip,
// the pattern ScrollSections already uses for the act bar.
export default function SiteNav() {
  const isMobile = useIsMobile();

  const itemStyle = ({ isActive }) => ({
    color: '#FFFFFF', fontSize: isMobile ? 12 : 13, fontWeight: isActive ? 600 : 400,
    padding: isMobile ? '6px 9px' : '6px 14px', borderRadius: 5,
    background: isActive ? 'rgba(255,255,255,0.12)' : 'none',
    opacity: isActive ? 1 : 0.65, textDecoration: 'none', whiteSpace: 'nowrap',
    transition: 'opacity 0.15s',
  });

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 1000, height: 'var(--nav-h)',
      background: 'var(--navy)', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: isMobile ? '0 12px' : '0 20px',
      fontFamily: 'var(--font-body)', gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 1 }}>
        <Link
          to={SITE.home}
          style={{
            fontFamily: 'var(--font-title)', fontSize: isMobile ? 15 : 17, fontWeight: 400,
            color: '#FFFFFF', marginRight: isMobile ? 10 : 24, letterSpacing: '-0.01em',
            whiteSpace: 'nowrap', textDecoration: 'none',
          }}
        >
          {SITE_META.name}
        </Link>
        <div style={{
          display: 'flex', alignItems: 'center', gap: isMobile ? 2 : 4,
          overflowX: isMobile ? 'auto' : 'visible', scrollbarWidth: 'none', minWidth: 0,
        }}>
          {NAV_LINKS.map(item => (
            <NavLink key={item.to} to={item.to} style={itemStyle} end={item.to === SITE.home}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.95'; }}
              onMouseLeave={e => { if (!e.currentTarget.getAttribute('aria-current')) e.currentTarget.style.opacity = '0.65'; }}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
      <a href={`mailto:${PERSON.email}`} style={{
        color: '#FFFFFF', fontSize: isMobile ? 11 : 12, fontWeight: 500,
        padding: isMobile ? '5px 9px' : '5px 14px',
        border: '1px solid rgba(255,255,255,0.20)', borderRadius: 5,
        textDecoration: 'none', opacity: 0.8, whiteSpace: 'nowrap', flexShrink: 0,
      }}>
        Contact
      </a>
    </nav>
  );
}
