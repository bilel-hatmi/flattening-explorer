/**
 * Shared utility functions for The Flattening Explorer
 */

/** Convert hex color to rgba string */
export function hexToRgba(hex, a) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

/** Format number with locale-aware thousands separator */
export function fmt(n) {
  return Math.round(n).toLocaleString();
}

/** Build KDE (kernel density estimate) from histogram bins */
export function buildKDE(bins, bandwidth = 60) {
  const N = 500;
  const xs = Array.from({ length: N }, (_, i) => i * 5);
  const points = bins
    .filter(b => +b.count > 0)
    .map(b => ({ x: (+b.lo + +b.hi) / 2, w: +b.count }));
  const totalW = points.reduce((s, p) => s + p.w, 0);
  if (totalW === 0) return xs.map(x => ({ x, y: 0 }));
  const bw2 = bandwidth * bandwidth;
  const norm = bandwidth * Math.sqrt(2 * Math.PI);
  return xs.map(x => ({
    x,
    y: points.reduce(
      (sum, p) => sum + (p.w / totalW) * Math.exp(-0.5 * ((x - p.x) ** 2) / bw2) / norm,
      0
    ),
  }));
}
