import { useRef, useState, useCallback, useMemo } from 'react';
import GraphCard from '../ui/GraphCard';
import GraphSkeleton from '../ui/GraphSkeleton';
import { useCSV } from '../../hooks/useCSV';
import { fmt } from '../../utils/helpers';

// ── SVG LAYOUT ────────────────────────────────────────────────────────────────
const SVG_W = 680, SVG_H = 200;
const PAD = { l: 62, r: 58, t: 20, b: 32 };
const cW = SVG_W - PAD.l - PAD.r;
const cH = SVG_H - PAD.t - PAD.b;
const Y_MIN = 1000, Y_MAX = 2350;
const A_MIN = 0.08, A_MAX = 0.97;
const N_PTS = 120;
const CROSSOVER_ALPHA = 0.35;
const TARGET_EPI = 0.5;

function xPx(a) { return PAD.l + (a - A_MIN) / (A_MAX - A_MIN) * cW; }
function yPx(val) { return PAD.t + cH * (1 - (val - Y_MIN) / (Y_MAX - Y_MIN)); }

// ── NATURAL CUBIC SPLINE ──────────────────────────────────────────────────────
function cubicSpline(xs, ys) {
  const n = xs.length;
  if (n < 2) return { xs, ys, h: [], b: [], c: [], d: [] };
  const h = xs.map((x, i) => i < n - 1 ? xs[i + 1] - x : 0);
  const alpha_ = Array(n).fill(0);
  for (let i = 1; i < n - 1; i++) {
    alpha_[i] = (3 / h[i]) * (ys[i + 1] - ys[i]) - (3 / h[i - 1]) * (ys[i] - ys[i - 1]);
  }
  const l = Array(n).fill(1), mu = Array(n).fill(0), z = Array(n).fill(0);
  for (let i = 1; i < n - 1; i++) {
    l[i] = 2 * (xs[i + 1] - xs[i - 1]) - h[i - 1] * mu[i - 1];
    mu[i] = h[i] / l[i];
    z[i] = (alpha_[i] - h[i - 1] * z[i - 1]) / l[i];
  }
  const c = Array(n).fill(0), b = Array(n).fill(0), d = Array(n).fill(0);
  for (let j = n - 2; j >= 0; j--) {
    c[j] = z[j] - mu[j] * c[j + 1];
    b[j] = (ys[j + 1] - ys[j]) / h[j] - h[j] * (c[j + 1] + 2 * c[j]) / 3;
    d[j] = (c[j + 1] - c[j]) / (3 * h[j]);
  }
  return { xs, ys, h, b, c, d };
}

function evalSpline(sp, x) {
  const { xs, ys, b, c, d } = sp;
  if (!xs || xs.length < 2) return 0;
  let i = xs.length - 2;
  for (let j = 0; j < xs.length - 1; j++) {
    if (x <= xs[j + 1]) { i = j; break; }
  }
  const dx = x - xs[i];
  return ys[i] + b[i] * dx + c[i] * dx * dx + d[i] * dx * dx * dx;
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
function pathD(points, key) {
  return points.map((p, i) =>
    (i === 0 ? 'M' : 'L') + xPx(p.a).toFixed(1) + ',' + yPx(p[key]).toFixed(1)
  ).join(' ');
}

// Y-axis gridlines
const Y_TICKS = [1200, 1400, 1600, 1800, 2000, 2200];

// ── COMPONENT ─────────────────────────────────────────────────────────────────
export default function C2_P99Alpha() {
  const svgRef = useRef(null);
  const [hover, setHover] = useState(null);
  const { data, loading } = useCSV('heatmap_alpha_pi_b030.csv');

  // Extract data points from CSV: filter by epi_mean closest to 0.5 (P3's domain)
  const { dataPoints, BASELINE, spG0, spG1, spG2 } = useMemo(() => {
    if (!data) return { dataPoints: [], BASELINE: 1097, spG0: null, spG1: null, spG2: null };

    // Filter rows where epi_mean === TARGET_EPI
    const epiRows = data.filter(r => +r.epi_mean === TARGET_EPI);

    // Get baseline value (constant across all alpha values)
    const baselineRow = epiRows.find(r => r.scenario === 'baseline');
    const baseVal = baselineRow ? +baselineRow.p99_theta : 1097;

    // Extract G0 rows, sorted by alpha
    const g0Rows = epiRows
      .filter(r => r.scenario === 'G0')
      .sort((a, b) => a.alpha - b.alpha);

    // Extract G2 rows, sorted by alpha
    const g2Rows = epiRows
      .filter(r => r.scenario === 'G2')
      .sort((a, b) => a.alpha - b.alpha);

    // Build data points array — merge G0 and G2 by alpha
    const alphaSet = [...new Set([...g0Rows.map(r => +r.alpha), ...g2Rows.map(r => +r.alpha)])].sort((a, b) => a - b);
    const g0Map = Object.fromEntries(g0Rows.map(r => [+r.alpha, +r.p99_theta]));
    const g2Map = Object.fromEntries(g2Rows.map(r => [+r.alpha, +r.p99_theta]));

    const pts = alphaSet.map(alpha => ({
      alpha,
      G0: g0Map[alpha] || 0,
      G2: g2Map[alpha] || 0,
      base: baseVal,
    }));

    // G1 interpolated: G1 = G0 + 0.36 × (G2 − G0)
    // Weight 0.36 from central-case: (2135−1913)/(2135−1521)
    const ptsWithG1 = pts.map(r => ({ ...r, G1: r.G0 + 0.36 * (r.G2 - r.G0) }));

    // Build splines from actual data points
    const alphaVals = ptsWithG1.map(r => r.alpha);
    const splineG0 = cubicSpline(alphaVals, ptsWithG1.map(r => r.G0));
    const splineG1 = cubicSpline(alphaVals, ptsWithG1.map(r => r.G1));
    const splineG2 = cubicSpline(alphaVals, ptsWithG1.map(r => r.G2));

    return { dataPoints: ptsWithG1, BASELINE: baseVal, spG0: splineG0, spG1: splineG1, spG2: splineG2 };
  }, [data]);

  // Compute curve points for smooth rendering
  const curvePoints = useMemo(() => {
    if (!spG0 || !spG1 || !spG2) return [];
    return Array.from({ length: N_PTS }, (_, i) => {
      const a = A_MIN + (A_MAX - A_MIN) * i / (N_PTS - 1);
      return { a, G0: evalSpline(spG0, a), G1: evalSpline(spG1, a), G2: evalSpline(spG2, a), base: BASELINE };
    });
  }, [spG0, spG1, spG2, BASELINE]);

  // Build polygon points for shading regions
  const shadings = useMemo(() => {
    if (curvePoints.length === 0) return { redPoly: '', greenPoly: '', crossPoly: '' };

    // Red residual: G2 above baseline
    const residualPts = curvePoints.filter(p => p.G2 > BASELINE);
    let redPoly = '';
    if (residualPts.length > 1) {
      const top = residualPts.map(p => `${xPx(p.a).toFixed(1)},${yPx(p.G2).toFixed(1)}`).join(' ');
      const bot = [...residualPts].reverse().map(p => `${xPx(p.a).toFixed(1)},${yPx(BASELINE).toFixed(1)}`).join(' ');
      redPoly = top + ' ' + bot;
    }

    // Green governance: G0 above G2 (full range)
    const topG0 = curvePoints.map(p => `${xPx(p.a).toFixed(1)},${yPx(p.G0).toFixed(1)}`).join(' ');
    const botG2 = [...curvePoints].reverse().map(p => `${xPx(p.a).toFixed(1)},${yPx(p.G2).toFixed(1)}`).join(' ');
    const greenPoly = topG0 + ' ' + botG2;

    // Green crossover triangle: G2 below baseline
    const crossPts = curvePoints.filter(p => p.G2 < BASELINE);
    let crossPoly = '';
    if (crossPts.length > 1) {
      const top = crossPts.map(p => `${xPx(p.a).toFixed(1)},${yPx(BASELINE).toFixed(1)}`).join(' ');
      const bot = [...crossPts].reverse().map(p => `${xPx(p.a).toFixed(1)},${yPx(p.G2).toFixed(1)}`).join(' ');
      crossPoly = top + ' ' + bot;
    }

    return { redPoly, greenPoly, crossPoly };
  }, [curvePoints, BASELINE]);

  // X-axis labels — derived from data points
  const X_LABELS = useMemo(() => {
    const labelMap = {
      0.10: '3+ providers by layer',
      0.20: 'Diversified stack',
      0.30: 'Multiple alternatives',
      0.45: 'Primary + secondary',
      0.60: 'Dominant + backup',
      0.70: 'One dominant provider',
      0.85: 'Near-monopoly',
      0.95: 'Single vendor',
    };
    return dataPoints.map(pt => ({
      a: pt.alpha,
      main: `\u03B1 = ${pt.alpha.toFixed(2)}`,
      sub: labelMap[pt.alpha] || '',
    }));
  }, [dataPoints]);

  // Compute delta card values from actual data
  const deltaCards = useMemo(() => {
    if (dataPoints.length === 0) return { high: null, low: null };

    // Find the highest-alpha data point
    const highAlpha = dataPoints[dataPoints.length - 1];
    // Find the lowest-alpha data point
    const lowAlpha = dataPoints[0];

    return {
      high: highAlpha ? {
        alpha: highAlpha.alpha,
        G0: highAlpha.G0,
        G1: highAlpha.G1,
        G2: highAlpha.G2,
        base: BASELINE,
        g0Pct: Math.round((highAlpha.G0 / BASELINE - 1) * 100),
        g1Pct: Math.round((highAlpha.G1 / BASELINE - 1) * 100),
        g2Pct: Math.round((highAlpha.G2 / BASELINE - 1) * 100),
      } : null,
      low: lowAlpha ? {
        alpha: lowAlpha.alpha,
        G0: lowAlpha.G0,
        G1: lowAlpha.G1,
        G2: lowAlpha.G2,
        base: BASELINE,
        g0Pct: Math.round((lowAlpha.G0 / BASELINE - 1) * 100),
        g1Pct: Math.round((lowAlpha.G1 / BASELINE - 1) * 100),
        g2Pct: Math.round((lowAlpha.G2 / BASELINE - 1) * 100),
      } : null,
    };
  }, [dataPoints, BASELINE]);

  // Hover handler
  const handleMouseMove = useCallback((e) => {
    if (!spG0 || !spG2) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / rect.width * SVG_W;
    const a = A_MIN + (mx - PAD.l) / cW * (A_MAX - A_MIN);
    if (a < A_MIN || a > A_MAX) { setHover(null); return; }
    const g0v = evalSpline(spG0, a);
    const g1v = evalSpline(spG1, a);
    const g2v = evalSpline(spG2, a);
    setHover({ a, g0v, g1v, g2v, xp: xPx(a) });
  }, [spG0, spG2]);

  const handleMouseLeave = useCallback(() => setHover(null), []);

  // Show skeleton while loading
  if (loading || !data) {
    return (
      <GraphCard
        id="c2-p99-alpha"
        title={'Stack diversification \u2014 the most powerful single lever'}
        subtitle="Loading data..."
      >
        <GraphSkeleton height={400} />
      </GraphCard>
    );
  }

  // Crossover annotation values
  const g2AtCross = spG2 ? evalSpline(spG2, CROSSOVER_ALPHA) : BASELINE;
  const xCross = xPx(CROSSOVER_ALPHA);
  const annW = 130, annH = 38;
  const annX = xCross - annW - 12;
  const annY = PAD.t + 2; // Force annotation to top of chart

  // +29% bracket values — use highest-alpha data point
  const highPt = dataPoints[dataPoints.length - 1];
  const bracketAlpha = highPt ? highPt.alpha : 0.95;
  const xRight = xPx(bracketAlpha);
  const yG2right = highPt ? yPx(highPt.G2) : yPx(BASELINE);
  const yBaseRight = yPx(BASELINE);
  const yBracketMid = (yG2right + yBaseRight) / 2;
  const bracketPct = highPt ? Math.round((highPt.G2 / BASELINE - 1) * 100) : 0;

  // Zone label positions
  const midRedX = xPx(0.68);
  const yRedMid = spG2 ? (yPx(evalSpline(spG2, 0.68)) + yPx(BASELINE)) / 2 : yPx(BASELINE);
  const midGrnX = xPx(0.56);
  const yGrnMid = (spG0 && spG2) ? (yPx(evalSpline(spG0, 0.56)) + yPx(evalSpline(spG2, 0.56))) / 2 : yPx(BASELINE);

  // Curve path strings
  const pathG0 = pathD(curvePoints, 'G0');
  const pathG2d = pathD(curvePoints, 'G2');

  // Tooltip positioning
  let tipX = 0, tipY = PAD.t + 10;
  if (hover) {
    tipX = hover.xp + 10;
    if (tipX + 160 > PAD.l + cW) tipX = hover.xp - 170;
  }

  return (
    <GraphCard
      id="c2-p99-alpha"
      title={'Stack diversification \u2014 the most powerful single lever'}
      subtitle={'P99 worst-case quarterly loss as a function of AI stack concentration (\u03B1). When \u03B1 = 1.0, a single provider handles all decisions; at \u03B1 = 0, the stack is fully diversified. Below \u03B1 \u2248 0.35, active governance eliminates all excess tail risk \u2014 P99 falls below the pre-AI baseline.'}
    >
      {/* Legend */}
      <div style={legendRow}>
        <div style={legItem}>
          <span style={{ ...legLine, borderTop: '2.5px solid #B5403F' }} />
          <span style={legText}>Unmanaged AI (G0)</span>
        </div>
        <div style={legItem}>
          <span style={{ ...legLine, borderTop: '2px dashed #C49A3C' }} />
          <span style={legText}>Light governance (G1)</span>
        </div>
        <div style={legItem}>
          <span style={{ ...legLine, borderTop: '2.5px solid #4A7C59' }} />
          <span style={legText}>Active governance (G2)</span>
        </div>
        <div style={legItem}>
          <span style={{ ...legLine, borderTop: '2px dashed #888780' }} />
          <span style={legText}>No-AI baseline</span>
        </div>
      </div>

      {/* SVG Chart */}
      <div style={{ position: 'relative', width: '100%', marginBottom: 8 }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          style={{ display: 'block', width: '100%', overflow: 'visible' }}
        >
          <defs>
            <clipPath id="c2-chart-clip">
              <rect x={PAD.l} y={PAD.t} width={cW} height={cH} />
            </clipPath>
          </defs>

          {/* 1. Gridlines + Y ticks */}
          {Y_TICKS.map(v => {
            const y = yPx(v);
            return (
              <g key={`grid-${v}`}>
                <line
                  x1={PAD.l} y1={y} x2={PAD.l + cW} y2={y}
                  stroke="rgba(0,0,0,0.05)" strokeWidth={1} strokeDasharray="3 5"
                />
                <text
                  x={PAD.l - 6} y={y + 3.5}
                  textAnchor="end"
                  fontFamily="'JetBrains Mono', monospace"
                  fontSize={9} fill="#A0A09A"
                >
                  {(v / 1000).toFixed(1)}k
                </text>
              </g>
            );
          })}

          {/* 2. Y-axis label */}
          <text
            transform={`translate(12, ${PAD.t + cH / 2}) rotate(-90)`}
            textAnchor="middle"
            fontFamily="'Plus Jakarta Sans', sans-serif"
            fontSize={10} fontWeight={600} fill="#22375A"
          >
            P99 quarterly loss (total errors)
          </text>

          {/* 3–8. Chart data — clipped to chart area */}
          <g clipPath="url(#c2-chart-clip)">
            {/* Red residual shading */}
            {shadings.redPoly && (
              <polygon points={shadings.redPoly} fill="rgba(181,64,63,0.10)" />
            )}
            {/* Green governance shading */}
            {shadings.greenPoly && (
              <polygon points={shadings.greenPoly} fill="rgba(74,124,89,0.08)" />
            )}
            {/* Green crossover triangle */}
            {shadings.crossPoly && (
              <polygon points={shadings.crossPoly} fill="rgba(74,124,89,0.15)" />
            )}
            {/* G0 curve */}
            <path d={pathG0} fill="none" stroke="#B5403F" strokeWidth={2.5} strokeLinecap="round" />
            {/* G1 curve (interpolated, amber dashed) */}
            <path d={pathD(curvePoints, 'G1')} fill="none" stroke="#C49A3C" strokeWidth={2} strokeLinecap="round" strokeDasharray="5 3" />
            {/* G2 curve */}
            <path d={pathG2d} fill="none" stroke="#4A7C59" strokeWidth={2.5} strokeLinecap="round" />
          </g>

          {/* 5. Baseline flat line (unclipped — spans full width) */}
          <line
            x1={PAD.l} y1={yPx(BASELINE)} x2={PAD.l + cW} y2={yPx(BASELINE)}
            stroke="#888780" strokeWidth={1.8} strokeDasharray="5 4" opacity={0.8}
          />
          <text
            x={PAD.l + cW + 4} y={yPx(BASELINE) + 4}
            fontFamily="'Plus Jakarta Sans', sans-serif"
            fontSize={9} fill="#888780"
          >
            no-AI baseline
          </text>

          {/* 9. Zone labels */}
          {/* Red zone label */}
          <text
            x={midRedX} y={yRedMid + 4} textAnchor="middle"
            fontFamily="'Plus Jakarta Sans', sans-serif"
            fontSize={8.5} fontWeight={600} fill="rgba(181,64,63,0.75)"
            fontStyle="italic"
          >
            Residual risk &#8212; governance alone
          </text>
          <text
            x={midRedX} y={yRedMid + 15} textAnchor="middle"
            fontFamily="'Plus Jakarta Sans', sans-serif"
            fontSize={8.5} fontWeight={600} fill="rgba(181,64,63,0.75)"
            fontStyle="italic"
          >
            cannot eliminate
          </text>

          {/* Green zone label */}
          <text
            x={midGrnX} y={yGrnMid + 4} textAnchor="middle"
            fontFamily="'Plus Jakarta Sans', sans-serif"
            fontSize={8} fill="rgba(74,124,89,0.70)"
            fontStyle="italic"
          >
            Reduced by governance
          </text>

          {/* 10. Crossover annotation */}
          {/* Vertical guide at crossover */}
          <line
            x1={xCross} y1={PAD.t} x2={xCross} y2={PAD.t + cH}
            stroke="rgba(34,55,90,0.22)" strokeWidth={1} strokeDasharray="3 4"
          />
          {/* Dot on G2 at crossover */}
          <circle
            cx={xCross} cy={yPx(g2AtCross)} r={5}
            fill="#4A7C59" stroke="#fff" strokeWidth={2}
          />
          {/* Annotation box */}
          <rect
            x={annX} y={annY} width={annW} height={annH} rx={5}
            fill="rgba(74,124,89,0.10)" stroke="rgba(74,124,89,0.35)" strokeWidth={0.5}
          />
          <text
            x={annX + 8} y={annY + 14}
            fontFamily="'Plus Jakarta Sans', sans-serif"
            fontSize={9.5} fontWeight={600} fill="#4A7C59"
          >
            Below &#945; &#8776; 0.35:
          </text>
          <text
            x={annX + 8} y={annY + 27}
            fontFamily="'Plus Jakarta Sans', sans-serif"
            fontSize={9} fill="#4A7C59" fontStyle="italic"
          >
            governance eliminates excess risk
          </text>
          {/* Arrow from box to dot */}
          <line
            x1={annX + annW} y1={annY + annH / 2}
            x2={xCross - 4} y2={yPx(g2AtCross)}
            stroke="rgba(74,124,89,0.50)" strokeWidth={1}
          />

          {/* 11. Residual bracket at highest alpha */}
          <line
            x1={xRight + 10} y1={yG2right}
            x2={xRight + 10} y2={yBaseRight}
            stroke="#B5403F" strokeWidth={1} opacity={0.6}
          />
          <line
            x1={xRight + 7} y1={yG2right}
            x2={xRight + 13} y2={yG2right}
            stroke="#B5403F" strokeWidth={1} opacity={0.6}
          />
          <line
            x1={xRight + 7} y1={yBaseRight}
            x2={xRight + 13} y2={yBaseRight}
            stroke="#B5403F" strokeWidth={1} opacity={0.6}
          />
          <text
            x={xRight + 16} y={yBracketMid - 5}
            fontFamily="'JetBrains Mono', monospace"
            fontSize={10} fontWeight={500} fill="#B5403F"
          >
            +{bracketPct}%
          </text>
          <text
            x={xRight + 16} y={yBracketMid + 8}
            fontFamily="'Plus Jakarta Sans', sans-serif"
            fontSize={8} fill="#B5403F" fontStyle="italic"
          >
            residual
          </text>

          {/* 12. Data point dots (clipped) */}
          <g clipPath="url(#c2-chart-clip)">
            {dataPoints.map((r, idx) => (
              <g key={`dots-${idx}`}>
                <circle cx={xPx(r.alpha)} cy={yPx(r.G0)} r={4} fill="#B5403F" stroke="#fff" strokeWidth={1.5} />
                <circle cx={xPx(r.alpha)} cy={yPx(r.G1)} r={3.5} fill="#C49A3C" stroke="#fff" strokeWidth={1.5} />
                <circle cx={xPx(r.alpha)} cy={yPx(r.G2)} r={4} fill="#4A7C59" stroke="#fff" strokeWidth={1.5} />
              </g>
            ))}
          </g>

          {/* 13. X-axis ticks */}
          {dataPoints.map(pt => (
            <line
              key={`xtick-${pt.alpha}`}
              x1={xPx(pt.alpha)} y1={PAD.t + cH}
              x2={xPx(pt.alpha)} y2={PAD.t + cH + 4}
              stroke="rgba(0,0,0,0.15)" strokeWidth={1}
            />
          ))}

          {/* 14. Hover elements */}
          {hover && (
            <g pointerEvents="none">
              {/* Crosshair */}
              <line
                x1={hover.xp} y1={PAD.t}
                x2={hover.xp} y2={PAD.t + cH}
                stroke="rgba(34,55,90,0.18)" strokeWidth={1} strokeDasharray="3 4"
              />
              {/* Dots on curves (clipped) */}
              <g clipPath="url(#c2-chart-clip)">
                <circle cx={hover.xp} cy={yPx(hover.g0v)} r={4} fill="#B5403F" stroke="#fff" strokeWidth={1.5} />
                <circle cx={hover.xp} cy={yPx(hover.g1v)} r={3.5} fill="#C49A3C" stroke="#fff" strokeWidth={1.5} />
                <circle cx={hover.xp} cy={yPx(hover.g2v)} r={4} fill="#4A7C59" stroke="#fff" strokeWidth={1.5} />
                <circle cx={hover.xp} cy={yPx(BASELINE)} r={4} fill="#888780" stroke="#fff" strokeWidth={1.5} />
              </g>
              {/* Tooltip */}
              <rect
                x={tipX} y={tipY} width={160} height={96} rx={6}
                fill="#fff" stroke="rgba(0,0,0,0.10)" strokeWidth={0.5}
              />
              <text x={tipX + 10} y={tipY + 15} fontFamily="'Plus Jakarta Sans', sans-serif" fontSize={10} fontWeight={600} fill="#22375A">
                {`\u03B1 = ${hover.a.toFixed(2)}`}
              </text>
              <text x={tipX + 10} y={tipY + 30} fontFamily="'JetBrains Mono', monospace" fontSize={10} fontWeight={500} fill="#B5403F">
                {`G0: ${fmt(hover.g0v)}`}
              </text>
              <text x={tipX + 10} y={tipY + 44} fontFamily="'JetBrains Mono', monospace" fontSize={10} fontWeight={500} fill="#C49A3C">
                {`G1: ${fmt(hover.g1v)}`}
              </text>
              <text x={tipX + 10} y={tipY + 58} fontFamily="'JetBrains Mono', monospace" fontSize={10} fontWeight={500} fill="#4A7C59">
                {`G2: ${fmt(hover.g2v)}`}
              </text>
              <text x={tipX + 10} y={tipY + 72} fontFamily="'JetBrains Mono', monospace" fontSize={10} fontWeight={500} fill="#888780">
                {`Baseline: ${fmt(BASELINE)}`}
              </text>
              <text x={tipX + 10} y={tipY + 86} fontFamily="'JetBrains Mono', monospace" fontSize={10} fontWeight={500}
                fill={Math.round(hover.g2v - BASELINE) > 0 ? '#B5403F' : '#4A7C59'}
              >
                {`Residual: ${Math.round(hover.g2v - BASELINE) > 0 ? '+' : ''}${Math.round(hover.g2v - BASELINE)}`}
              </text>
            </g>
          )}

          {/* 15. Hover overlay (transparent rect for mouse events) */}
          <rect
            x={PAD.l} y={PAD.t} width={cW} height={cH}
            fill="transparent" cursor="crosshair"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          />
        </svg>
      </div>

      {/* X-axis labels */}
      <div style={xAxisRow}>
        {X_LABELS.map(l => {
          const pct = (l.a - A_MIN) / (A_MAX - A_MIN);
          const leftPct = (PAD.l / SVG_W * 100) + pct * ((cW) / SVG_W * 100);
          return (
            <div
              key={l.a}
              style={{
                position: 'absolute',
                left: `${leftPct}%`,
                transform: 'translateX(-50%)',
                textAlign: 'center',
              }}
            >
              <div style={xMainLabel}>{l.main}</div>
              <div style={xSubLabel}>{l.sub}</div>
            </div>
          );
        })}
      </div>

      {/* X-axis title */}
      <div style={xAxisTitle}>
        AI stack concentration (&alpha;) &mdash; share of decisions handled by a single provider
        <span style={xDanger}>&nbsp;riskier &rarr;</span>
      </div>

      {/* Delta cards */}
      <div style={deltaRow}>
        {/* Left card: highest alpha */}
        {deltaCards.high && (
          <div style={deltaCard}>
            <div style={deltaCardTitle}>At &alpha; = {deltaCards.high.alpha.toFixed(2)} &mdash; single vendor</div>
            <div style={deltaLine}>
              <span style={deltaLabel}>Unmanaged AI (G0)</span>
              <span style={{ ...deltaVal, color: '#B5403F' }}>
                {fmt(deltaCards.high.G0)}&ensp;+{deltaCards.high.g0Pct}%
              </span>
            </div>
            <div style={deltaLine}>
              <span style={deltaLabel}>Light governance (G1)</span>
              <span style={{ ...deltaVal, color: '#C49A3C' }}>
                {fmt(deltaCards.high.G1)}&ensp;+{deltaCards.high.g1Pct}%
              </span>
            </div>
            <div style={deltaLine}>
              <span style={deltaLabel}>Active governance (G2)</span>
              <span style={{ ...deltaVal, color: deltaCards.high.g2Pct <= 0 ? '#4A7C59' : '#C49A3C' }}>
                {fmt(deltaCards.high.G2)}&ensp;{deltaCards.high.g2Pct > 0 ? '+' : ''}{deltaCards.high.g2Pct}%
              </span>
            </div>
            <hr style={deltaDivider} />
            <div style={deltaLine}>
              <span style={deltaLabel}>No-AI baseline</span>
              <span style={{ ...deltaVal, color: '#73726C' }}>{fmt(deltaCards.high.base)}</span>
            </div>
          </div>
        )}

        {/* Right card: lowest alpha */}
        {deltaCards.low && (
          <div style={deltaCard}>
            <div style={deltaCardTitle}>At &alpha; = {deltaCards.low.alpha.toFixed(2)} &mdash; diversified stack</div>
            <div style={deltaLine}>
              <span style={deltaLabel}>Unmanaged AI (G0)</span>
              <span style={{ ...deltaVal, color: '#B5403F' }}>
                {fmt(deltaCards.low.G0)}&ensp;+{deltaCards.low.g0Pct}%
              </span>
            </div>
            <div style={deltaLine}>
              <span style={deltaLabel}>Light governance (G1)</span>
              <span style={{ ...deltaVal, color: deltaCards.low.g1Pct <= 0 ? '#4A7C59' : '#C49A3C' }}>
                {fmt(deltaCards.low.G1)}&ensp;{deltaCards.low.g1Pct > 0 ? '+' : ''}{deltaCards.low.g1Pct}%
              </span>
            </div>
            <div style={deltaLine}>
              <span style={deltaLabel}>Active governance (G2)</span>
              <span style={{ ...deltaVal, color: deltaCards.low.g2Pct <= 0 ? '#4A7C59' : '#C49A3C' }}>
                {fmt(deltaCards.low.G2)}&ensp;{deltaCards.low.g2Pct > 0 ? '+' : ''}{deltaCards.low.g2Pct === 0 ? '\u00B10' : deltaCards.low.g2Pct}%
              </span>
            </div>
            <hr style={deltaDivider} />
            <div style={deltaLine}>
              <span style={deltaLabel}>No-AI baseline</span>
              <span style={{ ...deltaVal, color: '#73726C' }}>{fmt(deltaCards.low.base)}</span>
            </div>
            {deltaCards.low.g2Pct <= 0 && (
              <div style={deltaHighlight}>&check; G2 below baseline &mdash; governance eliminates excess risk</div>
            )}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div style={disclaimer}>
        v5 simulation. P99&times;&theta; marginalized at E[&pi;] = {TARGET_EPI} (strategy consulting, P3). See Calibration.
      </div>
    </GraphCard>
  );
}

// ── STYLES ────────────────────────────────────────────────────────────────────

const legendRow = {
  display: 'flex',
  gap: 20,
  alignItems: 'center',
  marginBottom: 18,
  flexWrap: 'wrap',
};

const legItem = {
  display: 'flex',
  alignItems: 'center',
  gap: 7,
};

const legLine = {
  display: 'inline-block',
  width: 24,
  height: 0,
  flexShrink: 0,
};

const legText = {
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize: 11,
  color: '#73726C',
};

const xAxisRow = {
  position: 'relative',
  height: 28,
  marginBottom: 4,
};

const xMainLabel = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 9,
  fontWeight: 500,
  color: '#22375A',
};

const xSubLabel = {
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize: 8,
  color: '#A0A09A',
};

const xAxisTitle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 8,
  marginBottom: 20,
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize: 10,
  fontWeight: 600,
  color: '#22375A',
};

const xDanger = {
  fontSize: 8,
  color: '#B5403F',
};

const deltaRow = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 12,
  marginTop: 4,
};

const deltaCard = {
  background: '#F5F4EF',
  borderRadius: 8,
  padding: '12px 14px',
};

const deltaCardTitle = {
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize: 10,
  fontWeight: 600,
  color: '#22375A',
  marginBottom: 8,
};

const deltaLine = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
  fontSize: 9,
  marginBottom: 4,
};

const deltaLabel = {
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  color: '#73726C',
};

const deltaVal = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11,
  fontWeight: 500,
};

const deltaDivider = {
  border: 'none',
  borderTop: '0.5px solid rgba(0,0,0,0.07)',
  margin: '6px 0',
};

const deltaHighlight = {
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize: 9,
  color: '#4A7C59',
  fontStyle: 'italic',
  marginTop: 4,
};

const disclaimer = {
  marginTop: 12,
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize: 10,
  color: '#C0BFB9',
  fontStyle: 'italic',
  textAlign: 'right',
};
