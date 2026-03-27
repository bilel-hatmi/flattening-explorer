import React, { useState, useRef, useEffect, useCallback } from 'react';
import GraphCard from '../ui/GraphCard';

// ── CONSTANTS ────────────────────────────────────────────────────────────────
const THRESHOLD = 0.46;
const X_MIN = 50;
const X_MAX = 1900;
const N_PTS = 500;
const SLIDER_MIN = 30;
const SLIDER_MAX = 85;
const THUMB_PAD = 10;
const HIST_HEIGHT = 120;

const HIST_XS = Array.from(
  { length: N_PTS },
  (_, i) => X_MIN + ((X_MAX - X_MIN) * i) / (N_PTS - 1)
);

const X_TICKS = [200, 500, 800, 1100, 1400, 1700];

// ── LOOKUP TABLE ─────────────────────────────────────────────────────────────
const TABLE = [
  { pi: 0.30, inside: 30, outside: 70, eL: 748, pCat: 0.41 },
  { pi: 0.35, inside: 35, outside: 65, eL: 709, pCat: 0.32 },
  { pi: 0.40, inside: 40, outside: 60, eL: 672, pCat: 0.23 },
  { pi: 0.46, inside: 46, outside: 54, eL: 628, pCat: 0.12 },
  { pi: 0.50, inside: 50, outside: 50, eL: 600, pCat: 0.05 },
  { pi: 0.60, inside: 60, outside: 40, eL: 532, pCat: 0.00 },
  { pi: 0.70, inside: 70, outside: 30, eL: 468, pCat: 0.00 },
  { pi: 0.80, inside: 80, outside: 20, eL: 408, pCat: 0.00 },
  { pi: 0.85, inside: 85, outside: 15, eL: 379, pCat: 0.00 },
];

// ── COLORS ───────────────────────────────────────────────────────────────────
const COLORS = {
  navy: '#22375A',
  danger: '#B5403F',
  warning: '#C49A3C',
  success: '#4A7C59',
  muted: '#A0A09A',
  labelGray: '#73726C',
  cream: '#F5F4EF',
};

// ── MATH HELPERS ─────────────────────────────────────────────────────────────
function lerp(a, b, t) {
  return a + (b - a) * t;
}

function interpolate(pi) {
  let lo = TABLE[0];
  let hi = TABLE[TABLE.length - 1];
  for (let i = 0; i < TABLE.length - 1; i++) {
    if (TABLE[i].pi <= pi && TABLE[i + 1].pi >= pi) {
      lo = TABLE[i];
      hi = TABLE[i + 1];
      break;
    }
  }
  if (lo.pi === hi.pi) return { ...lo };
  const t = (pi - lo.pi) / (hi.pi - lo.pi);
  return {
    pi,
    inside: Math.round(lerp(lo.inside, hi.inside, t)),
    outside: Math.round(lerp(lo.outside, hi.outside, t)),
    eL: Math.round(lerp(lo.eL, hi.eL, t)),
    pCat: +lerp(lo.pCat, hi.pCat, t).toFixed(3),
  };
}

function zone(pi) {
  if (pi < THRESHOLD) return 'catastrophe';
  if (pi < 0.60) return 'transition';
  return 'normal';
}

function zoneColor(z) {
  if (z === 'catastrophe') return COLORS.danger;
  if (z === 'transition') return COLORS.warning;
  return COLORS.success;
}

function gauss(x, mu, sigma) {
  return (
    Math.exp(-0.5 * ((x - mu) / sigma) ** 2) /
    (sigma * Math.sqrt(2 * Math.PI))
  );
}

function getDensity(pi, xs) {
  const d = interpolate(pi);
  const wCat = d.pCat;
  const wNorm = 1 - wCat;
  const muNorm = d.eL;
  const sigNorm = 45 + (1 - pi) * 50;
  const muCat = 1420 + (THRESHOLD - Math.min(pi, THRESHOLD)) * 900;
  const sigCat = 140;
  return xs.map(
    (x) => wNorm * gauss(x, muNorm, sigNorm) + wCat * gauss(x, muCat, sigCat)
  );
}

// Compute dynamic P99 from the distribution at current pi
function computeP99(pi) {
  const ys = getDensity(pi, HIST_XS);
  const total = ys.reduce((s, y) => s + y, 0);
  if (total === 0) return X_MAX;
  let cum = 0;
  for (let i = 0; i < HIST_XS.length; i++) {
    cum += ys[i];
    if (cum / total >= 0.99) return Math.round(HIST_XS[i]);
  }
  return X_MAX;
}

// ── COMPONENT ────────────────────────────────────────────────────────────────
export default function B3_PiFrontier() {
  const [piInt, setPiInt] = useState(75);
  const pi = piInt / 100;

  const histCanvasRef = useRef(null);
  const trackCanvasRef = useRef(null);
  const sliderRef = useRef(null);
  const thresholdLabelRef = useRef(null);
  const containerRef = useRef(null);

  const d = interpolate(pi);
  const z = zone(pi);
  const color = zoneColor(z);
  const currentP99 = computeP99(pi);

  // Correlated failure columns
  const corrCols =
    d.pCat > 0
      ? Math.round((d.outside / 10) * 0.45 * 10) / 10
      : 0;

  // ── Draw slider track canvas ───────────────────────────────────────────────
  const drawSliderTrack = useCallback(() => {
    const canvas = trackCanvasRef.current;
    const slider = sliderRef.current;
    if (!canvas || !slider) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = slider.getBoundingClientRect();
    const W = rect.width;
    const H = 6;

    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';

    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.scale(dpr, dpr);

    // Gradient track
    const grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, COLORS.danger);
    grad.addColorStop(0.28, COLORS.warning);
    grad.addColorStop(0.55, COLORS.success);
    grad.addColorStop(1, COLORS.success);

    // Round rect
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(0, 0, W, H, 3);
    } else {
      // Fallback for browsers without roundRect
      const r = 3;
      ctx.moveTo(r, 0);
      ctx.lineTo(W - r, 0);
      ctx.arcTo(W, 0, W, r, r);
      ctx.lineTo(W, H - r);
      ctx.arcTo(W, H, W - r, H, r);
      ctx.lineTo(r, H);
      ctx.arcTo(0, H, 0, H - r, r);
      ctx.lineTo(0, r);
      ctx.arcTo(0, 0, r, 0, r);
      ctx.closePath();
    }
    ctx.fillStyle = grad;
    ctx.fill();

    // Threshold tick at pi=0.46
    const trackW = W - THUMB_PAD * 2;
    const xThr =
      THUMB_PAD +
      ((46 - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * trackW;
    ctx.fillStyle = 'rgba(255,255,255,0.90)';
    ctx.fillRect(xThr - 1, 0, 2, H);

    ctx.restore();
  }, []);

  // ── Position threshold label ───────────────────────────────────────────────
  const positionThresholdLabel = useCallback(() => {
    const label = thresholdLabelRef.current;
    const slider = sliderRef.current;
    if (!label || !slider) return;

    const W = slider.getBoundingClientRect().width;
    const trackW = W - THUMB_PAD * 2;
    const x =
      THUMB_PAD +
      ((46 - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * trackW;
    label.style.left = x + 'px';
  }, []);

  // ── Draw histogram ─────────────────────────────────────────────────────────
  const drawHistogram = useCallback((currentPi, p99val) => {
    const canvas = histCanvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const parentW = canvas.parentElement.getBoundingClientRect().width;

    canvas.width = parentW * dpr;
    canvas.height = HIST_HEIGHT * dpr;
    canvas.style.width = parentW + 'px';
    canvas.style.height = HIST_HEIGHT + 'px';

    const ctx = canvas.getContext('2d');
    const W = parentW;
    const H = HIST_HEIGHT;
    const PL = 38;
    const PR = 10;
    const PT = 14;
    const PB = 18;
    const cW = W - PL - PR;
    const cH = H - PT - PB;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    const ys = getDensity(currentPi, HIST_XS);
    const yMax = Math.max(...ys) * 1.15;

    function xPx(v) {
      return PL + ((v - X_MIN) / (X_MAX - X_MIN)) * cW;
    }
    function yPx(v) {
      return PT + cH * (1 - v / yMax);
    }

    // Gridlines
    ctx.setLineDash([2, 4]);
    ctx.strokeStyle = 'rgba(0,0,0,0.05)';
    ctx.lineWidth = 1;
    [0.25, 0.5, 0.75].forEach((f) => {
      const y = PT + cH * (1 - f);
      ctx.beginPath();
      ctx.moveTo(PL, y);
      ctx.lineTo(PL + cW, y);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Safe fill (x < p99val)
    ctx.beginPath();
    ctx.moveTo(xPx(X_MIN), PT + cH);
    HIST_XS.forEach((x, i) => {
      if (x <= p99val) ctx.lineTo(xPx(x), yPx(ys[i]));
    });
    ctx.lineTo(xPx(Math.min(p99val, X_MAX)), PT + cH);
    ctx.closePath();
    ctx.fillStyle = 'rgba(74,124,89,0.12)';
    ctx.fill();

    // Danger fill (x > p99val)
    const fd = HIST_XS.findIndex((x) => x >= p99val);
    if (fd >= 0) {
      ctx.beginPath();
      ctx.moveTo(xPx(p99val), PT + cH);
      HIST_XS.forEach((x, i) => {
        if (x >= p99val) ctx.lineTo(xPx(x), yPx(ys[i]));
      });
      ctx.lineTo(xPx(X_MAX), PT + cH);
      ctx.closePath();
      ctx.fillStyle = 'rgba(181,64,63,0.12)';
      ctx.fill();
    }

    // Curve
    ctx.beginPath();
    HIST_XS.forEach((x, i) =>
      i === 0
        ? ctx.moveTo(xPx(x), yPx(ys[i]))
        : ctx.lineTo(xPx(x), yPx(ys[i]))
    );
    ctx.strokeStyle = COLORS.navy;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dynamic P99 line
    const xp99 = xPx(p99val);
    if (xp99 >= xPx(X_MIN) && xp99 <= xPx(X_MAX)) {
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(181,64,63,0.60)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(xp99, PT);
      ctx.lineTo(xp99, PT + cH);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(181,64,63,0.75)';
      ctx.font = '600 9px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('P99: ' + p99val.toLocaleString(), xp99, PT - 2);
    }

    // X axis labels
    ctx.fillStyle = COLORS.muted;
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    X_TICKS.forEach((v) => {
      if (v >= X_MIN && v <= X_MAX) {
        const xp = xPx(v);
        // Tick
        ctx.strokeStyle = 'rgba(0,0,0,0.10)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(xp, PT + cH);
        ctx.lineTo(xp, PT + cH + 3);
        ctx.stroke();
        ctx.fillText(
          v >= 1000 ? (v / 1000).toFixed(1) + 'k' : String(v),
          xp,
          PT + cH + 12
        );
      }
    });

    // Y axis label
    ctx.save();
    ctx.fillStyle = COLORS.muted;
    ctx.font = '9px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.translate(10, PT + cH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Frequency', 0, 0);
    ctx.restore();

    ctx.restore();
  }, []);

  // ── Layout / resize ────────────────────────────────────────────────────────
  const layout = useCallback(() => {
    drawSliderTrack();
    positionThresholdLabel();
    drawHistogram(piInt / 100, computeP99(piInt / 100));
  }, [drawSliderTrack, positionThresholdLabel, drawHistogram, piInt]);

  useEffect(() => {
    // Wait for layout to settle
    const raf = requestAnimationFrame(layout);
    return () => cancelAnimationFrame(raf);
  }, [layout]);

  useEffect(() => {
    const handleResize = () => {
      requestAnimationFrame(layout);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [layout]);

  // ── Slider input handler ───────────────────────────────────────────────────
  const handleSliderInput = useCallback(
    (e) => {
      const v = parseInt(e.target.value, 10);
      setPiInt(v);
      drawSliderTrack();
      drawHistogram(v / 100, computeP99(v / 100));
    },
    [drawSliderTrack, drawHistogram]
  );

  // ── Metric color helpers ───────────────────────────────────────────────────
  function pCatColor() {
    if (d.pCat >= 0.20) return COLORS.danger;
    if (d.pCat > 0) return COLORS.warning;
    return COLORS.success;
  }

  function corrColsColor() {
    if (corrCols >= 2) return COLORS.danger;
    if (corrCols >= 1) return COLORS.warning;
    return COLORS.success;
  }

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <GraphCard
      id="B3"
      title="How the catastrophe threshold works"
      subtitle={
        'π is the fraction of decisions where AI operates inside its training data this quarter. ' +
        'Drag the slider. Below the threshold at π = 0.46, the AI is wrong on most decisions — ' +
        'and because all agents share the same model, errors become perfectly correlated. ' +
        'Worst-case losses spike.'
      }
      footnote={'Parametric Gaussian mixture calibrated on v5 Monte Carlo outputs. Distribution shape varies with \u03c0.'}
    >
      <div ref={containerRef}>
        {/* ── Slider header ─────────────────────────────────────── */}
        <div style={styles.sliderHeader}>
          <span style={styles.sliderLabel}>
            Domain exposure π this quarter
          </span>
          <div style={styles.piReadout}>
            <div
              style={{
                ...styles.piValue,
                color,
                transition: 'color 0.25s',
              }}
            >
              π = {pi.toFixed(2)}
            </div>
            <div
              style={{
                ...styles.piStatus,
                color: pi < THRESHOLD ? COLORS.danger : COLORS.muted,
                fontWeight: pi < THRESHOLD ? 600 : 400,
                transition: 'color 0.25s',
              }}
            >
              {pi < THRESHOLD
                ? `\⚠ Below catastrophe threshold (${THRESHOLD})`
                : 'Normal operating range'}
            </div>
          </div>
        </div>

        {/* ── Slider with custom track ──────────────────────────── */}
        <div style={styles.sliderWrap}>
          <div
            ref={thresholdLabelRef}
            style={styles.thresholdAbove}
          >
            threshold
          </div>
          <canvas
            ref={trackCanvasRef}
            style={styles.trackCanvas}
          />
          <input
            ref={sliderRef}
            type="range"
            min={SLIDER_MIN}
            max={SLIDER_MAX}
            step={1}
            value={piInt}
            onInput={handleSliderInput}
            onChange={handleSliderInput}
            className="b3-pi-slider"
            style={styles.rangeInput}
          />
        </div>
        <div style={styles.sliderEnds}>
          <span>0.30</span>
          <span>0.85</span>
        </div>

        {/* ── Frontier bar ──────────────────────────────────────── */}
        <div style={styles.frontierSection}>
          <div style={styles.frontierBarLabels}>
            <span style={{ color: COLORS.success, fontWeight: 600, fontSize: 9 }}>
              Inside frontier — AI performs well
            </span>
            <span style={{ color: COLORS.danger, fontWeight: 600, fontSize: 9 }}>
              Outside frontier — AI accuracy drops to ~55%
            </span>
          </div>
          <div style={styles.frontierBar}>
            <div
              style={{
                ...styles.barInside,
                width: d.inside + '%',
                transition: 'width 0.3s ease',
              }}
            >
              {d.inside >= 12 ? d.inside + '%' : ''}
            </div>
            <div
              style={{
                ...styles.barOutside,
                width: d.outside + '%',
                transition: 'width 0.3s ease',
              }}
            >
              {d.outside >= 12 ? d.outside + '%' : ''}
            </div>
          </div>
        </div>

        {/* ── Metric cards ──────────────────────────────────────── */}
        <div style={styles.metrics}>
          {/* Card 1 — Expected loss */}
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Expected loss this quarter</div>
            <div style={styles.metricSublabel}>
              Average errors across all agents
            </div>
            <div
              style={{
                ...styles.metricValue,
                color,
                transition: 'color 0.3s',
              }}
            >
              {d.eL.toLocaleString()}
            </div>
          </div>

          {/* Card 2 — Dynamic P99 */}
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Worst-case loss (P99)</div>
            <div style={styles.metricSublabel}>
              99th percentile of loss distribution at this π value
            </div>
            <div
              style={{
                ...styles.metricValue,
                color: currentP99 > 1400 ? COLORS.danger : currentP99 > 1000 ? COLORS.warning : COLORS.success,
                transition: 'color 0.3s',
              }}
            >
              {currentP99.toLocaleString()}
            </div>
            {d.pCat > 0 && (
              <div style={styles.metricFootnote}>
                P(catastrophic quarter) = {(d.pCat * 100).toFixed(0)}% at this π.
                In practice, only ~8% of quarters reach exposures this low.
              </div>
            )}
          </div>

          {/* Card 3 — Correlated failure columns */}
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Correlated failure columns</div>
            <div style={styles.metricSublabel}>
              Decision types where all agents fail together
            </div>
            <div
              style={{
                ...styles.metricValue,
                color: corrColsColor(),
                transition: 'color 0.3s',
              }}
            >
              {corrCols > 0
                ? '~' + corrCols.toFixed(1) + ' / 10'
                : '0 / 10'}
            </div>
          </div>
        </div>

        {/* ── Histogram ─────────────────────────────────────────── */}
        <div>
          <div style={styles.histLabel}>
            Loss distribution at this π value
          </div>
          <div style={styles.histSublabel}>
            How often each loss level occurs — drag the slider to see the shape
            change
          </div>
          <canvas
            ref={histCanvasRef}
            style={styles.histCanvas}
          />
        </div>
      </div>

      {/* Custom CSS for the range input thumb styling */}
      <style>{rangeCSS}</style>
    </GraphCard>
  );
}

// ── INLINE STYLES ────────────────────────────────────────────────────────────
const styles = {
  sliderHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  sliderLabel: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 11,
    fontWeight: 600,
    color: COLORS.navy,
    paddingTop: 3,
  },
  piReadout: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 3,
  },
  piValue: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 28,
    fontWeight: 500,
    lineHeight: 1,
  },
  piStatus: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 10,
    lineHeight: 1,
  },
  sliderWrap: {
    position: 'relative',
    marginBottom: 6,
    paddingTop: 10,
  },
  thresholdAbove: {
    position: 'absolute',
    top: 0,
    transform: 'translateX(-50%)',
    fontSize: 8,
    color: 'rgba(34,55,90,0.50)',
    whiteSpace: 'nowrap',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    pointerEvents: 'none',
  },
  trackCanvas: {
    position: 'absolute',
    top: 18,
    left: 0,
    width: '100%',
    height: 6,
    borderRadius: 3,
    pointerEvents: 'none',
    zIndex: 1,
  },
  rangeInput: {
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    appearance: 'none',
    width: '100%',
    height: 6,
    background: 'transparent',
    cursor: 'pointer',
    position: 'relative',
    zIndex: 2,
    marginTop: 12,
    outline: 'none',
  },
  sliderEnds: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 4,
    fontSize: 9,
    color: COLORS.muted,
    fontFamily: "'JetBrains Mono', monospace",
  },
  frontierSection: {
    marginBottom: 20,
    marginTop: 16,
  },
  frontierBarLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 9,
    marginBottom: 5,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  frontierBar: {
    height: 28,
    borderRadius: 5,
    overflow: 'hidden',
    display: 'flex',
  },
  barInside: {
    background: COLORS.success,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: 10,
    fontSize: 10,
    fontWeight: 600,
    color: '#fff',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  barOutside: {
    background: COLORS.danger,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 10,
    fontSize: 10,
    fontWeight: 600,
    color: '#fff',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  metrics: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 10,
    marginBottom: 20,
  },
  metricCard: {
    background: COLORS.cream,
    borderRadius: 8,
    padding: '12px 13px',
  },
  metricLabel: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 10,
    fontWeight: 600,
    color: COLORS.labelGray,
    marginBottom: 1,
  },
  metricSublabel: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 9,
    color: COLORS.muted,
    marginBottom: 6,
    lineHeight: 1.35,
  },
  metricValue: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 22,
    fontWeight: 500,
    lineHeight: 1.1,
  },
  metricFootnote: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 8.5,
    color: COLORS.muted,
    marginTop: 5,
    lineHeight: 1.4,
    fontStyle: 'italic',
  },
  histLabel: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 10,
    fontWeight: 600,
    color: COLORS.navy,
    marginBottom: 2,
  },
  histSublabel: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 9,
    color: COLORS.muted,
    marginBottom: 10,
  },
  histCanvas: {
    width: '100%',
    display: 'block',
    borderRadius: 4,
  },
};

// ── CSS for custom range thumb (cannot be done with inline styles) ────────
const rangeCSS = `
  .b3-pi-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #22375A;
    border: 3px solid #fff;
    box-shadow: 0 1px 4px rgba(0,0,0,0.22);
    cursor: pointer;
    transition: background 0.2s;
  }
  .b3-pi-slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #22375A;
    border: 3px solid #fff;
    box-shadow: 0 1px 4px rgba(0,0,0,0.22);
    cursor: pointer;
  }
  .b3-pi-slider::-webkit-slider-runnable-track {
    height: 6px;
    background: transparent;
  }
  .b3-pi-slider::-moz-range-track {
    height: 6px;
    background: transparent;
    border: none;
  }
  .b3-pi-slider:focus {
    outline: none;
  }
`;
