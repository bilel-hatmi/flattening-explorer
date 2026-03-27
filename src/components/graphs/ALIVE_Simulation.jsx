import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import GraphCard from '../ui/GraphCard';
import Toggle from '../ui/Toggle';
import { usePyodide } from '../../hooks/usePyodide';
import { useCSV } from '../../hooks/useCSV';
import { useProfile } from '../../context/ProfileContext';
import { PROFILES } from '../../data/v5_reference';
import { PROFILE_IDS, getProfileLabel } from '../../data/profiles';

// ── CONSTANTS ────────────────────────────────────────────────────────────────
const P99 = 1097; // v5 validated — never use 1115
const Y_MAX = 1600;
const N = 20;
const Y_TICKS = [0, 500, 1000, 1500];
const PAD_L = 36, PAD_R = 10, PAD_T = 16, PAD_B = 8;

function classify(loss) {
  if (loss > P99) return 'SHOCK';
  if (loss > 600) return 'Stress';
  return 'Normal';
}

function barColor(status) {
  if (status === 'SHOCK')  return '#B5403F';
  if (status === 'Stress') return '#C49A3C';
  return '#4A7C59';
}

function statusClass(status) {
  if (status === 'SHOCK')  return 'danger';
  if (status === 'Stress') return 'warning';
  return 'success';
}

// ── STYLES ───────────────────────────────────────────────────────────────────
const styles = {
  counterRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 10,
    marginBottom: 10,
  },
  counterCard: {
    background: '#F5F4EF',
    borderRadius: 8,
    padding: '11px 13px',
  },
  counterLabel: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 9,
    color: '#A0A09A',
    marginBottom: 3,
  },
  counterValue: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 20,
    fontWeight: 500,
    color: '#22375A',
    lineHeight: 1.1,
    transition: 'color 0.3s',
  },
  toastRow: {
    height: 28,
    marginBottom: 14,
    display: 'flex',
    alignItems: 'center',
  },
  toast: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    padding: '4px 12px',
    borderRadius: 5,
    fontSize: 11,
    fontWeight: 500,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    transition: 'opacity 0.4s ease',
  },
  toastDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    flexShrink: 0,
  },
  thresholdLegend: {
    display: 'flex',
    gap: 16,
    alignItems: 'center',
    marginBottom: 14,
    flexWrap: 'wrap',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  tlItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 10,
    color: '#73726C',
  },
  tlSwatch: {
    width: 10,
    height: 10,
    borderRadius: 2,
    flexShrink: 0,
  },
  chartArea: {
    position: 'relative',
    height: 260,
    marginBottom: 6,
  },
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  piStrip: {
    display: 'flex',
    height: 14,
    marginBottom: 4,
    borderRadius: 3,
    overflow: 'hidden',
    gap: 0,
  },
  piCell: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 7,
    color: '#A0A09A',
    background: '#F5F4EF',
    transition: 'background 0.3s',
  },
  xAxisLabel: {
    fontSize: 9,
    color: '#A0A09A',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  controls: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  btn: {
    padding: '8px 20px',
    borderRadius: 7,
    border: 'none',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.18s',
  },
  speedLabel: {
    fontSize: 10,
    color: '#A0A09A',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  speedSelect: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    color: '#22375A',
    background: '#F5F4EF',
    border: '0.5px solid rgba(0,0,0,0.12)',
    borderRadius: 5,
    padding: '3px 6px',
    cursor: 'pointer',
  },
  selectorRow: {
    display: 'flex',
    gap: 14,
    alignItems: 'center',
    marginBottom: 18,
    flexWrap: 'wrap',
  },
  selectWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  selectLabel: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 10,
    color: '#A0A09A',
    fontWeight: 500,
  },
  profileSelect: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 11,
    color: '#22375A',
    background: '#F5F4EF',
    border: '0.5px solid rgba(0,0,0,0.12)',
    borderRadius: 6,
    padding: '5px 10px',
    cursor: 'pointer',
  },
  engineBadge: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 10,
    color: '#A0A09A',
    fontStyle: 'italic',
    marginLeft: 'auto',
  },
  disclaimer: {
    marginTop: 14,
    fontSize: 10,
    color: '#C0BFB9',
    fontStyle: 'italic',
    textAlign: 'right',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
};

// ── COMPONENT ────────────────────────────────────────────────────────────────

export default function ALIVE_Simulation() {
  const { ready: pyodideReady, simulate_one_quarter } = usePyodide();
  const { profileId: contextProfileId } = useProfile();

  // CSV fallback data for P3/G0
  const { data: csvData, loading: csvLoading } = useCSV('/data/ten_replications_P3_G0.csv');

  // Pick a random replication (1-10) once on mount
  const chosenReplicationRef = useRef(null);
  if (chosenReplicationRef.current === null) {
    chosenReplicationRef.current = Math.floor(Math.random() * 10) + 1;
  }

  // Extract the chosen replication's 20 quarters from CSV
  const csvReplication = useMemo(() => {
    if (!csvData) return null;
    const repId = chosenReplicationRef.current;
    const rows = csvData
      .filter(r => r.replication_id === repId)
      .sort((a, b) => a.t - b.t);
    if (rows.length === 0) return null;
    return rows.map(r => ({
      q: r.t,
      loss: r.total_loss,
      is_crisis: r.is_crisis,
      // CSV has no pi column; derive a synthetic pi from loss for display
      // Higher loss => lower pi (more outside exposure)
      pi: r.is_crisis ? 0.30 + Math.random() * 0.15
        : r.total_loss > 600 ? 0.55 + Math.random() * 0.15
        : 0.65 + Math.random() * 0.20,
    }));
  }, [csvData]);

  // Selectors — pre-select from ProfileContext, default P3
  const [profileId, setProfileId] = useState(contextProfileId || 'P3');
  const [scenario, setScenario] = useState('G0');

  // Sync profile selector when context changes (user answers questionnaire)
  useEffect(() => {
    if (contextProfileId) {
      setProfileId(contextProfileId);
    }
  }, [contextProfileId]);

  // Simulation state
  const [quarters, setQuarters] = useState([]); // array of {q, pi, loss, status}
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // multiplier: 2=slow, 1=normal, 0.4=fast
  const [hoveredBar, setHoveredBar] = useState(null);

  // Animation state
  const animRef = useRef({
    animating: false,
    animBar: -1,
    animStart: 0,
    animDur: 500,
    animTarget: 0,
  });

  // Toast state
  const [toast, setToast] = useState({ visible: false, type: 'safe', text: '' });
  const toastTimerRef = useRef(null);

  // Play timer ref
  const playTimerRef = useRef(null);
  const playingRef = useRef(false);
  const speedRef = useRef(speed);
  const quartersRef = useRef(quarters);

  // Canvas
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Seed for Pyodide calls — incrementing to get different quarters
  const seedRef = useRef(Math.floor(Math.random() * 1000000));

  // Keep refs in sync
  useEffect(() => { playingRef.current = playing; }, [playing]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { quartersRef.current = quarters; }, [quarters]);

  // CSV fallback only for P3/G0 when Pyodide not ready
  const canUseCSV = csvReplication != null && !pyodideReady;

  // ── Derived stats ──────────────────────────────────────────────────────────
  const revealed = quarters.length;
  const lastQ = quarters.length > 0 ? quarters[quarters.length - 1] : null;
  const shockCount = quarters.filter(d => d.status === 'SHOCK').length;
  const worstLoss = quarters.length > 0 ? Math.max(...quarters.map(d => d.loss)) : null;

  // ── Toast logic ────────────────────────────────────────────────────────────
  const updateToast = useCallback((quartersArr) => {
    if (quartersArr.length === 0) {
      setToast({ visible: false, type: 'safe', text: '' });
      return;
    }

    const last = quartersArr[quartersArr.length - 1];

    if (last.status === 'SHOCK') {
      clearTimeout(toastTimerRef.current);
      setToast({
        visible: true,
        type: 'shock',
        text: `Quarter ${last.q}: shock. Loss = ${last.loss.toLocaleString()}.`,
      });
      toastTimerRef.current = setTimeout(() => {
        setToast(prev => ({ ...prev, visible: false }));
      }, 4000);
      return;
    }

    // Count consecutive Normal quarters ending at current
    let streak = 0;
    for (let i = quartersArr.length - 1; i >= 0; i--) {
      if (quartersArr[i].status === 'Normal') streak++;
      else break;
    }

    if (streak >= 4) {
      clearTimeout(toastTimerRef.current);
      setToast({
        visible: true,
        type: 'safe',
        text: `${streak} safe quarter${streak > 1 ? 's' : ''} in a row.`,
      });
    } else {
      setToast({ visible: false, type: 'safe', text: '' });
    }
  }, []);

  // ── Canvas draw ────────────────────────────────────────────────────────────
  const draw = useCallback((timestamp) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width / dpr;
    const H = canvas.height / dpr;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    const chartW = W - PAD_L - PAD_R;
    const chartH = H - PAD_T - PAD_B;
    const barW = chartW / N;
    const barGap = barW * 0.20;

    function yPx(val) {
      return PAD_T + chartH * (1 - Math.min(val, Y_MAX) / Y_MAX);
    }

    // Gridlines + Y ticks
    ctx.setLineDash([3, 5]);
    ctx.strokeStyle = 'rgba(0,0,0,0.05)';
    ctx.lineWidth = 1;
    Y_TICKS.forEach(v => {
      const y = yPx(v);
      ctx.beginPath();
      ctx.moveTo(PAD_L, y);
      ctx.lineTo(W - PAD_R, y);
      ctx.stroke();
      ctx.fillStyle = '#A0A09A';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(v === 0 ? '0' : (v / 1000).toFixed(1) + 'k', PAD_L - 4, y + 3);
    });
    ctx.setLineDash([]);

    // P99 reference line
    const yP99 = yPx(P99);
    ctx.save();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = 'rgba(34,55,90,0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(PAD_L, yP99);
    ctx.lineTo(W - PAD_R, yP99);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(34,55,90,0.55)';
    ctx.font = '500 9px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('P99', W - PAD_R - 2, yP99 - 4);
    ctx.restore();

    // X tick labels
    ctx.fillStyle = '#A0A09A';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    [1, 5, 10, 15, 20].forEach(q => {
      const x = PAD_L + (q - 0.5) * barW;
      ctx.fillText(q, x, H - PAD_B + 2);
    });

    const currentQuarters = quartersRef.current;
    const currentRevealed = currentQuarters.length;
    const anim = animRef.current;

    // Bars
    for (let i = 0; i < N; i++) {
      const x = PAD_L + i * barW + barGap / 2;
      const bw = barW - barGap;
      const isRevealed = i < currentRevealed;
      const isCurrent = i === currentRevealed - 1;
      const isHovered = i === hoveredBar && isRevealed;
      const isAnimating = anim.animating && i === anim.animBar;

      if (!isRevealed && !isAnimating) {
        // Placeholder stub
        ctx.fillStyle = 'rgba(0,0,0,0.04)';
        ctx.beginPath();
        ctx.roundRect(x, H - PAD_B - 10, bw, 10, 2);
        ctx.fill();
        continue;
      }

      const d = currentQuarters[i];
      if (!d) continue;

      let displayLoss = d.loss;
      if (isAnimating && timestamp) {
        const elapsed = timestamp - anim.animStart;
        const t = Math.min(elapsed / anim.animDur, 1);
        const ease = 1 - Math.pow(1 - t, 3); // ease-out cubic
        displayLoss = anim.animTarget * ease;
        if (t >= 1) {
          anim.animating = false;
        }
      }

      const yTop = yPx(displayLoss);
      const barH = (H - PAD_B) - yTop;
      if (barH <= 0) continue;

      const color = barColor(d.status);
      const alpha = isHovered ? 1.0 : isCurrent ? 0.95 : 0.80;

      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(x, yTop, bw, barH, [3, 3, 0, 0]);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Current bar ring
      if (isCurrent && !isAnimating) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.45;
        ctx.beginPath();
        ctx.roundRect(x - 1, yTop - 1, bw + 2, barH + 1, [3, 3, 0, 0]);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // Hover tooltip
      if (isHovered && !anim.animating) {
        const tipW = 112, tipH = 50;
        let tx = x + bw / 2 - tipW / 2;
        tx = Math.max(PAD_L, Math.min(tx, W - PAD_R - tipW));
        const ty = Math.max(PAD_T + 2, yTop - tipH - 8);

        ctx.fillStyle = '#fff';
        ctx.strokeStyle = 'rgba(0,0,0,0.10)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.roundRect(tx, ty, tipW, tipH, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#1A1A1A';
        ctx.font = '500 11px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`Quarter ${d.q}`, tx + 10, ty + 16);
        ctx.fillStyle = color;
        ctx.font = '500 12px "JetBrains Mono", monospace';
        ctx.fillText(`Loss: ${d.loss.toLocaleString()}`, tx + 10, ty + 31);
        ctx.fillStyle = '#A0A09A';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillText(`\π = ${d.pi.toFixed(2)}  \· ${d.status}`, tx + 10, ty + 44);
      }
    }

    ctx.restore();

    // Continue animation if still running
    if (anim.animating) {
      requestAnimationFrame(ts => draw(ts));
    }
  }, [hoveredBar]);

  // ── Canvas resize ──────────────────────────────────────────────────────────
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    draw();
  }, [draw]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  // Redraw on quarters or hover change
  useEffect(() => { draw(); }, [quarters, hoveredBar, draw]);

  // ── Mouse hover ────────────────────────────────────────────────────────────
  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width / dpr;
    const chartW = W - PAD_L - PAD_R;
    const bw = chartW / N;
    const idx = Math.floor((mx - PAD_L) / bw);
    const currentRevealed = quartersRef.current.length;
    setHoveredBar(idx >= 0 && idx < currentRevealed ? idx : null);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredBar(null);
  }, []);

  // ── Advance one quarter ────────────────────────────────────────────────────
  const advanceQuarter = useCallback(async () => {
    const currentQuarters = quartersRef.current;
    if (currentQuarters.length >= N) return null;

    const qIndex = currentQuarters.length;
    let newQ;

    if (pyodideReady) {
      // PRIORITY: Live Pyodide simulation — real stochastic calculation
      try {
        const seed = seedRef.current++;
        const result = await simulate_one_quarter(
          parseInt(profileId.replace('P', ''), 10),
          scenario,
          seed
        );
        newQ = {
          q: qIndex + 1,
          pi: result.pi_t != null ? result.pi_t : 0.5,
          loss: result.total_loss,
          status: classify(result.total_loss),
        };
      } catch (err) {
        return null;
      }
    } else if (csvReplication && qIndex < csvReplication.length) {
      // Fallback: CSV pre-computed data (P3/G0 only)
      const csvEntry = csvReplication[qIndex];
      newQ = {
        q: qIndex + 1,
        pi: csvEntry.pi,
        loss: csvEntry.loss,
        status: classify(csvEntry.loss),
      };
    } else {
      // Pyodide not ready and no CSV fallback
      return null;
    }

    const updatedQuarters = [...currentQuarters, newQ];

    // Animate shock bars
    if (newQ.status === 'SHOCK') {
      animRef.current = {
        animating: true,
        animBar: qIndex,
        animStart: performance.now(),
        animDur: 500,
        animTarget: newQ.loss,
      };
    }

    setQuarters(updatedQuarters);
    updateToast(updatedQuarters);

    // Start animation if shock
    if (newQ.status === 'SHOCK') {
      requestAnimationFrame(ts => draw(ts));
    }

    return newQ;
  }, [canUseCSV, csvReplication, profileId, scenario, pyodideReady, simulate_one_quarter, updateToast, draw]);

  // ── Next quarter button ────────────────────────────────────────────────────
  const handleNext = useCallback(async () => {
    await advanceQuarter();
  }, [advanceQuarter]);

  // ── Auto-play ──────────────────────────────────────────────────────────────
  const stopPlay = useCallback(() => {
    playingRef.current = false;
    setPlaying(false);
    clearTimeout(playTimerRef.current);
  }, []);

  const scheduleNext = useCallback(async () => {
    if (!playingRef.current) return;
    const currentQuarters = quartersRef.current;
    if (currentQuarters.length >= N) {
      stopPlay();
      return;
    }

    // Determine next quarter for timing purposes
    const qIndex = currentQuarters.length;
    let nextStatus = 'Normal';

    // In CSV fallback mode for P3/G0, we can peek ahead
    if (canUseCSV && csvReplication && csvReplication[qIndex]) {
      nextStatus = classify(csvReplication[qIndex].loss);
    }

    const mult = speedRef.current;

    // Pre-pause before shock
    const preDelay = nextStatus === 'SHOCK' ? 500 * mult : 0;

    playTimerRef.current = setTimeout(async () => {
      if (!playingRef.current) return;
      const newQ = await advanceQuarter();
      if (!newQ) { stopPlay(); return; }

      // Post-reveal delay based on actual status
      let postDelay;
      if (newQ.status === 'SHOCK')  postDelay = 2000 * speedRef.current;
      else if (newQ.status === 'Stress') postDelay = 1000 * speedRef.current;
      else postDelay = 500 * speedRef.current;

      playTimerRef.current = setTimeout(() => {
        scheduleNext();
      }, postDelay);
    }, preDelay);
  }, [advanceQuarter, stopPlay, canUseCSV, csvReplication]);

  const startPlay = useCallback(() => {
    if (quartersRef.current.length >= N) {
      // Reset first if all quarters revealed
      handleReset();
    }
    playingRef.current = true;
    setPlaying(true);
    scheduleNext();
  }, [scheduleNext]);

  const togglePlay = useCallback(() => {
    if (playingRef.current) {
      stopPlay();
    } else {
      startPlay();
    }
  }, [stopPlay, startPlay]);

  // ── Speed change restarts timer ────────────────────────────────────────────
  const handleSpeedChange = useCallback((e) => {
    const newSpeed = parseFloat(e.target.value);
    setSpeed(newSpeed);
    speedRef.current = newSpeed;
    // If playing, restart the schedule with new speed
    if (playingRef.current) {
      clearTimeout(playTimerRef.current);
      scheduleNext();
    }
  }, [scheduleNext]);

  // ── Reset ──────────────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    stopPlay();
    setQuarters([]);
    quartersRef.current = [];
    setHoveredBar(null);
    animRef.current = { animating: false, animBar: -1, animStart: 0, animDur: 500, animTarget: 0 };
    clearTimeout(toastTimerRef.current);
    setToast({ visible: false, type: 'safe', text: '' });
    seedRef.current = Math.floor(Math.random() * 1000000);
  }, [stopPlay]);

  // Reset when profile or scenario changes
  useEffect(() => {
    handleReset();
  }, [profileId, scenario]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(playTimerRef.current);
      clearTimeout(toastTimerRef.current);
    };
  }, []);

  // ── Profile description for subtitle ───────────────────────────────────────
  const profile = PROFILES[profileId];
  const scenarioLabel = scenario === 'G0' ? 'No AI governance'
    : scenario === 'G1' ? 'Passive guardrails'
    : 'Active governance';

  const subtitle = (
    <span>
      One run. {profile ? `${profile.name}, ${profile.city}` : profileId}. {scenarioLabel}.{' '}
      Most quarters look safe — then the tail arrives.
    </span>
  );

  // ── Pi strip cell background ───────────────────────────────────────────────
  function piCellStyle(d) {
    if (!d) return styles.piCell;
    if (d.status === 'SHOCK') return { ...styles.piCell, background: 'rgba(181,64,63,0.12)', color: '#B5403F' };
    if (d.status === 'Stress') return { ...styles.piCell, background: 'rgba(196,154,60,0.10)', color: '#C49A3C' };
    return { ...styles.piCell, background: '#EEF0F5' };
  }

  // ── Button disabled state ──────────────────────────────────────────────────
  // Disabled only when: all quarters revealed OR playing. CSV fallback always allows P3/G0.
  const engineUnavailable = !pyodideReady && !canUseCSV;
  const nextDisabled = revealed >= N || playing || engineUnavailable;
  const nextLabel = engineUnavailable
    ? 'Engine loading...'
    : (revealed >= N ? 'Complete' : 'Next quarter \→');

  // ── Footnote ───────────────────────────────────────────────────────────────
  const usingCSVFallback = !pyodideReady && canUseCSV;
  const footnote = usingCSVFallback
    ? 'Pre-computed replication (P3, G0) from Monte Carlo batch. Live engine loading in background.'
    : pyodideReady
      ? 'Live Monte Carlo simulation via Pyodide (Python in WebAssembly).'
      : 'Preparing simulation engine...';

  return (
    <GraphCard
      id="alive-simulation"
      title="One organisation, twenty quarters"
      subtitle={subtitle}
      footnote={footnote}
    >
      {/* Profile / Scenario selectors */}
      <div style={styles.selectorRow}>
        <div style={styles.selectWrapper}>
          <span style={styles.selectLabel}>Profile:</span>
          <select
            style={styles.profileSelect}
            value={profileId}
            onChange={(e) => setProfileId(e.target.value)}
          >
            {PROFILE_IDS.map(id => (
              <option key={id} value={id}>{getProfileLabel(id)}</option>
            ))}
          </select>
        </div>
        <div style={styles.selectWrapper}>
          <span style={styles.selectLabel}>Scenario:</span>
          <Toggle
            options={[
              { value: 'G0', label: 'G0' },
              { value: 'G1', label: 'G1' },
              { value: 'G2', label: 'G2' },
            ]}
            value={scenario}
            onChange={setScenario}
          />
        </div>
        <span style={styles.engineBadge}>
          {pyodideReady
            ? '\✓ Engine ready'
            : canUseCSV
              ? '\⏳ Engine loading \— CSV fallback active'
              : 'Preparing simulation engine...'}
        </span>
      </div>

      {/* Metric counters */}
      <div style={styles.counterRow}>
        <div style={styles.counterCard}>
          <div style={styles.counterLabel}>Quarter</div>
          <div style={styles.counterValue}>{revealed} / 20</div>
        </div>
        <div style={styles.counterCard}>
          <div style={styles.counterLabel}>This quarter's loss</div>
          <div style={{
            ...styles.counterValue,
            color: lastQ ? barColor(lastQ.status) : '#22375A',
          }}>
            {lastQ ? lastQ.loss.toLocaleString() : '\—'}
          </div>
        </div>
        <div style={styles.counterCard}>
          <div style={styles.counterLabel}>Shocks (loss above P99)</div>
          <div style={{
            ...styles.counterValue,
            color: shockCount > 0 ? '#B5403F' : '#22375A',
          }}>
            {shockCount}
          </div>
        </div>
        <div style={styles.counterCard}>
          <div style={styles.counterLabel}>Worst quarter recorded</div>
          <div style={{
            ...styles.counterValue,
            color: worstLoss != null
              ? (worstLoss > P99 ? '#B5403F' : worstLoss > 600 ? '#C49A3C' : '#4A7C59')
              : '#22375A',
          }}>
            {worstLoss != null ? worstLoss.toLocaleString() : '\—'}
          </div>
        </div>
      </div>

      {/* False security / shock toast */}
      <div style={styles.toastRow}>
        <div style={{
          ...styles.toast,
          opacity: toast.visible ? 1 : 0,
          background: toast.type === 'shock' ? 'rgba(181,64,63,0.10)' : 'rgba(74,124,89,0.10)',
          color: toast.type === 'shock' ? '#B5403F' : '#4A7C59',
        }}>
          <span style={{
            ...styles.toastDot,
            background: toast.type === 'shock' ? '#B5403F' : '#4A7C59',
          }} />
          <span>{toast.text}</span>
        </div>
      </div>

      {/* Threshold legend */}
      <div style={styles.thresholdLegend}>
        <div style={styles.tlItem}>
          <div style={{ ...styles.tlSwatch, background: '#4A7C59' }} />
          Normal (loss &lt; P99)
        </div>
        <div style={styles.tlItem}>
          <div style={{ ...styles.tlSwatch, background: '#C49A3C' }} />
          Elevated (600–1,097)
        </div>
        <div style={styles.tlItem}>
          <div style={{ ...styles.tlSwatch, background: '#B5403F' }} />
          Shock (loss &gt; P99 = 1,097)
        </div>
        <div style={{ ...styles.tlItem, marginLeft: 'auto' }}>
          <div style={{
            width: 24,
            height: 1,
            borderTop: '1.5px dashed rgba(34,55,90,0.35)',
          }} />
          <span style={{ marginLeft: 6 }}>P99 threshold (1,097)</span>
        </div>
      </div>

      {/* Canvas chart */}
      <div ref={containerRef} style={styles.chartArea}>
        <canvas
          ref={canvasRef}
          style={styles.canvas}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
      </div>

      {/* Pi strip */}
      <div style={styles.piStrip}>
        {Array.from({ length: N }, (_, i) => {
          const d = i < revealed ? quarters[i] : null;
          return (
            <div key={i} style={piCellStyle(d)}>
              {d ? d.pi.toFixed(2) : ''}
            </div>
          );
        })}
      </div>
      <div style={styles.xAxisLabel}>
        Quarter (hover to inspect) — domain exposure {'\π'} shown below
      </div>

      {/* Controls */}
      <div style={styles.controls}>
        <button
          style={{
            ...styles.btn,
            background: nextDisabled ? '#C0BFB9' : '#22375A',
            color: '#fff',
            cursor: nextDisabled ? 'default' : 'pointer',
          }}
          disabled={nextDisabled}
          onClick={handleNext}
        >
          {nextLabel}
        </button>

        <button
          style={{
            ...styles.btn,
            background: playing ? 'rgba(181,64,63,0.08)' : 'transparent',
            color: playing ? '#B5403F' : '#22375A',
            border: playing
              ? '0.5px solid #B5403F'
              : '0.5px solid rgba(34,55,90,0.30)',
            ...(engineUnavailable ? { opacity: 0.5, cursor: 'default' } : {}),
          }}
          onClick={togglePlay}
          disabled={engineUnavailable}
        >
          {playing ? '\■ Stop' : '\▶ Auto-play'}
        </button>

        <span style={styles.speedLabel}>
          Speed:
          <select
            style={styles.speedSelect}
            value={speed}
            onChange={handleSpeedChange}
          >
            <option value={2}>slow</option>
            <option value={1}>normal</option>
            <option value={0.4}>fast</option>
          </select>
        </span>

        <button
          style={{
            ...styles.btn,
            background: 'transparent',
            color: '#A0A09A',
            border: '0.5px solid rgba(0,0,0,0.12)',
            marginLeft: 'auto',
          }}
          onClick={handleReset}
        >
          {'\↺'} Reset
        </button>
      </div>
    </GraphCard>
  );
}
