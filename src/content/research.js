// ── Research page: the four lines of current work ────────────────────────────
// Rendered as a grid of cards under "Current work" (Research.jsx). The prose
// around them lives in research.md. Wording follows the LinkedIn About.

import { SITE } from '../routes';

export const RESEARCH_LINES = [
  {
    icon: 'risk',
    title: 'Cognitive homogenisation under AI',
    text: 'The Flattening models what AI adoption does to firms of different sizes and domains, on **cognitive diversity, productivity and losses**. Finalist of the Cambridge–McKinsey Risk Prize 2026, with an interactive explorer.',
    tag: 'Risk Prize 2026 · finalist',
    to: `${SITE.projects}/the-flattening`,
  },
  {
    icon: 'psychometrics',
    title: 'Four structural properties of LLMs',
    text: 'The properties that generate constructs such as sycophancy or malice: epistemic validity, procedural validity, direction, directional entropy. **Read by 2 instruments**, behaviour and the model’s internals, across 5 conditions.',
    tag: 'SRIE · empirical phase',
    to: `${SITE.projects}/srie-sycophancy`,
  },
  {
    icon: 'education',
    title: 'LLMs applied to learning',
    text: 'The tutor rests on **parametric structures derived from knowledge spaces**, with a metacognitive component, and is meant to teach without deskilling.',
    tag: 'SRIE · structural modelling',
    to: `${SITE.projects}/srie-tutor`,
  },
  {
    icon: 'mediation',
    title: 'LLMs applied to the mediation of disputes',
    text: 'A mediator whose **neutrality is a property of the objective function**, under confidentiality constraints: game theory carried over to an agentic workflow.',
    tag: 'SRIE · theoretical phase',
    to: `${SITE.projects}/srie-mediation`,
  },
];
