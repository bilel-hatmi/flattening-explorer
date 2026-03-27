import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useCSV } from '../../hooks/useCSV';
import { useProfile } from '../../context/ProfileContext';
import GraphCard from '../ui/GraphCard';
import GraphSkeleton from '../ui/GraphSkeleton';

// ── Constants ────────────────────────────────────────────────────────────────

const SCENARIOS = ['baseline', 'G0', 'G1', 'G2'];

const SC_META = {
  baseline: { label: 'No AI',             color: '#888780' },
  G0:       { label: 'Unmanaged AI',      color: '#B5403F' },
  G1:       { label: 'Passive guardrails', color: '#C49A3C' },
  G2:       { label: 'Active governance',  color: '#4A7C59' },
};

const PANELS = [
  {
    key: 'mean_loss',
    title: 'Average quarterly loss',
    subtitle: 'What dashboards report',
    yMin: 350,
    yMax: 900,
    yFmt: (v) => Math.round(v).toLocaleString(),
    badgeG0: { text: '\u2193 Looks like improvement', cls: 'good' },
    badgeOff: 'Average loss \u2014 stable without AI',
  },
  {
    key: 'p99_brut',
    title: 'Worst-case quarter (P99)',
    subtitle: 'One-in-a-hundred quarter loss',
    yMin: 500,
    yMax: 1900,
    yFmt: (v) => Math.round(v).toLocaleString(),
    badgeG0: { text: '\u2191 Tail risk builds silently', cls: 'bad' },
    badgeOff: 'P99 loss \u2014 stable without AI',
  },
  {
    key: 'tail_ratio',
    title: 'Tail ratio (P99 \u00f7 average)',
    subtitle: 'How much worse the worst case is vs average',
    yMin: 1.0,
    yMax: 3.6,
    yFmt: (v) => v.toFixed(1) + '\u00d7',
    badgeG0: { text: '\u2191 Tail risk remains structurally elevated', cls: 'alert' },
    badgeOff: 'Tail ratio \u2014 stable without AI',
  },
];

// ── Canvas draw for a single panel ───────────────────────────────────────────

function drawPanel(ctx, W, H, panel, seriesMap, activeSet, hoveredQ) {
  const dpr = window.devicePixelRatio || 1;
  ctx.canvas.width = W * dpr;
  ctx.canvas.height = H * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const PAD = { l: 42, r: 10, t: 8, b: 22 };
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;

  const { yMin, yMax, yFmt, key } = panel;

  // Coordinate mappers
  const xPx = (t) => PAD.l + ((t - 1) / 19) * cW;
  const yPx = (v) => PAD.t + cH * (1 - (v - yMin) / (yMax - yMin));

  // Grid lines (horizontal)
  const yTicks = computeTicks(yMin, yMax, 4);
  ctx.font = '9px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  yTicks.forEach((v) => {
    const y = yPx(v);
    ctx.strokeStyle = 'rgba(0,0,0,0.04)';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(PAD.l, y);
    ctx.lineTo(PAD.l + cW, y);
    ctx.stroke();
    ctx.fillStyle = '#A0A09A';
    ctx.fillText(yFmt(v), PAD.l - 6, y);
  });

  // X ticks — max 6
  const xTicks = [1, 4, 8, 12, 16, 20];
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  xTicks.forEach((t) => {
    const x = xPx(t);
    // Vertical grid
    ctx.strokeStyle = 'rgba(0,0,0,0.04)';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(x, PAD.t);
    ctx.lineTo(x, PAD.t + cH);
    ctx.stroke();
    // Label
    ctx.fillStyle = '#A0A09A';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillText(String(t), x, PAD.t + cH + 4);
  });

  // Draw lines — order: baseline, G2, G1, G0 (G0 on top)
  const drawOrder = ['baseline', 'G2', 'G1', 'G0'];
  drawOrder.forEach((sc) => {
    if (!activeSet.has(sc)) return;
    const pts = seriesMap[sc];
    if (!pts || pts.length === 0) return;

    const meta = SC_META[sc];
    ctx.strokeStyle = meta.color;
    ctx.lineWidth = sc === 'G0' ? 2.4 : 1.8;
    ctx.setLineDash([]);
    ctx.beginPath();
    pts.forEach((pt, i) => {
      const x = xPx(pt.t);
      const y = yPx(clamp(pt[key], yMin, yMax));
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  });

  // Crosshair
  if (hoveredQ !== null && hoveredQ >= 1 && hoveredQ <= 20) {
    const x = xPx(hoveredQ);
    ctx.save();
    ctx.setLineDash([3, 4]);
    ctx.strokeStyle = 'rgba(34,55,90,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, PAD.t);
    ctx.lineTo(x, PAD.t + cH);
    ctx.stroke();
    ctx.restore();

    // Draw hover dots and values
    drawOrder.forEach((sc) => {
      if (!activeSet.has(sc)) return;
      const pts = seriesMap[sc];
      if (!pts) return;
      const pt = pts.find((p) => p.t === hoveredQ);
      if (!pt) return;
      const meta = SC_META[sc];
      const val = pt[key];
      const px = xPx(hoveredQ);
      const py = yPx(clamp(val, yMin, yMax));
      // Dot
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = meta.color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([]);
      ctx.stroke();
    });
  }

  return { PAD, cW, cH, xPx, yPx };
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function computeTicks(min, max, count) {
  const step = (max - min) / (count - 1);
  const ticks = [];
  for (let i = 0; i < count; i++) {
    ticks.push(min + step * i);
  }
  return ticks;
}

// ── Tooltip component ────────────────────────────────────────────────────────

function PanelTooltip({ panel, seriesMap, activeSet, hoveredQ, canvasRef }) {
  if (hoveredQ === null || !canvasRef.current) return null;

  // Gather values for the hovered quarter
  const entries = [];
  SCENARIOS.forEach((sc) => {
    if (!activeSet.has(sc)) return;
    const pts = seriesMap[sc];
    if (!pts) return;
    const pt = pts.find((p) => p.t === hoveredQ);
    if (!pt) return;
    entries.push({ sc, label: SC_META[sc].label, color: SC_META[sc].color, val: pt[panel.key] });
  });

  if (entries.length === 0) return null;

  // Compute tooltip position from the canvas
  const canvas = canvasRef.current;
  const rect = canvas.getBoundingClientRect();
  const cW = rect.width;
  const PAD_L = 42;
  const PAD_R = 10;
  const chartW = cW - PAD_L - PAD_R;
  const xFrac = (hoveredQ - 1) / 19;
  const xPos = PAD_L + xFrac * chartW;

  // Position tooltip either left or right of cursor
  const tooltipLeft = xFrac > 0.6 ? xPos - 140 : xPos + 16;

  return (
    <div
      style={{
        position: 'absolute',
        left: tooltipLeft,
        top: 10,
        background: '#fff',
        border: '0.5px solid rgba(0,0,0,0.10)',
        borderRadius: 6,
        padding: '8px 10px',
        zIndex: 20,
        pointerEvents: 'none',
        minWidth: 120,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, fontWeight: 500, color: '#1A1A1A', marginBottom: 5 }}>
        Quarter {hoveredQ}
      </div>
      {entries.map((e) => (
        <div key={e.sc} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: e.color, flexShrink: 0 }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#73726C' }}>
            {panel.yFmt(e.val)}
          </span>
          <span style={{ fontSize: 9, color: '#A0A09A' }}>{e.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Scenario Toggles ─────────────────────────────────────────────────────────

function ScenarioToggles({ active, onToggle }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
      {SCENARIOS.map((sc) => {
        const meta = SC_META[sc];
        const isActive = active.has(sc);
        return (
          <button
            key={sc}
            onClick={() => onToggle(sc)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '5px 13px 5px 9px',
              borderRadius: 6,
              border: isActive ? '0.5px solid #22375A' : '0.5px solid rgba(0,0,0,0.14)',
              background: isActive ? '#22375A' : 'transparent',
              color: isActive ? '#fff' : '#73726C',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                flexShrink: 0,
                background: meta.color,
                opacity: isActive ? 1 : 0.45,
                transition: 'opacity 0.2s',
              }}
            />
            {meta.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Trend Badge ──────────────────────────────────────────────────────────────

const BADGE_STYLES = {
  good:  { background: 'rgba(74,124,89,0.10)',  color: '#4A7C59' },
  bad:   { background: 'rgba(181,64,63,0.10)',   color: '#B5403F' },
  alert: { background: 'rgba(196,154,60,0.10)',  color: '#C49A3C' },
  off:   { background: 'rgba(136,135,128,0.08)', color: '#73726C' },
};

function TrendBadge({ panel, g0Active }) {
  const cfg = g0Active ? panel.badgeG0 : null;
  const text = cfg ? cfg.text : panel.badgeOff;
  const cls = cfg ? cfg.cls : 'off';
  const s = BADGE_STYLES[cls];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 9,
        fontWeight: 600,
        padding: '2px 7px',
        borderRadius: 4,
        marginBottom: 10,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        background: s.background,
        color: s.color,
      }}
    >
      {text}
    </span>
  );
}

// ── Single Panel wrapper ─────────────────────────────────────────────────────

function Panel({ panel, seriesMap, activeSet, hoveredQ, onHover, isFirst }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const g0Active = activeSet.has('G0');

  const draw = useCallback(() => {
    if (!canvasRef.current || !wrapRef.current) return;
    const W = wrapRef.current.clientWidth;
    const H = 130;
    drawPanel(canvasRef.current.getContext('2d'), W, H, panel, seriesMap, activeSet, hoveredQ);
  }, [panel, seriesMap, activeSet, hoveredQ]);

  useEffect(() => {
    draw();
    const onResize = () => draw();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [draw]);

  // Mouse tracking for crosshair
  const handleMouseMove = useCallback(
    (e) => {
      if (!wrapRef.current) return;
      const rect = wrapRef.current.getBoundingClientRect();
      const PAD_L = 42;
      const PAD_R = 10;
      const chartW = rect.width - PAD_L - PAD_R;
      const relX = e.clientX - rect.left - PAD_L;
      if (relX < 0 || relX > chartW) {
        onHover(null);
        return;
      }
      const frac = relX / chartW;
      const q = Math.round(frac * 19) + 1;
      onHover(Math.max(1, Math.min(20, q)));
    },
    [onHover]
  );

  const handleMouseLeave = useCallback(() => {
    onHover(null);
  }, [onHover]);

  return (
    <div
      style={{
        padding: '16px 12px 10px',
        background: '#fff',
        position: 'relative',
        borderLeft: isFirst ? 'none' : '0.5px solid rgba(0,0,0,0.07)',
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: '#22375A',
          marginBottom: 2,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        {panel.title}
      </div>
      <div
        style={{
          fontSize: 9,
          color: '#A0A09A',
          marginBottom: 12,
          lineHeight: 1.4,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        {panel.subtitle}
      </div>
      <TrendBadge panel={panel} g0Active={g0Active} />
      <div
        ref={wrapRef}
        style={{ position: 'relative', height: 130 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        />
        <PanelTooltip
          panel={panel}
          seriesMap={seriesMap}
          activeSet={activeSet}
          hoveredQ={hoveredQ}
          canvasRef={canvasRef}
        />
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function A2_SilentDrift() {
  const { profileId } = useProfile();
  const profile = profileId || 'P3';
  const { data, loading } = useCSV('trajectories_by_profile_b030.csv');
  const [activeSet, setActiveSet] = useState(new Set(SCENARIOS));
  const [hoveredQ, setHoveredQ] = useState(null);

  // Parse CSV into { baseline: [{t, mean_loss, p99_brut, tail_ratio, ...}], G0: [...], ... }
  const seriesMap = useMemo(() => {
    if (!data) return {};
    const map = {};
    data.forEach((row) => {
      if (row.profile_id !== profile) return;
      const sc = row.scenario;
      if (!SCENARIOS.includes(sc)) return;
      if (!map[sc]) map[sc] = [];
      map[sc].push({
        t: +row.t,
        mean_loss: +row.mean_loss,
        p99_brut: +row.p99_brut,
        p99_theta: +row.p99_theta,
        tail_ratio: +row.tail_ratio,
      });
    });
    // Sort each scenario by t
    Object.values(map).forEach((arr) => arr.sort((a, b) => a.t - b.t));
    return map;
  }, [data, profile]);

  // Auto-detect Y ranges from data (with fallback to spec ranges)
  const adjustedPanels = useMemo(() => {
    return PANELS.map((panel) => {
      let dMin = Infinity;
      let dMax = -Infinity;
      SCENARIOS.forEach((sc) => {
        const pts = seriesMap[sc];
        if (!pts) return;
        pts.forEach((pt) => {
          const v = pt[panel.key];
          if (v < dMin) dMin = v;
          if (v > dMax) dMax = v;
        });
      });
      if (!isFinite(dMin)) return panel;

      // Use data-driven range with 10% padding, but keep spec range as fallback
      const range = dMax - dMin;
      const padded = range * 0.12;
      const newMin = Math.min(panel.yMin, Math.floor(dMin - padded));
      const newMax = Math.max(panel.yMax, Math.ceil(dMax + padded));
      return { ...panel, yMin: newMin, yMax: newMax };
    });
  }, [seriesMap]);

  const handleToggle = useCallback((sc) => {
    setActiveSet((prev) => {
      const next = new Set(prev);
      if (next.has(sc)) {
        if (next.size === 1) return prev; // min 1 active
        next.delete(sc);
      } else {
        next.add(sc);
      }
      return next;
    });
  }, []);

  const handleHover = useCallback((q) => {
    setHoveredQ(q);
  }, []);

  if (loading) {
    return (
      <GraphCard title="How AI adoption drifts silently toward the tail">
        <GraphSkeleton height={300} />
      </GraphCard>
    );
  }

  const profileLabel =
    profile === 'P3'
      ? 'Strategy consulting profile (Paris)'
      : profile;

  return (
    <GraphCard
      id="a2"
      title="How AI adoption drifts silently toward the tail"
      subtitle={`Three signals tracked over 20 quarters: what dashboards report, and two tail-risk metrics that drift in parallel, invisible to standard KPIs. ${profileLabel}`}
    >
      <ScenarioToggles active={activeSet} onToggle={handleToggle} />

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
        {adjustedPanels.map((panel, i) => (
          <Panel
            key={panel.key}
            panel={panel}
            seriesMap={seriesMap}
            activeSet={activeSet}
            hoveredQ={hoveredQ}
            onHover={handleHover}
            isFirst={i === 0}
          />
        ))}
      </div>

      <div
        style={{
          textAlign: 'center',
          fontSize: 11,
          color: '#73726C',
          marginBottom: 4,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        Quarter
      </div>

      <div
        style={{
          marginTop: 10,
          fontSize: 10,
          color: '#C0BFB9',
          fontStyle: 'italic',
          textAlign: 'right',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        v5 Monte Carlo simulation. See Calibration.
      </div>
    </GraphCard>
  );
}
