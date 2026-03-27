// src/data/v5_reference.js — source de verite pour tous les graphes
// NE JAMAIS MODIFIER MANUELLEMENT
// Valeurs issues des simulations Monte Carlo validees (M=200, beta_conform=0.30)

export const CENTRAL_CASE = {
  baseline: { EL: 801.7, p99: 1097, p99theta: 1097, output: 1198 },
  G0:       { EL: 498.9, p99: 1708, p99theta: 2135, output: 1876 },
  G1:       { EL: 556.8, p99: 1594, p99theta: 1913, output: 1732 },
  G2:       { EL: 618.0, p99: 1383, p99theta: 1521, output: 1520 },
};

export const PARADOX = {
  deltaEL:       -37.8,  // % — E[L] baisse
  deltaP99:      +55.7,  // % — P99 brut monte
  deltaP99theta: +94.6,  // % — P99*theta monte
};

export const PROFILES = {
  P1: { name: 'Big Four',        city: 'Frankfurt',  color: '#D85A30', alpha: 0.70, beta: 3.5, epi: 0.50, p99G0: 2124, p99G2: 1456, p99G1: 1858, EL: 572.9, scaffold: -0.03, counterproductive: true  },
  P2: { name: 'Inv. bank',       city: 'London',     color: '#378ADD', alpha: 0.40, beta: 1.5, epi: 0.55, p99G0: 1668, p99G2: 1035, p99G1: 1331, EL: 507.4, scaffold: +1.46, counterproductive: false },
  P3: { name: 'Strategy',        city: 'Paris',      color: '#B5403F', alpha: 0.90, beta: 4.0, epi: 0.55, p99G0: 2041, p99G2: 1303, p99G1: 1649, EL: 480.8, scaffold: +0.77, counterproductive: false },
  P4: { name: 'Corp. legal',     city: 'Brussels',   color: '#534AB7', alpha: 0.90, beta: 3.0, epi: 0.45, p99G0: 2254, p99G2: 1610, p99G1: 2009, EL: 597.2, scaffold: -0.08, counterproductive: true  },
  P5: { name: 'Tech startup',    city: 'S.F.',       color: '#639922', alpha: 0.60, beta: 2.5, epi: 0.70, p99G0: 2154, p99G2: 1668, p99G1: 1988, EL: 467.7, scaffold: -0.36, counterproductive: true  },
  P6: { name: 'Creative agency', city: 'Singapore',  color: '#1D9E75', alpha: 0.30, beta: 1.5, epi: 0.85, p99G0: 1845, p99G2: 1340, p99G1: 1661, EL: 440.3, scaffold: +0.40, counterproductive: false },
  P7: { name: 'Back-office',     city: 'Bangalore',  color: '#BA7517', alpha: 0.70, beta: 2.0, epi: 0.75, p99G0: 2310, p99G2: 1810, p99G1: 2165, EL: 509.8, scaffold: -0.26, counterproductive: true  },
  P8: { name: 'Central admin',   city: 'Seoul',      color: '#888780', alpha: 0.95, beta: 4.5, epi: 0.60, p99G0: 2318, p99G2: 1701, p99G1: 2084, EL: 479.8, scaffold: -0.06, counterproductive: true  },
};

// Valeurs interdites (versions v4 obsoletes)
// X P99 = 1115  -> OK 1097
// X P6 p99G0 = 1380 -> OK 1845
// X scaffold P6 = +671% -> OK +40%
// X scaffold P2 = +107% -> OK +146%
// X P99_OWN (D2-BIS) = 1500 -> OK 2135
// X Paris-London delta = -35% -> OK +22%
