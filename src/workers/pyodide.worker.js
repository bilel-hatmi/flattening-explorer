// Web Worker for Pyodide — loads Python simulation engine
// Never run Pyodide on the main thread

let pyodide = null;

async function init() {
  importScripts('https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js');
  pyodide = await loadPyodide();
  await pyodide.loadPackage(['numpy', 'pandas']);
  const src = await fetch('/flattening_pyodide.py').then((r) => r.text());
  await pyodide.runPythonAsync(src);
  postMessage({ type: 'ready' });
}

init().catch((err) => {
  postMessage({ type: 'error', id: null, message: `Init failed: ${err.message}` });
});

self.onmessage = async (e) => {
  const { type, id, profile_id, scenario, seed, M } = e.data;

  if (!pyodide) {
    postMessage({ type: 'error', id, message: 'Pyodide not ready' });
    return;
  }

  try {
    let result;

    if (type === 'simulate_one_quarter') {
      result = await pyodide.runPythonAsync(`
import json
r = simulate_one_quarter(${profile_id}, '${scenario}', ${seed || 42})
json.dumps(r)
`);
      postMessage({ type: 'result', id, data: JSON.parse(result) });

    } else if (type === 'simulate_quarter_grid') {
      result = await pyodide.runPythonAsync(`
import json
r = simulate_quarter_grid(${profile_id}, '${scenario}', ${seed || 42})
r['error_matrix'] = r['error_matrix'].tolist() if hasattr(r['error_matrix'], 'tolist') else r['error_matrix']
json.dumps(r)
`);
      postMessage({ type: 'result', id, data: JSON.parse(result) });

    } else if (type === 'run_scenario') {
      result = await pyodide.runPythonAsync(`
import json
r = run_scenario(${profile_id}, '${scenario}', M=${M || 50}${seed != null ? `, seed=${seed}` : ''})
json.dumps(r)
`);
      postMessage({ type: 'result', id, data: JSON.parse(result) });

    } else if (type === 'run_custom_scenario') {
      const { alpha, beta_a, epi, eta, h_lo, h_hi } = e.data;
      result = await pyodide.runPythonAsync(`
import json
r = run_custom_scenario(${alpha}, ${beta_a}, ${epi}, ${eta}, ${h_lo}, ${h_hi}, '${scenario}', M=${M || 50}${seed != null ? `, seed=${seed}` : ''})
json.dumps(r)
`);
      postMessage({ type: 'result', id, data: JSON.parse(result) });

    } else {
      postMessage({ type: 'error', id, message: `Unknown type: ${type}` });
    }
  } catch (err) {
    postMessage({ type: 'error', id, message: err.message });
  }
};
