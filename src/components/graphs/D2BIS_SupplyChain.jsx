import { useState, useRef, useEffect, useCallback } from 'react';
import GraphCard from '../ui/GraphCard';
import { fmt } from '../../utils/helpers';

// DATA
const P99_OWN = 2135; // v5 central case, G0 unmanaged -- NOT 1500
const N_SUPPLIERS = 8;
const ANIM_DURATION = 500; // ms

function omegaEff(fracG0) {
  return 1.0 + 0.8 * Math.pow(fracG0, 1.5);
}

const ANNOTATIONS = [
  { max: 0,    cls: '',       text: 'All suppliers run active governance. Your effective tail risk equals your own exposure.' },
  { max: 0.20, cls: '',       text: 'Some risk leaking through supply chain. Modest amplification \u2014 individual supplier discipline still limits contagion.' },
  { max: 0.40, cls: '',       text: 'Risk accumulation building. The convexity is beginning to show \u2014 each additional unmanaged supplier costs more than the last.' },
  { max: 0.60, cls: 'warn',   text: "Supply chain exposure now exceeds your internal tail risk. Your governance decisions are being overwhelmed by your suppliers' choices." },
  { max: 0.80, cls: 'warn',   text: 'Effective tail risk 57% above your own. The majority of your risk now originates outside your organisation and outside your control.' },
  { max: 1.00, cls: 'danger', text: 'Effective tail risk 80% above your own \u2014 even though your AI is fully governed. Your supply chain has doubled your exposure. Regulation is the only lever that works here.' },
];

function getAnnotation(frac) {
  for (const a of ANNOTATIONS) {
    if (frac <= a.max + 0.001) return a;
  }
  return ANNOTATIONS[ANNOTATIONS.length - 1];
}

function lerp(a, b, t) { return a + (b - a) * t; }
function lerpColor(c1, c2, t) {
  return [
    Math.round(lerp(c1[0], c2[0], t)),
    Math.round(lerp(c1[1], c2[1], t)),
    Math.round(lerp(c1[2], c2[2], t)),
  ];
}

const RGB_G2 = [74, 124, 89];   // #4A7C59
const RGB_G0 = [181, 64, 63];   // #B5403F

// STYLES
const S = {
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 280px',
    gap: 28,
    alignItems: 'start',
    marginBottom: 20,
  },
  legendRow: {
    display: 'flex',
    gap: 16,
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  legItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    fontSize: 10,
    color: '#73726C',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  legDot: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    flexShrink: 0,
  },
  diagramWrap: {
    position: 'relative',
    background: '#F8F8F6',
    borderRadius: 10,
    border: '0.5px solid rgba(0,0,0,0.07)',
    overflow: 'hidden',
  },
  curveWrap: {
    background: '#F8F8F6',
    borderRadius: 8,
    border: '0.5px solid rgba(0,0,0,0.07)',
    padding: '14px 14px 10px',
  },
  curveTitle: {
    fontSize: 10,
    fontWeight: 600,
    color: '#22375A',
    marginBottom: 10,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  controls: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  sliderSection: {
    background: '#F5F4EF',
    borderRadius: 8,
    padding: '14px 14px 12px',
  },
  sliderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  sliderLabel: {
    fontSize: 10,
    fontWeight: 600,
    color: '#22375A',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  sliderPct: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 18,
    fontWeight: 500,
    transition: 'color 0.3s',
  },
  sliderInput: {
    WebkitAppearance: 'none',
    appearance: 'none',
    width: '100%',
    height: 6,
    borderRadius: 3,
    cursor: 'pointer',
    background: 'linear-gradient(to right, #4A7C59, #C49A3C, #B5403F)',
  },
  sliderEnds: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 4,
    fontSize: 8.5,
    color: '#A0A09A',
    fontFamily: "'JetBrains Mono', monospace",
  },
  metricGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  metricCard: {
    background: '#F5F4EF',
    borderRadius: 7,
    padding: '10px 12px',
    border: '0.5px solid rgba(0,0,0,0.07)',
  },
  metricLbl: {
    fontSize: 9,
    color: '#A0A09A',
    marginBottom: 3,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  metricVal: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 20,
    fontWeight: 500,
    lineHeight: 1,
    transition: 'color 0.35s',
  },
  metricSub: {
    fontSize: 8.5,
    color: '#73726C',
    marginTop: 3,
    transition: 'color 0.35s',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  annotationBase: {
    fontSize: 10,
    color: '#22375A',
    lineHeight: 1.55,
    padding: '8px 12px',
    borderRadius: 6,
    borderLeft: '2px solid rgba(34,55,90,0.20)',
    background: 'rgba(34,55,90,0.04)',
    minHeight: 38,
    transition: 'background 0.3s, border-color 0.3s, color 0.3s',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  annotationWarn: {
    borderColor: 'rgba(196,154,60,0.40)',
    background: 'rgba(196,154,60,0.07)',
    color: '#8a6d22',
  },
  annotationDanger: {
    borderColor: 'rgba(181,64,63,0.40)',
    background: 'rgba(181,64,63,0.07)',
    color: '#B5403F',
  },
  regBtn: {
    width: '100%',
    padding: 10,
    borderRadius: 7,
    border: '0.5px solid rgba(74,124,89,0.35)',
    background: 'rgba(74,124,89,0.08)',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 11,
    fontWeight: 600,
    color: '#4A7C59',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  bottomNote: {
    background: 'rgba(34,55,90,0.04)',
    borderLeft: '2px solid rgba(34,55,90,0.20)',
    borderRadius: '0 6px 6px 0',
    padding: '9px 14px',
    fontSize: 10,
    color: '#22375A',
    lineHeight: 1.6,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  disclaimer: {
    marginTop: 10,
    fontSize: 10,
    color: '#C0BFB9',
    fontStyle: 'italic',
    textAlign: 'right',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
};

// SVG NETWORK DIAGRAM
function NetworkDiagram({ supplierT, fracG0 }) {
  const svgRef = useRef(null);
  const [dims, setDims] = useState({ width: 420, height: 200 });
  const containerRef = useRef(null);

  useEffect(() => {
    function handleResize() {
      if (containerRef.current) {
        const w = containerRef.current.getBoundingClientRect().width;
        setDims({ width: w, height: 200 });
      }
    }
    handleResize();
    let timerId;
    function debounced() {
      clearTimeout(timerId);
      timerId = setTimeout(handleResize, 100);
    }
    window.addEventListener('resize', debounced);
    return () => { window.removeEventListener('resize', debounced); clearTimeout(timerId); };
  }, []);

  const { width: W, height: H } = dims;
  const cx = W / 2;
  const cy = H / 2;
  const R_CENTER = 42;
  const R_SUPPLIER = 20;
  const RING_R = Math.min(W, H) * 0.34;
  const omega = omegaEff(fracG0);

  const suppliers = Array.from({ length: N_SUPPLIERS }, (_, i) => {
    const angle = (2 * Math.PI * i / N_SUPPLIERS) - Math.PI / 2;
    const sx = cx + RING_R * Math.cos(angle);
    const sy = cy + RING_R * Math.sin(angle);
    return { i, sx, sy, t: supplierT[i], angle };
  });

  return (
    <div ref={containerRef} style={S.diagramWrap}>
      <svg
        ref={svgRef}
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        style={{ display: 'block' }}
      >
        {/* Red dashed arrows from G0 suppliers to centre */}
        {suppliers.map(({ i, sx, sy, t }) => {
          if (t < 0.05) return null;
          const dx = cx - sx;
          const dy = cy - sy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const startX = sx + (dx / dist) * R_SUPPLIER;
          const startY = sy + (dy / dist) * R_SUPPLIER;
          const endX = cx - (dx / dist) * R_CENTER;
          const endY = cy - (dy / dist) * R_CENTER;
          const arrowAngle = Math.atan2(endY - startY, endX - startX);
          const aLen = 7;
          const p1x = endX - aLen * Math.cos(arrowAngle - 0.4);
          const p1y = endY - aLen * Math.sin(arrowAngle - 0.4);
          const p2x = endX - aLen * Math.cos(arrowAngle + 0.4);
          const p2y = endY - aLen * Math.sin(arrowAngle + 0.4);

          const strokeColor = `rgba(181,64,63,${(t * 0.55).toFixed(3)})`;
          const lw = 1.5 + t * 0.5;

          return (
            <g key={`arrow-${i}`}>
              <line
                x1={startX} y1={startY}
                x2={endX} y2={endY}
                stroke={strokeColor}
                strokeWidth={lw}
                strokeDasharray="4,3"
              />
              <polygon
                points={`${endX},${endY} ${p1x},${p1y} ${p2x},${p2y}`}
                fill={strokeColor}
              />
            </g>
          );
        })}

        {/* Supplier circles */}
        {suppliers.map(({ i, sx, sy, t }) => {
          const col = lerpColor(RGB_G2, RGB_G0, t);
          const fillStr = `rgba(${col[0]},${col[1]},${col[2]},0.85)`;
          return (
            <g key={`supplier-${i}`}>
              <circle cx={sx} cy={sy} r={R_SUPPLIER} fill={fillStr} stroke="#fff" strokeWidth={2} />
              <text
                x={sx} y={sy}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#fff"
                style={{ fontSize: 8.5, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                S{i + 1}
              </text>
            </g>
          );
        })}

        {/* Centre circle - YOUR FIRM */}
        <circle cx={cx} cy={cy} r={R_CENTER} fill="#22375A" stroke="#fff" strokeWidth={2.5} />
        <text
          x={cx} y={cy - 6}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#fff"
          style={{ fontSize: 9, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          YOUR
        </text>
        <text
          x={cx} y={cy + 6}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#fff"
          style={{ fontSize: 9, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          FIRM
        </text>

        {/* omega_eff label below centre circle */}
        {omega > 1.01 && (
          <text
            x={cx} y={cy + 54}
            textAnchor="middle"
            dominantBaseline="central"
            fill={fracG0 >= 0.6 ? 'rgba(181,64,63,0.85)' : 'rgba(196,154,60,0.85)'}
            style={{ fontSize: 9, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}
          >
            {'\u00d7'}{omega.toFixed(2)}
          </text>
        )}
      </svg>
    </div>
  );
}

// OMEGA CURVE (Canvas)
function OmegaCurve({ fracG0, regulationActive }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const draw = useCallback(() => {
    const cv = canvasRef.current;
    const container = containerRef.current;
    if (!cv || !container) return;

    const DPR = window.devicePixelRatio || 1;
    const W = container.getBoundingClientRect().width || 380;
    const H = 70;
    cv.width = W * DPR;
    cv.height = H * DPR;
    cv.style.width = W + 'px';
    cv.style.height = H + 'px';
    const ctx = cv.getContext('2d');
    ctx.scale(DPR, DPR);
    ctx.clearRect(0, 0, W, H);

    const PAD = { l: 36, r: 14, t: 10, b: 22 };
    const cW = W - PAD.l - PAD.r;
    const cH = H - PAD.t - PAD.b;
    const OMEGA_MAX = 1.82;

    function xp(v) { return PAD.l + v * cW; }
    function yp(o) { return PAD.t + cH * (1 - (o - 1) / (OMEGA_MAX - 1)); }

    // Gridlines
    [1.0, 1.2, 1.4, 1.6, 1.8].forEach(o => {
      const y = yp(o);
      ctx.beginPath();
      ctx.moveTo(PAD.l, y);
      ctx.lineTo(PAD.l + cW, y);
      ctx.strokeStyle = 'rgba(0,0,0,0.06)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#A0A09A';
      ctx.font = "8px 'JetBrains Mono', monospace";
      ctx.textAlign = 'right';
      ctx.fillText(o.toFixed(1), PAD.l - 4, y + 3);
    });

    // Curve fill
    const N = 100;
    ctx.beginPath();
    ctx.moveTo(xp(0), yp(1));
    for (let i = 0; i <= N; i++) {
      const f = i / N;
      ctx.lineTo(xp(f), yp(omegaEff(f)));
    }
    ctx.lineTo(xp(1), yp(1));
    ctx.closePath();
    ctx.fillStyle = 'rgba(181,64,63,0.08)';
    ctx.fill();

    // Curve line
    ctx.beginPath();
    for (let i = 0; i <= N; i++) {
      const f = i / N;
      const px = xp(f);
      const py = yp(omegaEff(f));
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.strokeStyle = '#B5403F';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Current position dot
    const curX = xp(fracG0);
    const curY = yp(omegaEff(fracG0));
    ctx.beginPath();
    ctx.arc(curX, curY, 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#22375A';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Correction 2 -- Dynamic omega label next to current dot
    const omegaVal = omegaEff(fracG0);
    const omegaLabel = '\u03c9\u202f=\u202f' + omegaVal.toFixed(2) + '\u00d7';
    ctx.save();
    ctx.fillStyle = '#22375A';
    ctx.font = '500 11px Plus Jakarta Sans, sans-serif';
    if (fracG0 > 0.80) {
      ctx.textAlign = 'right';
      ctx.fillText(omegaLabel, curX - 10, curY + 4);
    } else {
      ctx.textAlign = 'left';
      ctx.fillText(omegaLabel, curX + 10, curY + 4);
    }
    ctx.restore();

    // Correction 5 -- Regulation annotation
    if (regulationActive) {
      const xTarget = xp(0);
      const yTarget = yp(1.0);
      ctx.save();
      ctx.strokeStyle = '#4A7C59';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(curX, curY);
      ctx.lineTo(xTarget + 2, yTarget);
      ctx.stroke();
      ctx.fillStyle = '#4A7C59';
      ctx.font = '10px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'left';
      ctx.setLineDash([]);
      ctx.fillText('regulation \u2192 \u03c9\u202f=\u202f1.0', xTarget + 6, yTarget - 6);
      ctx.restore();
    }

    // X axis ticks
    [0, 0.2, 0.4, 0.6, 0.8, 1.0].forEach(v => {
      const x = xp(v);
      ctx.fillStyle = '#A0A09A';
      ctx.font = "8px 'JetBrains Mono', monospace";
      ctx.textAlign = 'center';
      ctx.fillText(Math.round(v * 100) + '%', x, PAD.t + cH + 14);
    });

    // Y axis label
    ctx.save();
    ctx.translate(10, PAD.t + cH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#A0A09A';
    ctx.font = "8px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText('\u03c9_eff', 0, 0);
    ctx.restore();
  }, [fracG0, regulationActive]);

  useEffect(() => {
    draw();
    let timerId;
    function debounced() {
      clearTimeout(timerId);
      timerId = setTimeout(draw, 100);
    }
    window.addEventListener('resize', debounced);
    return () => { window.removeEventListener('resize', debounced); clearTimeout(timerId); };
  }, [draw]);

  return (
    <div style={S.curveWrap}>
      <div style={S.curveTitle}>{'\u03c9'}_eff as a function of supplier G0 fraction</div>
      <p style={{
        fontSize: 11,
        color: '#888780',
        fontStyle: 'italic',
        margin: '2px 0 12px 0',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        lineHeight: 1.4,
      }}>
        Convex amplification model. {'\u03c9'}_eff{'\u202f'}={'\u202f'}1.0{'\u202f'}+{'\u202f'}0.8{'\u202f'}{'\u00d7'}{'\u202f'}f{'\u00b9'}{'\u00b7'}{'\u2075'}.
      </p>
      <div ref={containerRef}>
        <canvas ref={canvasRef} style={{ display: 'block', width: '100%' }} height={70} />
      </div>
    </div>
  );
}

// MAIN COMPONENT
export default function D2BIS_SupplyChain({ p99Own = P99_OWN }) {
  const [sliderValue, setSliderValue] = useState(0); // 0-100, step 10
  const [regulated, setRegulated] = useState(false);
  const supplierTRef = useRef(Array(N_SUPPLIERS).fill(0));
  const [supplierT, setSupplierT] = useState(Array(N_SUPPLIERS).fill(0));
  const animRef = useRef(null);

  const fracG0 = sliderValue / 100;
  const omega = omegaEff(fracG0);
  const effectiveP99 = Math.round(p99Own * omega);
  const excess = effectiveP99 - p99Own;
  const annotation = getAnnotation(fracG0);

  // Animate supplier transitions
  const animateTo = useCallback((newFrac) => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const nG0 = Math.round(newFrac * N_SUPPLIERS);
    const fromT = [...supplierTRef.current];
    const toT = Array.from({ length: N_SUPPLIERS }, (_, i) => i < nG0 ? 1 : 0);
    const animStart = performance.now();

    function step(now) {
      const raw = Math.min((now - animStart) / ANIM_DURATION, 1);
      // ease-in-out quadratic
      const ease = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;
      const current = fromT.map((f, i) => lerp(f, toT[i], ease));
      supplierTRef.current = current;
      setSupplierT([...current]);
      if (raw < 1) {
        animRef.current = requestAnimationFrame(step);
      } else {
        animRef.current = null;
        supplierTRef.current = [...toT];
        setSupplierT([...toT]);
      }
    }
    animRef.current = requestAnimationFrame(step);
  }, []);

  // Trigger animation on fracG0 change
  const prevFracRef = useRef(0);
  useEffect(() => {
    if (prevFracRef.current !== fracG0) {
      animateTo(fracG0);
      prevFracRef.current = fracG0;
    }
  }, [fracG0, animateTo]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  // Color helpers
  const pctColor = fracG0 >= 0.6 ? '#B5403F' : fracG0 >= 0.4 ? '#C49A3C' : '#4A7C59';
  const omegaColor = fracG0 >= 0.6 ? '#B5403F' : fracG0 >= 0.3 ? '#C49A3C' : '#4A7C59';
  const p99Color = fracG0 >= 0.6 ? '#B5403F' : fracG0 >= 0.3 ? '#C49A3C' : '#22375A';
  const excessColor = fracG0 >= 0.6 ? '#B5403F' : fracG0 >= 0.3 ? '#C49A3C' : '#4A7C59';

  // Omega sub-label
  const omegaSub = fracG0 === 0
    ? 'No amplification'
    : fracG0 <= 0.3
    ? 'Modest amplification'
    : fracG0 <= 0.5
    ? 'Moderate amplification'
    : 'Significant amplification';

  // P99 sub-label
  const p99Sub = fracG0 === 0
    ? '= your own risk only'
    : `= own (${fmt(p99Own)}) \u00d7 \u03c9_eff (${omega.toFixed(2)})`;

  // Excess sub-label
  const excessSub = excess === 0
    ? 'None \u2014 all suppliers governed'
    : `+${Math.round((omega - 1) * 100)}% above your own exposure`;

  // Annotation style
  const annotationStyle = {
    ...S.annotationBase,
    ...(annotation.cls === 'warn' ? S.annotationWarn : {}),
    ...(annotation.cls === 'danger' ? S.annotationDanger : {}),
  };

  function handleSliderChange(e) {
    const val = Number(e.target.value);
    setSliderValue(val);
    setRegulated(false);
  }

  function handleRegulation() {
    setRegulated(true);
    setSliderValue(0);
  }

  return (
    <GraphCard
      id="d2bis"
      title={"Your tail risk is not your own \u2014 supply chain accumulation"}
      subtitle={"Slide to set the fraction of your suppliers running unmanaged AI (G0). Each G0 supplier injects risk into your supply chain that compounds your own exposure. The effect is convex \u2014 the last 20% of unmanaged suppliers costs more than the first."}
    >
      <div>
      {/* Legend */}
      <div style={S.legendRow}>
        <div style={S.legItem}>
          <div style={{ ...S.legDot, background: '#22375A' }} />
          Your organisation (governed)
        </div>
        <div style={S.legItem}>
          <div style={{ ...S.legDot, background: '#4A7C59' }} />
          Supplier {'\u2014'} G2 governed
        </div>
        <div style={S.legItem}>
          <div style={{ ...S.legDot, background: '#B5403F' }} />
          Supplier {'\u2014'} G0 unmanaged
        </div>
      </div>

      <div style={S.layout}>
        {/* Left column: diagram + curve */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <NetworkDiagram supplierT={supplierT} fracG0={fracG0} />
          <OmegaCurve fracG0={fracG0} regulationActive={regulated} />
        </div>

        {/* Right column: controls */}
        <div style={S.controls}>
          {/* Slider */}
          <div style={S.sliderSection}>
            <div style={S.sliderHeader}>
              <span style={S.sliderLabel}>Suppliers running unmanaged AI (G0)</span>
              <span style={{ ...S.sliderPct, color: pctColor }}>{Math.round(fracG0 * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={10}
              value={sliderValue}
              onChange={handleSliderChange}
              style={S.sliderInput}
            />
            <div style={S.sliderEnds}>
              <span>{'0% \u2014 all governed'}</span>
              <span>{'100% \u2014 none governed'}</span>
            </div>
          </div>

          {/* Metric cards */}
          <div style={S.metricGroup}>
            {/* Card 1: omega_eff */}
            <div style={S.metricCard}>
              <div style={S.metricLbl}>Supply chain multiplier ({'\u03c9'}_eff)</div>
              <div style={{ ...S.metricVal, color: omegaColor }}>{omega.toFixed(2)}{'\u00d7'}</div>
              <div style={S.metricSub}>{omegaSub}</div>
            </div>

            {/* Card 2: Effective P99xtheta */}
            <div style={S.metricCard}>
              <div style={S.metricLbl}>Effective P99{'\u00d7'}{'\u03b8'} (your own = {fmt(p99Own)})</div>
              <div style={{ ...S.metricVal, color: p99Color }}>{fmt(effectiveP99)}</div>
              <div style={S.metricSub}>{p99Sub}</div>
            </div>

            {/* Card 3: Excess */}
            <div style={S.metricCard}>
              <div style={S.metricLbl}>Excess P99{'\u00d7'}{'\u03b8'} from supply chain</div>
              <div style={{ ...S.metricVal, color: excessColor }}>
                {excess > 0 ? `+ ${fmt(excess)}` : '+ 0'}
              </div>
              <div style={S.metricSub}>{excessSub}</div>
            </div>
          </div>

          {/* Annotation */}
          <div style={annotationStyle}>
            {annotation.text}
          </div>

          {/* Regulation button */}
          <button
            style={{ ...S.regBtn, opacity: regulated ? 0.5 : 1 }}
            onClick={handleRegulation}
          >
            {'\u2713'} Add regulation {'\u2014'} mandate supplier G2
          </button>
        </div>
      </div>

      {/* Bottom note */}
      <div style={S.bottomNote}>
        <strong>Why convex?</strong>{' '}
        The first G0 suppliers add moderate risk {'\u2014'} your supply chain can absorb some exposure.
        As the fraction grows, correlated failures become increasingly likely to cascade simultaneously.
        At 100%, your effective P99 is 80% above your own {'\u2014'} even though your own AI is fully governed.
        Regulation that mandates G2 for suppliers collapses {'\u03c9'}_eff back to 1.0 in one step.
      </div>

      {/* Disclaimer */}
      <div style={S.disclaimer}>
        {'\u03c9'}_eff = 1.0 + 0.8 {'\u00d7'} (fraction_G0)^1.5. Own P99{'\u00d7'}{'\u03b8'} = {fmt(p99Own)} (v5 central case, G0
        unmanaged). Supplier AI errors feed decision inputs (decision-chain contagion),
        distinct from the shared {'\u03be'}_t vendor correlation in V6 (+4% inter-firm effect).
        The convex shape reflects increasing cascade probability
        as the fraction of unmanaged suppliers grows. v5 Monte Carlo simulation.
      </div>
      </div>
    </GraphCard>
  );
}
