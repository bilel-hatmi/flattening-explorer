// src/data/d1_simulation.js

import { FIRMS } from './d1_firms';

const Q_IN  = 0.92;
const Q_OUT = 0.55;
const P0    = 0.80;
const H_MEAN = 0.65;
const N_AGENTS = 20;
const K_DECISIONS = 10;
const BASELINE_MEAN = 8.0;
const PI_CENTRAL = 0.70;
const CRISIS_THRESHOLD = 150;

export const REGIMES = {
  normal: { pi_global: 0.75, xi_mu: 0.0,  xi_sd: 0.25, label: 'Normal quarter (\u03c0\u22480.75)'  },
  stress: { pi_global: 0.45, xi_mu: 0.8,  xi_sd: 0.25, label: 'Stress quarter (\u03c0\u22480.45)'  },
  crisis: { pi_global: 0.30, xi_mu: 2.2,  xi_sd: 0.30, label: 'Crisis quarter (\u03c0\u22480.30)'  },
};

const SEEDS = { normal: 42, stress: 99, crisis: 137 };

function seededRNG(seed) {
  let s = seed;
  return {
    next() {
      s |= 0; s = (s + 0x6D2B79F5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    normal(mu = 0, sd = 1) {
      const u = this.next(), v = this.next();
      return mu + sd * Math.sqrt(-2 * Math.log(Math.max(1e-10, u))) * Math.cos(2 * Math.PI * v);
    },
    bernoulli(p) { return this.next() < p ? 1 : 0; },
  };
}

function normalInverse(p) {
  const a = [2.515517, 0.802853, 0.010328];
  const b = [1.432788, 0.189269, 0.001308];
  const t = Math.sqrt(-2 * Math.log(Math.max(1e-10, p < 0.5 ? p : 1 - p)));
  const num = a[0] + a[1] * t + a[2] * t * t;
  const den = 1 + b[0] * t + b[1] * t * t + b[2] * t * t * t;
  return (p < 0.5 ? -1 : 1) * (t - num / den);
}

export function simulateQuarter(regime) {
  const { pi_global, xi_mu, xi_sd } = REGIMES[regime];
  const rng = seededRNG(SEEDS[regime]);

  const xi = {
    A: rng.normal(xi_mu, xi_sd),
    B: rng.normal(xi_mu, xi_sd),
    C: rng.normal(xi_mu, xi_sd),
  };

  return FIRMS.map(firm => {
    let totalErrors = 0;

    for (let k = 0; k < K_DECISIONS; k++) {
      const pi_eff = Math.max(0.05, Math.min(0.95,
        firm.epi * (pi_global / PI_CENTRAL)
      ));
      const isInside = rng.bernoulli(pi_eff);
      const q_k = isInside ? Q_IN : Q_OUT;
      const threshold = normalInverse(q_k);

      const eps_k = rng.normal(0, 1);
      const Z_AI = Math.sqrt(firm.alpha) * xi[firm.provider]
                 + Math.sqrt(1 - firm.alpha) * eps_k;
      const aiError = Z_AI > threshold ? 1 : 0;

      for (let i = 0; i < N_AGENTS; i++) {
        if (rng.bernoulli(P0)) {
          totalErrors += aiError;
        } else {
          totalErrors += rng.bernoulli(1 - H_MEAN);
        }
      }
    }

    const meanLoss = totalErrors / N_AGENTS;
    const lossIndex = Math.round(meanLoss / BASELINE_MEAN * 100);

    return {
      ...firm,
      lossIndex,
      inCrisis: lossIndex > CRISIS_THRESHOLD,
      xi_t: xi[firm.provider].toFixed(2),
      pi_eff_avg: (firm.epi * (pi_global / PI_CENTRAL)).toFixed(2),
    };
  });
}

export { CRISIS_THRESHOLD };
