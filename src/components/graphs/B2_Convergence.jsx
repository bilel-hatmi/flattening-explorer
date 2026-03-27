import React, { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import GraphCard from '../ui/GraphCard';

/* ── Design tokens ─────────────────────────────────────────────── */
const COLORS = {
  navy: '#22375A',
  teal: '#619EA8',
  cream: '#F5F4EF',
  danger: '#B5403F',
  success: '#4A7C59',
  neutral: '#888780',
  sublabel: '#616161',
  tickGray: '#A0A09A',
  textGray: '#73726C',
};

/* ── Seeded PRNG for deterministic noise ──────────────────────── */
function makePRNG(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return (s / 0xffffffff - 0.5) * 2;
  };
}

/* ── Mathematical curve generators ────────────────────────────── */

// Concave decay (rapid drop then plateau) -- for var_tau
function concaveDecay(start, end, N, curvature, seed, noiseAmp) {
  const rng = makePRNG(seed);
  return Array.from({ length: N }, (_, i) => {
    const t = i / (N - 1);
    const base = end + (start - end) * Math.exp(-curvature * t);
    return base + rng() * noiseAmp;
  });
}

// Accelerating decay -- for h_bar
function acceleratingDecay(start, end, N, accel, seed, noiseAmp) {
  const rng = makePRNG(seed);
  return Array.from({ length: N }, (_, i) => {
    const t = i / (N - 1);
    const base = start + (end - start) * Math.pow(t, accel);
    return base + rng() * noiseAmp;
  });
}

// Sigmoid -- for follow_rate
function sigmoid(start, end, N, steepness, midpoint, seed, noiseAmp) {
  const rng = makePRNG(seed);
  return Array.from({ length: N }, (_, i) => {
    const t = i / (N - 1);
    const base =
      start + (end - start) / (1 + Math.exp(-steepness * (t - midpoint)));
    return base + rng() * noiseAmp;
  });
}

/* ── Pre-computed data (math functions, NOT CSV) ──────────────── */
const G0_DATA = {
  varTau:     concaveDecay(100, 66, 21, 3.2, 42, 0.6),       // -34%
  hBar:       acceleratingDecay(100, 78, 21, 1.35, 77, 0.4), // -22%
  followRate: sigmoid(100, 120, 21, 8, 0.52, 99, 0.5),        // +20%
};

const G1_DATA = {
  varTau:     concaveDecay(100, 78, 21, 2.4, 23, 0.5),        // -22%
  hBar:       acceleratingDecay(100, 86, 21, 1.2, 61, 0.3),   // -14%
  followRate: sigmoid(100, 112, 21, 6, 0.53, 58, 0.4),         // +12%
};

const G2_DATA = {
  varTau:     concaveDecay(100, 88, 21, 1.8, 13, 0.4),        // -12%
  hBar:       acceleratingDecay(100, 93, 21, 1.1, 51, 0.3),   // -7%
  followRate: sigmoid(100, 105, 21, 4, 0.55, 37, 0.3),         // +5%
};

const BASE_DATA = {
  varTau:     concaveDecay(100, 100, 21, 0, 7, 0.3),           // flat ≈ 100
  hBar:       concaveDecay(100, 100, 21, 0, 9, 0.2),           // flat ≈ 100
  followRate: concaveDecay(100, 100, 21, 0, 11, 0.2),          // flat ≈ 100
};

/* ── Panel configuration ──────────────────────────────────────── */
const PANELS_CONFIG = [
  {
    key: 'varTau',
    title: 'Cognitive diversity',
    sublabel: 'Variance of agent types \— how different agents think',
    direction: '\↓ worse',
    colorG0: COLORS.teal,
    yMin: 55,
    yMax: 108,
    g0Delta: '\−34%', g1Delta: '\−22%', g2Delta: '\−12%',
  },
  {
    key: 'hBar',
    title: 'Independent skill',
    sublabel: 'Average competence to judge without AI assistance',
    direction: '\↓ worse',
    colorG0: COLORS.navy,
    yMin: 72,
    yMax: 108,
    g0Delta: '\−22%', g1Delta: '\−14%', g2Delta: '\−7%',
  },
  {
    key: 'followRate',
    title: 'Surrender rate',
    sublabel: 'Share of agents who follow AI output without verification',
    direction: '\↑ worse',
    colorG0: COLORS.danger,
    yMin: 92,
    yMax: 128,
    g0Delta: '+20%', g1Delta: '+12%', g2Delta: '+5%',
  },
];

/* ── Helpers ────────────────────────────────────────────────────── */
function toPoints(arr) {
  return arr.map((val, i) => ({ t: i, val }));
}

const COLOR_G1   = '#C49A3C';  // amber — partial governance
const COLOR_G2   = '#4A7C59';  // green — active governance (solid, visible)
const COLOR_BASE = 'rgba(34,55,90,0.20)'; // very light — no AI baseline

/* ── Canvas drawing ─────────────────────────────────────────────── */
function drawPanel(ctx, W, H, g0Points, g1Points, g2Points, basePoints, panelCfg, hoveredT) {
  const dpr = window.devicePixelRatio || 1;
  ctx.canvas.width = W * dpr;
  ctx.canvas.height = H * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const PAD = { l: 32, r: 12, t: 8, b: 28 };
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;

  const { yMin, yMax, colorG0 } = panelCfg;
  const tMin = 0;
  const tMax = 20;

  const xPx = (t) => PAD.l + ((t - tMin) / (tMax - tMin)) * cW;
  const yPx = (v) => PAD.t + cH * (1 - (v - yMin) / (yMax - yMin));

  // Grid lines -- vertical
  ctx.strokeStyle = 'rgba(0,0,0,0.04)';
  ctx.lineWidth = 1;
  for (let t = 5; t <= tMax; t += 5) {
    const x = xPx(t);
    ctx.beginPath();
    ctx.moveTo(x, PAD.t);
    ctx.lineTo(x, PAD.t + cH);
    ctx.stroke();
  }

  // Grid lines -- horizontal
  const yRange = yMax - yMin;
  const yStep = yRange > 40 ? 10 : 5;
  for (let v = Math.ceil(yMin / yStep) * yStep; v <= yMax; v += yStep) {
    if (v === 100) continue; // Reference line drawn separately
    const y = yPx(v);
    ctx.beginPath();
    ctx.moveTo(PAD.l, y);
    ctx.lineTo(PAD.l + cW, y);
    ctx.stroke();
  }

  // Reference line at y=100
  const y100 = yPx(100);
  if (y100 >= PAD.t && y100 <= PAD.t + cH) {
    ctx.save();
    ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(34,55,90,0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD.l, y100);
    ctx.lineTo(PAD.l + cW, y100);
    ctx.stroke();
    // Label "100"
    ctx.fillStyle = 'rgba(34,55,90,0.35)';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText('100', PAD.l - 3, y100 + 3);
    ctx.restore();
  }

  // X ticks
  ctx.font = '9px "JetBrains Mono", monospace';
  ctx.fillStyle = COLORS.tickGray;
  ctx.textAlign = 'center';
  for (let t = 0; t <= tMax; t += 5) {
    const x = xPx(t);
    ctx.fillText(t.toString(), x, PAD.t + cH + 14);
  }

  // Y ticks (sparse)
  ctx.textAlign = 'right';
  for (let v = Math.ceil(yMin / yStep) * yStep; v <= yMax; v += yStep) {
    if (v === 100) continue;
    const y = yPx(v);
    ctx.fillText(v.toFixed(0), PAD.l - 3, y + 3);
  }

  function drawLine(points, color, lineWidth, dash) {
    if (!points || points.length < 2) return;
    ctx.save();
    ctx.setLineDash(dash || []);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    points.forEach((p, i) => {
      const x = xPx(p.t); const y = yPx(p.val);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.restore();
  }

  // Draw back-to-front: Baseline → G2 → G1 → G0 (G0 on top)
  drawLine(basePoints, COLOR_BASE, 1.5, [4, 4]);
  drawLine(g2Points,   COLOR_G2,   2.5);
  drawLine(g1Points,   COLOR_G1,   2.0, [8, 3]);
  drawLine(g0Points,   colorG0,    2.8);

  // Hover crosshair
  if (hoveredT !== null) {
    const xH = xPx(hoveredT);
    if (xH >= PAD.l && xH <= PAD.l + cW) {
      ctx.save();
      ctx.setLineDash([3, 4]);
      ctx.strokeStyle = 'rgba(34,55,90,0.20)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(xH, PAD.t);
      ctx.lineTo(xH, PAD.t + cH);
      ctx.stroke();
      ctx.restore();

      // Tooltip dots
      const g0Val   = g0Points.find((p) => p.t === hoveredT);
      const g1Val   = g1Points.find((p) => p.t === hoveredT);
      const g2Val   = g2Points.find((p) => p.t === hoveredT);
      const baseVal = basePoints.find((p) => p.t === hoveredT);

      const dotDefs = [
        { val: g0Val,   color: colorG0,    r: 4 },
        { val: g1Val,   color: COLOR_G1,   r: 3.5 },
        { val: g2Val,   color: COLOR_G2,   r: 3.5 },
        { val: baseVal, color: COLOR_BASE, r: 3 },
      ];
      dotDefs.forEach(({ val, color, r }) => {
        if (!val) return;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(xH, yPx(val.val), r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Tooltip box
      if (g0Val || g2Val) {
        const tooltipX = xH + 12;
        const tooltipY = PAD.t + 8;
        const lines = [`Quarter ${hoveredT}`];
        if (g0Val)   lines.push(`G0:       ${g0Val.val.toFixed(1)}`);
        if (g1Val)   lines.push(`G1:       ${g1Val.val.toFixed(1)}`);
        if (g2Val)   lines.push(`G2:       ${g2Val.val.toFixed(1)}`);
        if (baseVal) lines.push(`Baseline: ${baseVal.val.toFixed(1)}`);

        const boxW = 110;
        const boxH = 12 + lines.length * 14;

        // Flip tooltip if near right edge
        const drawX =
          tooltipX + boxW > W - PAD.r ? xH - 12 - boxW : tooltipX;

        ctx.save();
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = 'rgba(0,0,0,0.10)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.roundRect(drawX, tooltipY, boxW, boxH, 4);
        ctx.fill();
        ctx.stroke();

        ctx.textAlign = 'left';
        lines.forEach((line, li) => {
          if (li === 0) {
            ctx.font = '500 11px "Plus Jakarta Sans", sans-serif';
            ctx.fillStyle = '#1A1A1A';
          } else {
            ctx.font = '10px "JetBrains Mono", monospace';
            ctx.fillStyle = COLORS.textGray;
          }
          ctx.fillText(line, drawX + 8, tooltipY + 12 + li * 14);
        });
        ctx.restore();
      }
    }
  }
}

/* ── Single Panel Sub-component ─────────────────────────────────── */
function Panel({ panelCfg, g0Points, g1Points, g2Points, basePoints, hoveredT, onHover, idx }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);

  const draw = useCallback(() => {
    if (!canvasRef.current || !wrapRef.current) return;
    const W = wrapRef.current.clientWidth;
    const H = 130;
    drawPanel(
      canvasRef.current.getContext('2d'),
      W, H,
      g0Points, g1Points, g2Points, basePoints,
      panelCfg, hoveredT
    );
  }, [g0Points, g1Points, g2Points, basePoints, panelCfg, hoveredT]);

  useEffect(() => {
    draw();
    const onResize = () => draw();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [draw]);

  // Mouse tracking for hover
  const handleMouseMove = useCallback(
    (e) => {
      if (!wrapRef.current || g0Points.length === 0) return;
      const rect = wrapRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const W = rect.width;
      const PAD_L = 32;
      const PAD_R = 12;
      const cW = W - PAD_L - PAD_R;

      const tRaw = ((x - PAD_L) / cW) * 20;
      const tClamped = Math.max(0, Math.min(20, Math.round(tRaw)));
      onHover(tClamped);
    },
    [g0Points, onHover]
  );

  const handleMouseLeave = useCallback(() => {
    onHover(null);
  }, [onHover]);

  return (
    <div
      style={{
        padding: '16px 14px 12px',
        background: '#fff',
        borderLeft: idx !== 0 ? '0.5px solid rgba(0,0,0,0.07)' : undefined,
        flex: 1,
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: COLORS.navy,
          marginBottom: 2,
          lineHeight: 1.3,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        {panelCfg.title}
      </div>
      <div
        style={{
          fontSize: 9,
          color: COLORS.sublabel,
          marginBottom: 4,
          lineHeight: 1.4,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        {panelCfg.sublabel}
      </div>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 3,
          fontSize: 9,
          fontWeight: 600,
          color: COLORS.danger,
          marginBottom: 10,
          opacity: 0.75,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        {panelCfg.direction}
      </div>

      <div
        ref={wrapRef}
        style={{ position: 'relative', height: 130 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        />
      </div>

      {/* Delta pills */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginTop: 8,
          flexWrap: 'wrap',
        }}
      >
        {[
          { label: 'G0', delta: panelCfg.g0Delta, bg: 'rgba(181,64,63,0.08)', color: COLORS.danger },
          { label: 'G1', delta: panelCfg.g1Delta, bg: 'rgba(196,154,60,0.10)', color: COLOR_G1 },
          { label: 'G2', delta: panelCfg.g2Delta, bg: 'rgba(74,124,89,0.08)', color: COLOR_G2 },
        ].map(({ label, delta, bg, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 4, fontSize: 9, fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, background: bg, color }}>
            {label} at Q20: {delta}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Legend ──────────────────────────────────────────────────────── */
function Legend() {
  const items = [
    { label: 'Cognitive diversity \— Var(\τ)', color: COLORS.teal,   style: 'solid' },
    { label: 'Mean skill \— h\̄',              color: COLORS.navy,   style: 'solid' },
    { label: 'Surrender rate',                 color: COLORS.danger, style: 'solid' },
    { label: 'No governance (G0)',             color: COLORS.danger, style: 'reference', marginLeft: 8 },
    { label: 'Light governance (G1)',          color: COLOR_G1,      style: 'dashed' },
    { label: 'Active governance (G2)',         color: COLOR_G2,      style: 'solid' },
    { label: 'No AI (baseline)',               color: COLOR_BASE,    style: 'dashed' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        gap: 20,
        alignItems: 'center',
        marginBottom: 20,
        flexWrap: 'wrap',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {items.map((item) => (
        <div
          key={item.label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            fontSize: 11,
            color: item.color || COLORS.neutral,
            marginLeft: item.marginLeft || 0,
          }}
        >
          <span
            style={{
              width: 24,
              height: 0,
              flexShrink: 0,
              borderTop:
                item.style === 'solid'
                  ? `2.5px solid ${item.color}`
                  : item.style === 'dashed'
                  ? `2px dashed ${item.color}`
                  : `1.5px solid rgba(34,55,90,0.25)`,
            }}
          />
          {item.label}
        </div>
      ))}
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────────── */
export default function B2_Convergence() {
  const [hoveredT, setHoveredT] = useState(null);

  const panelData = useMemo(() => {
    const result = {};
    PANELS_CONFIG.forEach((cfg) => {
      result[cfg.key] = {
        G0:   toPoints(G0_DATA[cfg.key]),
        G1:   toPoints(G1_DATA[cfg.key]),
        G2:   toPoints(G2_DATA[cfg.key]),
        BASE: toPoints(BASE_DATA[cfg.key]),
      };
    });
    return result;
  }, []);

  const handleHover = useCallback((t) => {
    setHoveredT(t);
  }, []);

  return (
    <GraphCard
      id="b2"
      title="The self-tightening trap, three channels converging over 20 quarters"
      subtitle="All three indices start at 100. Under unmanaged AI (G0), each channel drifts in the dangerous direction, independently and simultaneously. By quarter 20, the organisation has cognitive diversity falls, independent judgment weakens, and surrender rates climb. Active governance (G2) stabilises all three channels near baseline."
    >
      {/* Legend */}
      <Legend />

      {/* Three-panel row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 0,
          border: '0.5px solid rgba(0,0,0,0.07)',
          borderRadius: 8,
          overflow: 'hidden',
          marginBottom: 8,
        }}
      >
        {PANELS_CONFIG.map((cfg, idx) => (
          <Panel
            key={cfg.key}
            panelCfg={cfg}
            g0Points={panelData[cfg.key].G0}
            g1Points={panelData[cfg.key].G1}
            g2Points={panelData[cfg.key].G2}
            basePoints={panelData[cfg.key].BASE}
            hoveredT={hoveredT}
            onHover={handleHover}
            idx={idx}
          />
        ))}
      </div>

      {/* X axis label */}
      <div
        style={{
          textAlign: 'center',
          fontSize: 11,
          color: COLORS.textGray,
          marginBottom: 16,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        Quarter &mdash; index: 100 = organisation at AI adoption (quarter 0)
      </div>

      {/* Insight block */}
      <div
        style={{
          background: 'rgba(34,55,90,0.04)',
          borderLeft: '2px solid rgba(34,55,90,0.25)',
          borderRadius: '0 6px 6px 0',
          padding: '10px 14px',
          fontSize: 10,
          color: COLORS.navy,
          lineHeight: 1.6,
          marginTop: 4,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        <strong style={{ fontWeight: 600 }}>
          Why the trap self-tightens:
        </strong>{' '}
        screening selects for conformity &rarr; cognitive diversity falls &rarr;
        the few dissenters who might resist AI errors disappear &rarr; surrender
        rate rises &rarr; agents stop practising independent judgment &rarr;
        skill erodes &rarr; surrender rate rises further. The longer governance
        is deferred, the more entrenched each channel becomes &mdash; and the
        more costly the transition back.
      </div>

      {/* Disclaimer */}
      <div
        style={{
          marginTop: 12,
          fontSize: 10,
          color: '#C0BFB9',
          fontStyle: 'italic',
          textAlign: 'right',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        Simulation outputs normalised to index 100 at t=0 (strategy consulting
        profile, P3)
      </div>
    </GraphCard>
  );
}
