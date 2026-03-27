import { useState, useEffect, useRef, useCallback } from 'react';

let sharedWorker = null;
let sharedReady = false;
const pendingCallbacks = new Map();
let nextId = 1;

function getWorker() {
  if (!sharedWorker) {
    sharedWorker = new Worker(
      new URL('../workers/pyodide.worker.js', import.meta.url)
    );
    sharedWorker.onmessage = (e) => {
      const { type, id, data, message } = e.data;
      if (type === 'ready') {
        sharedReady = true;
        return;
      }
      if (type === 'error' && id == null) {
        return;
      }
      const cb = pendingCallbacks.get(id);
      if (!cb) return;
      pendingCallbacks.delete(id);
      if (type === 'error') {
        cb.reject(new Error(message));
      } else {
        cb.resolve(data);
      }
    };
    sharedWorker.onerror = () => {};
  }
  return sharedWorker;
}

function callWorker(type, params) {
  return new Promise((resolve, reject) => {
    const id = nextId++;
    pendingCallbacks.set(id, { resolve, reject });
    getWorker().postMessage({ type, id, ...params });
  });
}

export function usePyodide() {
  const [ready, setReady] = useState(sharedReady);

  useEffect(() => {
    const worker = getWorker();
    if (sharedReady) {
      setReady(true);
      return;
    }

    const handler = (e) => {
      if (e.data.type === 'ready') {
        sharedReady = true;
        setReady(true);
      }
    };
    worker.addEventListener('message', handler);
    return () => worker.removeEventListener('message', handler);
  }, []);

  const simulate_one_quarter = useCallback(
    (profile_id, scenario, seed) =>
      callWorker('simulate_one_quarter', { profile_id, scenario, seed }),
    []
  );

  const simulate_quarter_grid = useCallback(
    (profile_id, scenario, seed) =>
      callWorker('simulate_quarter_grid', { profile_id, scenario, seed }),
    []
  );

  const run_scenario = useCallback(
    (profile_id, scenario, M = 50, seed) =>
      callWorker('run_scenario', { profile_id, scenario, M, seed }),
    []
  );

  const run_custom_scenario = useCallback(
    (alpha, beta_a, epi, eta, h_lo, h_hi, scenario, M = 50, seed) =>
      callWorker('run_custom_scenario', { alpha, beta_a, epi, eta, h_lo, h_hi, scenario, M, seed }),
    []
  );

  return { ready, simulate_one_quarter, simulate_quarter_grid, run_scenario, run_custom_scenario };
}
