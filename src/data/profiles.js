// src/data/profiles.js — profile constants derived from v5_reference.js
import { PROFILES } from './v5_reference';

export const PROFILE_IDS = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8'];

export const PROFILE_LIST = PROFILE_IDS.map((id) => ({
  id,
  ...PROFILES[id],
}));

export const SCENARIO_LABELS = {
  baseline: 'Baseline (no AI)',
  G0: 'G0 — Unmanaged adoption',
  G1: 'G1 — Passive guardrails',
  G2: 'G2 — Active governance',
};

export const SCENARIO_COLORS = {
  baseline: '#888780',
  G0: '#B5403F',
  G1: '#C49A3C',
  G2: '#4A7C59',
};

export function getProfile(id) {
  return PROFILES[id] || null;
}

export function getProfileLabel(id) {
  const p = PROFILES[id];
  if (!p) return id;
  return `${p.name} (${p.city})`;
}
