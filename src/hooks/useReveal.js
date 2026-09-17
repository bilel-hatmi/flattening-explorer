import { useEffect, useRef, useState } from 'react';

// True once the element has entered the viewport (and stays true). Anything
// already inside the viewport at mount reveals at once; the rest waits for
// IntersectionObserver. Without the observer, or under reduced motion, it is
// true immediately so nothing is ever hidden.
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function useReveal({ rootMargin = '0px 0px -8% 0px', threshold = 0.08 } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (!('IntersectionObserver' in window) || prefersReducedMotion()) { setInView(true); return undefined; }

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) { setInView(true); return undefined; }

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); io.disconnect(); }
    }, { rootMargin, threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin, threshold]);

  return [ref, inView];
}

// Counts from 0 to `target` once `active` is true; eased, ~1.4s.
export function useCountUp(target, active, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return undefined;
    if (prefersReducedMotion()) { setValue(target); return undefined; }
    let raf;
    const t0 = performance.now();
    const step = now => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);
  return value;
}
