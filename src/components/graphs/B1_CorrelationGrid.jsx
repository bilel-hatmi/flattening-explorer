import React, { useState, useRef, useEffect, useCallback } from 'react';
import GraphCard from '../ui/GraphCard';
import { useProfile } from '../../context/ProfileContext';
import { PROFILES } from '../../data/v5_reference';
import { usePyodide } from '../../hooks/usePyodide';

/* -- CONSTANTS ------------------------------------------------------------ */

const N_AGENTS = 28;
const N_DECISIONS = 10;
const CELL_GAP = 1.5;

const C_OK = '#4A7C59';
const C_ERR = '#B5403F';
const C_EMPTY = '#F0EFE9';
const CELL_OPACITY = 0.88;

const N_HOT = 7; // columns outside AI training data in a crisis quarter

/* -- PRNG ----------------------------------------------------------------- */

function makePRNG(seed) {
  let s = seed >>> 0;
  return () => {
    s = Math.imul(1664525, s) + 1013904223 >>> 0;
    return s / 0xffffffff;
  };
}

// Pick N_HOT random columns to be "hot" (AI fails), rest are "inside"
function pickHotCols(seed) {
  const rng = makePRNG(seed ^ 0xdeadbeef);
  const cols = Array.from({ length: N_DECISIONS }, (_, i) => i);
  for (let i = 0; i < N_HOT; i++) {
    const j = i + Math.floor(rng() * (N_DECISIONS - i));
    const tmp = cols[i]; cols[i] = cols[j]; cols[j] = tmp;
  }
  return new Set(cols.slice(0, N_HOT));
}

// Good quarter: ~25% random errors, no column structure → speckled pattern
function generateLeftGrid(seed) {
  const rng = makePRNG(seed);
  return Array.from({ length: N_AGENTS }, () =>
    Array.from({ length: N_DECISIONS }, () => (rng() < 0.25 ? 1 : 0))
  );
}

// Crisis quarter: hot cols ~85% error, inside cols ~10% error → clear red column stripes
function generateRightGrid(seed, hotCols) {
  const rng = makePRNG(seed + 1);
  return Array.from({ length: N_AGENTS }, () =>
    Array.from({ length: N_DECISIONS }, (_, d) =>
      hotCols.has(d) ? (rng() < 0.85 ? 1 : 0) : (rng() < 0.10 ? 1 : 0)
    )
  );
}

// π = fraction of columns where AI performs well (error rate < 50%)
function computePi(grid) {
  if (!grid || grid.length === 0) return null;
  const nAgents = grid.length;
  let goodCols = 0;
  for (let d = 0; d < N_DECISIONS; d++) {
    let colSum = 0;
    for (let a = 0; a < nAgents; a++) colSum += grid[a][d];
    if (colSum / nAgents < 0.50) goodCols++;
  }
  return goodCols / N_DECISIONS;
}

/* -- Grid analytics ------------------------------------------------------- */

function countErrors(grid) {
  if (!grid) return 0;
  let total = 0;
  for (let a = 0; a < grid.length; a++) {
    for (let d = 0; d < grid[a].length; d++) {
      total += grid[a][d];
    }
  }
  return total;
}

function countSystemic(grid, threshold) {
  if (!grid) return 0;
  const t = threshold || Math.floor(grid.length * 0.75);
  let count = 0;
  for (let d = 0; d < N_DECISIONS; d++) {
    let colSum = 0;
    for (let a = 0; a < grid.length; a++) {
      colSum += grid[a][d];
    }
    if (colSum > t) count++;
  }
  return count;
}

function computeCorrelation(grid) {
  if (!grid || grid.length === 0) return 0;
  const nAgents = grid.length;
  const colSums = [];
  for (let d = 0; d < N_DECISIONS; d++) {
    let s = 0;
    for (let a = 0; a < nAgents; a++) s += grid[a][d];
    colSums.push(s);
  }
  const meanCol = colSums.reduce((a, b) => a + b, 0) / N_DECISIONS;
  const variance = colSums.reduce((a, b) => a + (b - meanCol) ** 2, 0) / N_DECISIONS;
  const maxVar = (nAgents * 0.5) ** 2;
  return maxVar > 0 ? variance / maxVar : 0;
}

/* -- Canvas drawing ------------------------------------------------------- */

function setupCanvasDims(canvas) {
  if (!canvas || !canvas.parentElement) return null;
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.parentElement.getBoundingClientRect().width;
  if (W <= 0) return null;

  const cellW = (W - N_DECISIONS * CELL_GAP) / N_DECISIONS;
  const cellH = Math.max(2, Math.min(4, cellW * 0.15));
  const H = N_AGENTS * (cellH + CELL_GAP);

  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';

  return { dpr, W, H, cellW, cellH };
}

function drawGrid(canvas, grid, dims, revealedCols) {
  if (!canvas || !dims || !grid) return;
  const { dpr, W, H, cellW, cellH } = dims;
  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const nAgents = grid.length;
  for (let d = 0; d < N_DECISIONS; d++) {
    const x = d * (cellW + CELL_GAP);
    for (let a = 0; a < nAgents; a++) {
      const y = a * (cellH + CELL_GAP);
      if (d >= revealedCols) {
        ctx.globalAlpha = 1;
        ctx.fillStyle = C_EMPTY;
      } else {
        ctx.globalAlpha = CELL_OPACITY;
        ctx.fillStyle = grid[a][d] === 1 ? C_ERR : C_OK;
      }
      ctx.beginPath();
      ctx.roundRect(x, y, cellW, cellH, 1);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

/* -- STYLES --------------------------------------------------------------- */

const styles = {
  controls: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  replayBtn: {
    padding: '6px 14px',
    borderRadius: 6,
    border: '0.5px solid rgba(0,0,0,0.12)',
    background: 'transparent',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 11,
    fontWeight: 500,
    color: '#A0A09A',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  liveBtn: {
    padding: '6px 14px',
    borderRadius: 6,
    border: '0.5px solid rgba(97,158,168,0.40)',
    background: 'rgba(97,158,168,0.08)',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 11,
    fontWeight: 500,
    color: '#619EA8',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginLeft: 'auto',
  },
  liveBtnDisabled: {
    opacity: 0.5,
    cursor: 'default',
  },
  gridsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 20,
    marginBottom: 16,
  },
  gridPanel: {
    display: 'flex',
    flexDirection: 'column',
  },
  gridHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
  gridLabel: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 11,
    fontWeight: 600,
    color: '#22375A',
    lineHeight: 1.3,
  },
  gridSublabel: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 9,
    color: '#A0A09A',
    marginTop: 2,
  },
  canvas: {
    width: '100%',
    display: 'block',
    borderRadius: 4,
  },
  decisionAxis: {
    display: 'flex',
    marginTop: 4,
  },
  decisionLabel: {
    flex: 1,
    textAlign: 'center',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 8,
    color: '#A0A09A',
  },
  decisionLabelHot: {
    color: '#B5403F',
    fontWeight: 600,
  },
  gridCounters: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    marginTop: 8,
  },
  counterLine: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  counterDesc: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 9,
    color: '#A0A09A',
    lineHeight: 1.4,
  },
  counterVal: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    marginLeft: 12,
  },
  mechanismNote: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 9.5,
    color: '#73726C',
    lineHeight: 1.5,
    fontStyle: 'italic',
    marginTop: 10,
    padding: '8px 10px',
    borderRadius: '0 4px 4px 0',
  },
  mechanismNoteGood: {
    background: 'rgba(74,124,89,0.05)',
    borderLeft: '2px solid rgba(74,124,89,0.30)',
  },
  mechanismNoteBad: {
    background: 'rgba(181,64,63,0.05)',
    borderLeft: '2px solid rgba(181,64,63,0.30)',
  },
  insightRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 20,
    marginBottom: 14,
  },
  insightGood: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    padding: '9px 12px',
    borderRadius: 7,
    fontSize: 10,
    lineHeight: 1.5,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    background: 'rgba(74,124,89,0.07)',
    color: '#3a6347',
    border: '0.5px solid rgba(74,124,89,0.20)',
  },
  insightBad: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    padding: '9px 12px',
    borderRadius: 7,
    fontSize: 10,
    lineHeight: 1.5,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    background: 'rgba(181,64,63,0.07)',
    color: '#8a2e2e',
    border: '0.5px solid rgba(181,64,63,0.20)',
  },
  insightIcon: {
    fontSize: 13,
    flexShrink: 0,
    marginTop: 1,
  },
  legendStrip: {
    display: 'flex',
    gap: 16,
    alignItems: 'center',
    borderTop: '0.5px solid rgba(0,0,0,0.06)',
    paddingTop: 12,
  },
  legItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 10,
    color: '#73726C',
  },
  legSwatch: {
    width: 10,
    height: 10,
    borderRadius: 2,
    display: 'inline-block',
  },
  legendNote: {
    marginLeft: 'auto',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 9,
    color: '#A0A09A',
    fontStyle: 'italic',
  },
};

/* -- COMPONENT ------------------------------------------------------------ */

export default function B1_CorrelationGrid() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentSeed, setCurrentSeed] = useState(42);
  const [engineSource, setEngineSource] = useState('local'); // 'local' | 'pyodide'

  const canvasLeftRef = useRef(null);
  const canvasRightRef = useRef(null);
  const dimsLeftRef = useRef(null);
  const dimsRightRef = useRef(null);
  const animTimerRef = useRef(null);
  const gridsRef = useRef({ good: null, bad: null });
  const hotColsRef = useRef(new Set([1, 2, 4, 5, 6, 7, 9]));

  // Profile (for subtitle only)
  const { profileId } = useProfile();
  const profile = profileId ? PROFILES[profileId] : null;
  const { ready: pyodideReady, simulate_quarter_grid } = usePyodide();

  // Generate PRNG grids — immediate, no async needed (fallback)
  const generateGrids = useCallback((seed) => {
    const hotCols = pickHotCols(seed);
    hotColsRef.current = hotCols;
    gridsRef.current.good = generateLeftGrid(seed);
    gridsRef.current.bad = generateRightGrid(seed, hotCols);
    setEngineSource('local');
  }, []);

  // Generate grids via Pyodide — subsample 200→40 agents
  const generateGridsPyodide = useCallback(async (seed) => {
    const pid = profileId ? parseInt(profileId.replace('P', ''), 10) : 3;
    // Normal quarter: try seeds until is_crisis=false (max 20 attempts)
    let goodResult = null;
    for (let i = 0; i < 20; i++) {
      const r = await simulate_quarter_grid(pid, 'G0', seed + i * 100);
      if (!r.is_crisis) { goodResult = r; break; }
    }
    // Crisis quarter: try seeds until is_crisis=true (max 40 attempts since p_crisis=8%)
    let badResult = null;
    for (let i = 0; i < 40; i++) {
      const r = await simulate_quarter_grid(pid, 'G0', seed + 5000 + i * 100);
      if (r.is_crisis) { badResult = r; break; }
    }
    if (!goodResult || !badResult) return false;

    // Subsample 200 → 40 agents (every 5th row)
    const sub = (matrix) => {
      const step = Math.max(1, Math.floor(matrix.length / N_AGENTS));
      const rows = [];
      for (let i = 0; i < matrix.length && rows.length < N_AGENTS; i += step) {
        rows.push(matrix[i]);
      }
      return rows;
    };
    gridsRef.current.good = sub(goodResult.error_matrix);
    gridsRef.current.bad = sub(badResult.error_matrix);

    // Detect hot columns from crisis grid
    const badGrid = gridsRef.current.bad;
    const hot = new Set();
    for (let d = 0; d < N_DECISIONS; d++) {
      let colSum = 0;
      for (let a = 0; a < badGrid.length; a++) colSum += badGrid[a][d];
      if (colSum / badGrid.length > 0.50) hot.add(d);
    }
    hotColsRef.current = hot;
    setEngineSource('pyodide');
    return true;
  }, [profileId, simulate_quarter_grid]);

  // On mount: generate immediately with PRNG
  useEffect(() => {
    generateGrids(42);
  }, [generateGrids]);

  // Draw function — both panels always drawn simultaneously
  const drawAll = useCallback((revealedCols = N_DECISIONS) => {
    const { good, bad } = gridsRef.current;
    if (!good || !bad) return;

    if (canvasLeftRef.current) {
      dimsLeftRef.current = setupCanvasDims(canvasLeftRef.current);
      drawGrid(canvasLeftRef.current, good, dimsLeftRef.current, revealedCols);
    }
    if (canvasRightRef.current) {
      dimsRightRef.current = setupCanvasDims(canvasRightRef.current);
      drawGrid(canvasRightRef.current, bad, dimsRightRef.current, revealedCols);
    }
  }, []);

  // Redraw whenever grids or meta change
  useEffect(() => {
    drawAll();
  }, [currentSeed, drawAll]);

  // Resize handler
  useEffect(() => {
    const onResize = () => drawAll();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [drawAll]);

  // Single button: generate new random instance then animate column by column
  const handleReplay = useCallback(async () => {
    if (isAnimating) return;

    const seed = Math.floor(Math.random() * 10000);

    // Use Pyodide if available, else local PRNG
    if (pyodideReady) {
      setIsAnimating(true);
      drawAll(0);
      try {
        const ok = await generateGridsPyodide(seed);
        if (!ok) generateGrids(seed); // fallback if Pyodide didn't find both quarter types
      } catch {
        generateGrids(seed);
      }
    } else {
      generateGrids(seed);
    }
    setCurrentSeed(seed);

    // Animate column by column
    if (animTimerRef.current) clearInterval(animTimerRef.current);
    setIsAnimating(true);
    let col = 0;
    drawAll(0);

    animTimerRef.current = setInterval(() => {
      col++;
      drawAll(col);
      if (col >= N_DECISIONS) {
        clearInterval(animTimerRef.current);
        animTimerRef.current = null;
        setIsAnimating(false);
      }
    }, 220);
  }, [isAnimating, drawAll, generateGrids, generateGridsPyodide, pyodideReady]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animTimerRef.current) clearInterval(animTimerRef.current);
    };
  }, []);

  // Derived data for counters
  const goodGrid = gridsRef.current.good;
  const badGrid = gridsRef.current.bad;
  const nAgents = goodGrid ? goodGrid.length : N_AGENTS;
  const systThreshold = Math.floor(nAgents * 0.75);
  const totalCells = nAgents * N_DECISIONS;

  const hotCols = hotColsRef.current;
  const nHot = hotCols.size;
  const nInside = N_DECISIONS - nHot;

  const goodTotal = countErrors(goodGrid);
  const badTotal = countErrors(badGrid);
  const goodSys = countSystemic(goodGrid, systThreshold);
  const badSys = countSystemic(badGrid, systThreshold);
  const cExcessGood = computeCorrelation(goodGrid);
  const cExcessBad = computeCorrelation(badGrid);

  const piGood = computePi(goodGrid);
  const piBad  = computePi(badGrid);
  const piGoodStr = piGood !== null ? '\u03c0 = ' + piGood.toFixed(2) : '';
  const piBadStr  = piBad  !== null ? '\u03c0 = ' + piBad.toFixed(2)  : '';

  const goodErrorPct = totalCells > 0 ? Math.round((goodTotal / totalCells) * 100) : 0;
  const badErrorPct  = totalCells > 0 ? Math.round((badTotal  / totalCells) * 100) : 0;

  const goodSublabel = piGoodStr + ' \u2014 AI in-distribution for all decision types, ' + goodErrorPct + '% error rate';
  const badSublabel  = piBadStr + ' \u2014 ' + nHot + ' out of 10 decision types outside AI training data';
  const goodNote = 'In a normal quarter, AI covers all decision types. Errors occur at ~' + goodErrorPct + '% but remain independent \u2014 each agent fails on different decisions. No column clustering (' + (goodSys === 0 ? 'zero' : goodSys) + ' systemic column' + (goodSys !== 1 ? 's' : '') + ').';
  const badNote  = 'In a crisis quarter, ' + nHot + " out of 10 decision types fall outside the AI\u2019s training data. Every agent using the same model fails on the same decisions \u2014 " + badSys + ' column' + (badSys !== 1 ? 's' : '') + ' show systemic failure (>' + systThreshold + ' agents simultaneously).';

  return (
    <GraphCard
      id="B1"
      title="Same number of errors — radically different risk"
      subtitle={
        `${nAgents} agents \u00d7 10 decision types${profile ? ` \u2014 ${profile.name} (${profile.city})` : ''}. Both grids have roughly the same total error rate. ` +
        'The difference is structure, not quantity. When errors scatter randomly, the organisation absorbs them. ' +
        'When they cluster by column, every agent fails on the same decisions simultaneously \u2014 and the tail explodes.'
      }
    >
      {/* Single replay button */}
      <div style={styles.controls}>
        <button
          style={{
            ...styles.replayBtn,
            ...(isAnimating ? { opacity: 0.5, cursor: 'default' } : {}),
          }}
          onClick={handleReplay}
          disabled={isAnimating}
        >
          {isAnimating ? '\u23f3 Simulating...' : '\u21bb Replay \u2014 new random instance'}
        </button>
        <span style={{
          fontSize: 9, fontFamily: "'JetBrains Mono', monospace",
          color: engineSource === 'pyodide' ? '#4A7C59' : '#A0A09A',
          marginLeft: 8,
        }}>
          {engineSource === 'pyodide' ? '\u2713 Live engine' : pyodideReady ? 'Engine ready' : 'Local simulation'}
        </span>
      </div>

      {/* Two-panel grid layout — both always visible */}
      <div style={styles.gridsRow}>
        {/* LEFT PANEL — Normal quarter */}
        <div style={styles.gridPanel}>
          <div style={styles.gridHeader}>
            <div>
              <div style={styles.gridLabel}>Normal quarter {'\—'} errors scattered</div>
              <div style={styles.gridSublabel}>{goodSublabel}</div>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <canvas ref={canvasLeftRef} style={styles.canvas} />
          </div>
          {/* Left decision axis — no hot columns */}
          <div style={styles.decisionAxis}>
            {Array.from({ length: N_DECISIONS }, (_, d) => (
              <div key={d} style={styles.decisionLabel}>
                d{d + 1}
              </div>
            ))}
          </div>
          {/* Left counters */}
          <div style={styles.gridCounters}>
            <div style={styles.counterLine}>
              <span style={styles.counterDesc}>Total errors</span>
              <span style={{ ...styles.counterVal, color: '#22375A' }}>
                {goodTotal} / {totalCells}  ({Math.round((goodTotal / totalCells) * 100)}%)
              </span>
            </div>
            <div style={styles.counterLine}>
              <span style={styles.counterDesc}>
                Systemic failures (&gt;{systThreshold} agents on same decision)
              </span>
              <span style={{ ...styles.counterVal, color: '#4A7C59' }}>
                {goodSys === 0
                  ? '0 \— no systemic failure'
                  : `${goodSys} \— systemic risk`}
              </span>
            </div>
            <div style={styles.counterLine}>
              <span style={styles.counterDesc}>Correlation index (c_excess)</span>
              <span style={{ ...styles.counterVal, color: '#22375A' }}>
                {cExcessGood.toFixed(3)}
              </span>
            </div>
          </div>
          {/* Left mechanism note */}
          <div style={{ ...styles.mechanismNote, ...styles.mechanismNoteGood }}>{goodNote}</div>
        </div>

        {/* RIGHT PANEL — Crisis quarter */}
        <div style={styles.gridPanel}>
          <div style={styles.gridHeader}>
            <div>
              <div style={styles.gridLabel}>Crisis quarter {'\—'} errors correlated</div>
              <div style={styles.gridSublabel}>{badSublabel}</div>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <canvas ref={canvasRightRef} style={styles.canvas} />
          </div>
          {/* Right decision axis — hot columns highlighted */}
          <div style={styles.decisionAxis}>
            {Array.from({ length: N_DECISIONS }, (_, d) => {
              const isHot = hotCols.has(d);
              return (
                <div
                  key={d}
                  style={{
                    ...styles.decisionLabel,
                    ...(isHot ? styles.decisionLabelHot : {}),
                  }}
                >
                  d{d + 1}
                </div>
              );
            })}
          </div>
          {/* Right counters */}
          <div style={styles.gridCounters}>
            <div style={styles.counterLine}>
              <span style={styles.counterDesc}>Total errors</span>
              <span style={{ ...styles.counterVal, color: '#22375A' }}>
                {badTotal} / {totalCells}  ({Math.round((badTotal / totalCells) * 100)}%)
              </span>
            </div>
            <div style={styles.counterLine}>
              <span style={styles.counterDesc}>
                Systemic failures (&gt;{systThreshold} agents on same decision)
              </span>
              <span
                style={{
                  ...styles.counterVal,
                  color: badSys > 0 ? '#B5403F' : '#4A7C59',
                }}
              >
                {badSys === 0
                  ? '0 \— no systemic failure'
                  : `${badSys} \— systemic risk`}
              </span>
            </div>
            <div style={styles.counterLine}>
              <span style={styles.counterDesc}>Correlation index (c_excess)</span>
              <span
                style={{
                  ...styles.counterVal,
                  color: cExcessBad > 0.1 ? '#B5403F' : '#22375A',
                }}
              >
                {cExcessBad.toFixed(3)}
              </span>
            </div>
          </div>
          {/* Right mechanism note */}
          <div style={{ ...styles.mechanismNote, ...styles.mechanismNoteBad }}>{badNote}</div>
        </div>
      </div>

      {/* Insight pills */}
      <div style={styles.insightRow}>
        <div style={styles.insightGood}>
          <span style={styles.insightIcon}>{'\◎'}</span>
          <span>
            Errors are <strong>independent</strong> {'\—'} agents fail on different decisions.
            Each error is offset by another agent{'\’'}s correct answer.
            Collective judgment stays robust.
          </span>
        </div>
        <div style={styles.insightBad}>
          <span style={styles.insightIcon}>{'\▓'}</span>
          <span>
            Errors are <strong>correlated by column</strong> {'\—'} the same decision types fail
            across nearly all {nAgents} agents. Nothing cancels out.
            This is what drives the tail risk in the model.
          </span>
        </div>
      </div>

      {/* Legend */}
      <div style={styles.legendStrip}>
        <div style={styles.legItem}>
          <span style={{ ...styles.legSwatch, background: C_OK }} />
          Correct decision
        </div>
        <div style={styles.legItem}>
          <span style={{ ...styles.legSwatch, background: C_ERR }} />
          Error
        </div>
        <span style={styles.legendNote}>
          Columns = decision types (d1{'\–'}d10) {'\·'} Rows = agents (1{'\–'}{nAgents})
        </span>
      </div>
    </GraphCard>
  );
}
