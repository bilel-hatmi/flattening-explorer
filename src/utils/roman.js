// 1 → I, 4 → IV, 9 → IX … used for section numbers across the site.
const PAIRS = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];

export default function roman(n) {
  let out = '';
  let rest = Math.max(0, Math.floor(n));
  for (const [value, glyph] of PAIRS) {
    while (rest >= value) { out += glyph; rest -= value; }
  }
  return out;
}
