import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Scroll to the top on every route change. `instant` on purpose:
// index.css sets `scroll-behavior: smooth` on <html>, and a smooth scroll
// on navigation reads as a glitch rather than a transition.
export default function useScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
}
