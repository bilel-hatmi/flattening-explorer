import { Outlet } from 'react-router-dom';
import SiteNav from './SiteNav';
import Footer from './Footer';
import useScrollToTop from '../../hooks/useScrollToTop';
import '../../prose-rich.css';

// Layout route for the personal site: one 44px bar, the page, a footer.
export default function SiteLayout() {
  useScrollToTop();
  return (
    <>
      <SiteNav />
      <main style={{ minHeight: 'calc(100vh - var(--nav-h))' }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
