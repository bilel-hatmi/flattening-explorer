// src/data/d1_firms.js
// E[π] = share of decisions inside AI training frontier
// alpha = stack concentration (share of decisions via single provider)
// provider = which AI provider this firm uses (A=dominant 50%, B=33%, C=17%)

export const FIRMS = [
  // Provider A — 15 firmes, alpha=0.70 (stack concentré)
  { id:1,  name:'Strategy consulting', provider:'A', alpha:0.70, epi:0.55 },
  { id:2,  name:'M&A advisory',        provider:'A', alpha:0.70, epi:0.50 },
  { id:3,  name:'Audit',               provider:'A', alpha:0.70, epi:0.50 },
  { id:4,  name:'Legal',               provider:'A', alpha:0.70, epi:0.45 },
  { id:5,  name:'Insurance',           provider:'A', alpha:0.70, epi:0.50 },
  { id:6,  name:'Asset management',    provider:'A', alpha:0.70, epi:0.65 },
  { id:7,  name:'Corporate banking',   provider:'A', alpha:0.70, epi:0.55 },
  { id:8,  name:'Risk advisory',       provider:'A', alpha:0.70, epi:0.50 },
  { id:9,  name:'Tax advisory',        provider:'A', alpha:0.70, epi:0.45 },
  { id:10, name:'Compliance',          provider:'A', alpha:0.70, epi:0.45 },
  { id:11, name:'Research analytics',  provider:'A', alpha:0.70, epi:0.70 },
  { id:12, name:'Credit rating',       provider:'A', alpha:0.70, epi:0.55 },
  { id:13, name:'Regulatory affairs',  provider:'A', alpha:0.70, epi:0.45 },
  { id:14, name:'HR consulting',       provider:'A', alpha:0.70, epi:0.55 },
  { id:15, name:'IP law',              provider:'A', alpha:0.70, epi:0.45 },

  // Provider B — 10 firmes, alpha=0.50 (stack mixte)
  { id:16, name:'Investment banking',  provider:'B', alpha:0.50, epi:0.55 },
  { id:17, name:'Private equity',      provider:'B', alpha:0.50, epi:0.50 },
  { id:18, name:'Actuarial',           provider:'B', alpha:0.50, epi:0.65 },
  { id:19, name:'Financial planning',  provider:'B', alpha:0.50, epi:0.65 },
  { id:20, name:'Restructuring',       provider:'B', alpha:0.50, epi:0.50 },
  { id:21, name:'Public sector',       provider:'B', alpha:0.50, epi:0.60 },
  { id:22, name:'Healthcare admin',    provider:'B', alpha:0.50, epi:0.60 },
  { id:23, name:'Procurement',         provider:'B', alpha:0.50, epi:0.65 },
  { id:24, name:'Supply chain',        provider:'B', alpha:0.50, epi:0.70 },
  { id:25, name:'Tech ops',            provider:'B', alpha:0.50, epi:0.85 },

  // Provider C — 5 firmes, alpha=0.30 (stack diversifié)
  { id:26, name:'Creative agency',     provider:'C', alpha:0.30, epi:0.85 },
  { id:27, name:'UX research',         provider:'C', alpha:0.30, epi:0.80 },
  { id:28, name:'Content strategy',    provider:'C', alpha:0.30, epi:0.75 },
  { id:29, name:'Digital marketing',   provider:'C', alpha:0.30, epi:0.80 },
  { id:30, name:'Brand strategy',      provider:'C', alpha:0.30, epi:0.75 },
];

export const PROVIDERS = {
  A: { label: 'Provider A \u2014 dominant',   share: '50%, 15 firms', color: '#22375A' },
  B: { label: 'Provider B \u2014 challenger', share: '33%, 10 firms', color: '#4A7C59' },
  C: { label: 'Provider C \u2014 niche',      share: '17%, 5 firms',  color: '#C49A3C' },
};

export const CRISIS_THRESHOLD = 150;
