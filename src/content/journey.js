// ── Journey (timeline + two narratives) ──────────────────────────────────────
// Newest first. `kind` picks the marker colour: education, research, work,
// venture, community. `to` links to a project page, `href` to a document.
// Dates follow the CV (September 2026) and the LinkedIn profile.

import { SITE } from '../routes';

export const JOURNEY = [
  {
    id: 'srie',
    period: 'Jul 2026 – present',
    title: 'Resident researcher and research supervisor',
    org: 'SRIE',
    place: 'Cambridge, UK',
    kind: 'research',
    summary: '8-week AI-safety placements for Cambridge mathematics undergraduates. **7 students on 3 projects I designed**: sycophancy as a set of constructs, mediation under confidentiality constraints, an AI tutor against cognitive surrender.',
    to: `${SITE.projects}/srie-2026`,
  },
  {
    id: 'risk-prize',
    period: 'Mar – Jul 2026',
    title: 'Finalist, Cambridge–McKinsey Risk Prize',
    org: 'Cambridge Centre for Risk Studies, Judge Business School',
    place: 'Cambridge, UK',
    kind: 'research',
    summary: 'The Flattening: essay, Monte Carlo model and interactive explorer on how AI productivity gains conceal tail risk. **One of the 4 finalists.**',
    to: `${SITE.projects}/the-flattening`,
  },
  {
    id: 'part-iii',
    period: '2023 – 2026',
    title: 'MASt in Mathematical Statistics (Part III)',
    org: 'University of Cambridge, DPMMS',
    place: 'Cambridge, UK',
    kind: 'education',
    summary: 'Essay on proximal causal inference under unmeasured confounding, supervised by Dr P. Zhao and Prof. Q. Zhao, submitted May 2026. Degree completed June 2026, **grade 70/100**, after an intermission for health in 2024. Courses in causal inference, robust statistics, modern statistical methods, information theory, advanced probability.',
    to: `${SITE.projects}/part-iii-dissertation`,
  },
  {
    id: 'cartesia',
    period: '2025 – 2026',
    title: 'Founder and lead researcher',
    org: 'CartesIA',
    place: 'Paris and Cambridge',
    kind: 'venture',
    summary: 'Language models as controlled measurement instruments for psychometrics. 3 domains explored: mental health, youth guidance, professional development. Paused since the summer of 2026.',
    to: `${SITE.projects}/cartesia`,
  },
  {
    id: 'eleven',
    period: 'Apr – Sep 2025',
    title: 'Analyst and data scientist',
    org: 'Eleven Strategy',
    place: 'Paris, France',
    kind: 'work',
    summary: '2 buy-side due diligences, a competitive map of bike-sharing in Paris, a series of AI agents for an investment fund and a private bank, **an internal retrieval system that doubled search precision for about 80 users**.',
    to: `${SITE.projects}/eleven-rag`,
  },
  {
    id: 'well-being',
    period: 'Jun – Sep 2023',
    title: 'Research intern, Boussole project',
    org: 'Elements Impact',
    place: 'Paris, France',
    kind: 'research',
    summary: 'Mathematical modelling of subjective well-being: a state of the art in welfare economics, **supervised models on a 20-year longitudinal panel of more than 1,000 people**, corrective mechanisms and a benchmark.',
    to: `${SITE.projects}/well-being-panel`,
  },
  {
    id: 'teaching',
    period: 'Sep 2022 – Jul 2023',
    title: 'Teaching assistant in mathematics',
    org: 'CentraleSupélec',
    place: 'Paris, France',
    kind: 'community',
    summary: '3 courses with 2 permanent professors and 1 assistant professor: probability, integration and convergence (Lebesgue integration, Gaussian vectors, convergence of random variables); partial differential equations (Fourier analysis, finite element and finite difference methods). A mathematics course co-organised for international bachelor students.',
  },
  {
    id: 'cap-prepa',
    period: 'Aug 2022',
    title: 'Mathematics and physics tutor, CAP PREPA',
    org: 'ESSEC Business School, Centre Egalité Diversité Inclusion',
    place: 'Paris, France',
    kind: 'community',
    summary: 'A one-week acclimatisation programme to a highly selective mathematics and physics track, for students from disadvantaged backgrounds. **4 preparatory-class students supervised for the week**: confidence, and the work methods their studies would demand.',
  },
  {
    id: 'badminton',
    period: 'Apr 2022 – Jul 2023',
    title: 'President of the badminton club',
    org: 'Bureau des Sports, CentraleSupélec',
    place: 'Gif-sur-Yvette, France',
    kind: 'community',
    summary: '**A 50-player club recruited from 250 applicants**, led to the **French University Badminton Championships**; registrations with the French University Sports Federation, grant applications for transport and accommodation, equipment and budget.',
  },
  {
    id: 'oser',
    period: 'Nov 2021 – Jul 2023',
    title: 'Tutor, then VP Carnets de France',
    org: 'OSER CentraleSupélec, Cordées de la réussite',
    place: 'Gif-sur-Yvette, France',
    kind: 'community',
    summary: 'Tutoring sessions in secondary schools on general knowledge and orientation, against self-censorship. As VP Carnets de France, **I led a team of 5 to offer 20 pupils from disadvantaged areas a 3-day trip** to a major French city.',
  },
  {
    id: 'mics',
    period: 'Jan 2022 – Jul 2023',
    title: 'Research assistant, mathematical modelling',
    org: 'MICS Lab, CentraleSupélec',
    place: 'Paris, France',
    kind: 'research',
    summary: 'Bayesian and stochastic modelling of blood cancers with the Gustave Roussy Institute; estimation of Hawkes processes; Ho-Lee and HJM term-structure models.',
    to: `${SITE.projects}/blood-cancers`,
  },
  {
    id: 'centralesupelec',
    period: '2021 – 2026',
    title: 'Engineering degree, Mathematics and Data Sciences',
    org: 'CentraleSupélec, Paris-Saclay',
    place: 'Gif-sur-Yvette, France',
    kind: 'education',
    summary: '**Top 1% of a class of 970.** Mathematical Modelling track: advanced probability and statistics, machine learning, game theory, optimisation, philosophy of science. Degree completed 2026.',
  },
  {
    id: 'saint-louis',
    period: '2018 – 2021',
    title: 'Classes préparatoires, MPSI / PSI*',
    org: 'Lycée Saint-Louis',
    place: 'Paris, France',
    kind: 'education',
    summary: '2-year intensive preparation for the national Grandes Écoles entrance exams.',
  },
];

export const JOURNEY_KINDS = {
  education: { label: 'Education', color: 'var(--navy)' },
  research:  { label: 'Research',  color: 'var(--teal)' },
  work:      { label: 'Work',      color: 'var(--warning)' },
  venture:   { label: 'Venture',   color: 'var(--success)' },
  community: { label: 'Giving back and sport', color: '#8E6BBF' },
};

// Two narratives, in Bilel's words, shown above the timeline.
export const NARRATIVES = [
  {
    id: 'giving-back',
    kicker: 'Giving back',
    title: 'La Courneuve, the Cordées de la Réussite, OSER, CAP PREPA',
    image: { src: '/img/journey/carnets.jpg', alt: 'Bilel with the pupils of the Carnets de France trip, sitting on the steps of a columned building', caption: 'Carnets de France: the 3-day trip, with the pupils', ratio: '3 / 2' },
    body: [
      'My primary and secondary schooling took place in Seine-Saint-Denis, in **La Courneuve**, a deprived area. Having reached studies of high quality thanks to the **Cordées de la Réussite, the CentraleSupélec Foundation and CapPrépa**, I have always wanted to make **altruism and teaching a central value**, in gratitude for what I received along the way.',
      '**OSER**, from my first year at CentraleSupélec, gave that a form: tutoring sessions in secondary schools, on general knowledge and orientation, against the self-censorship that keeps pupils from applying; then, as **VP Carnets de France**, a team of 5 to offer 20 pupils from disadvantaged areas a 3-day trip to a major French city. **Teaching** followed the same line: a week as a mathematics and physics tutor for **ESSEC’s CAP PREPA programme**, 4 preparatory-class students from disadvantaged backgrounds; a year as a teaching assistant in probability and partial differential equations; a mathematics course co-organised for international students; and today the supervision of 7 undergraduates at **SRIE**.',
    ],
  },
  {
    id: 'sport',
    kicker: 'Sport at a competitive level',
    title: 'Badminton, from regional level to the club presidency',
    image: { src: '/img/journey/badminton.jpg', alt: 'Bilel on a badminton court, racket low, mid-rally', caption: 'On court, 2018', ratio: '4 / 5' },
    body: [
      'I owe much of my discipline and my sense of the challenge to **badminton**, played at a highly competitive level when I was young: a **regional-level player** before the classes préparatoires.',
      'I carried that experience into the **presidency of the CentraleSupélec badminton club**: I recruited **50 players from 250 applicants**, led the team to the **French University Badminton Championships**, handled the competition registrations with the French University Sports Federation and the grant applications for transport and accommodation, and oversaw the equipment and the budget. At Cambridge I joined the university badminton club.',
    ],
  },
];

// Short list for the journey page, below the timeline.
export const ASIDES = [
  { label: 'Competitions', text: 'Jane Street R3 (Europe Trading Challenge); internship offer from QRT; finalist of the CentraleSupélec eloquence contest.' },
  { label: 'Languages', text: 'French (native), English (C1), Arabic (fluent), Spanish (basic).' },
];
