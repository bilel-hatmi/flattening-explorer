import { useState, useEffect } from 'react';

// Single source of truth for the mobile breakpoint.
// The app is styled with inline style objects (no CSS media queries),
// so components branch on this boolean: style={isMobile ? mobileStyle : desktopStyle}.
export const MOBILE_QUERY = '(max-width: 768px)';

export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const onChange = (e) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}
