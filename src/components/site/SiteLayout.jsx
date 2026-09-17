import { Outlet, useLocation } from 'react-router-dom';
import SiteNav from './SiteNav';
import Footer from './Footer';
import useScrollToTop from '../../hooks/useScrollToTop';
import '../../prose-rich.css';
import '../../motion.css';

// Layout route for the personal site: one 44px bar, the page, a footer.
// The page is keyed by its path so each route change fades the new page in.
export default function SiteLayout() {
  useScrollToTop();
  const { pathname } = useLocation();
  return (
    <>
      <SiteNav />
      <main key={pathname} className="page-enter" style={{ minHeight: 'calc(100vh - var(--nav-h))' }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
