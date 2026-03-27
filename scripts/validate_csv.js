import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(import.meta.dirname, '..', 'public', 'data');

// Required columns per file (superset of actual columns is OK)
const EXPECTED = {
  'histograms_by_profile_b030.csv':   ['profile_id', 'scenario', 'bin_lo', 'bin_hi', 'count'],
  'trajectories_by_profile_b030.csv': ['profile_id', 'scenario', 't', 'mean_loss', 'p99_brut', 'p99_theta', 'var_tau', 'h_bar', 'follow_rate', 'c_excess'],
  'heatmap_alpha_pi_b030.csv':        ['alpha', 'epi_mean', 'scenario', 'p99_brut', 'p99_theta'],
  'sweep_dimensions.csv':             ['dimension', 'param_lo', 'param_hi', 'p99_at_lo', 'p99_at_hi', 'central_p99'],
  'scatter_profiles_b030.csv':        ['profile_id', 'scenario', 'p99_theta', 'output_mean', 'scaffold_benefit'],
  'sweep_profiles_v3_b030.csv':       ['profile_id', 'scenario', 'p99_theta', 'output_mean'],
  'ablation_results.csv':             ['profile_id', 'ablation', 'p99_theta'],
  'exhibit_2_frontier.csv':           ['scenario', 'output_mean', 'p99_theta', 'mean_loss'],
  'correlation_grid_P3_good.csv':     ['agent_id', 'decision_id', 'error'],
  'correlation_grid_P3_bad.csv':      ['agent_id', 'decision_id', 'error'],
  'profile_summary_v3_b030.csv':      ['profile_id'],
  'sweep_profiles_dimensions_b030.csv': ['profile_id', 'dimension', 'param_lo', 'param_hi', 'p99_at_lo', 'p99_at_hi', 'central_p99', 'range_pct', 'scenario'],
};

let errors = 0;
let ok = 0;

const files = readdirSync(DATA_DIR).filter((f) => f.endsWith('.csv'));

for (const [filename, requiredCols] of Object.entries(EXPECTED)) {
  const path = join(DATA_DIR, filename);
  try {
    const text = readFileSync(path, 'utf-8');
    const firstLine = text.split('\n')[0];
    // Parse header handling quoted fields
    const headers = firstLine.split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    const missing = requiredCols.filter((c) => !headers.includes(c));
    if (missing.length > 0) {
      console.error(`FAIL  ${filename} — missing columns: ${missing.join(', ')}`);
      errors++;
    } else {
      const rowCount = text.trim().split('\n').length - 1;
      console.log(`  OK  ${filename} — ${rowCount} rows, ${headers.length} columns`);
      ok++;
    }
  } catch (e) {
    console.error(`MISS  ${filename} — file not found`);
    errors++;
  }
}

// Report extra CSVs
const expected = new Set(Object.keys(EXPECTED));
const extras = files.filter((f) => !expected.has(f));
if (extras.length > 0) {
  console.log(`\n  Extra CSVs (not validated): ${extras.join(', ')}`);
}

console.log(`\n${ok} OK, ${errors} FAIL out of ${Object.keys(EXPECTED).length} expected files`);
if (errors > 0) process.exit(1);
