# The Flattening Explorer

Interactive companion to *The Flattening: Invisible Tail Risk in AI-Adopting Organisations*, submitted to the Cambridge–McKinsey Risk Prize 2026.

## What it shows

AI adoption reduces average decision errors while silently increasing worst-case losses. This application lets you explore that paradox through four narrative acts, then test your own organisational parameters in the laboratory.

- **Acte I** — The paradox: bimodal loss distributions, silent drift, live simulation
- **Acte II** — The mechanisms: correlation structure, convergence trap, catastrophe frontier, conformism
- **Acte III** — The levers: heatmap, stack diversification, sensitivity analysis, dashboard bias, governance regressivity, profile comparator, ablation
- **Acte IV** — The systemic picture: provider contagion, supply chain amplification, geographic map, Nash equilibrium
- **Lab** — Parameter explorer with live Monte Carlo simulation via Pyodide

## Stack

- **Frontend**: React 18 + Vite 5
- **Charts**: Canvas 2D, SVG, Recharts
- **Map**: Leaflet.js + CartoDB tiles
- **Equations**: KaTeX
- **Simulation**: Pyodide (Python in WebAssembly) running `flattening_pyodide.py` in a Web Worker
- **Styling**: Inline styles (no CSS framework)
- **Deployment**: Static SPA (Vercel, GitHub Pages, or any CDN)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
```

Output in `dist/`. Deploy as static files.

## Project structure

```
src/
├── App.jsx                    # Routes and providers
├── main.jsx                   # Entry point
├── components/
│   ├── graphs/                # 18 interactive visualisations (A1–DNASH)
│   ├── layout/                # Nav, ScrollSections (sidebar + acts)
│   └── ui/                    # GraphCard, Toggle, Slider, Tooltip, GraphSkeleton
├── sections/                  # ActA through ActD (graph composition)
├── pages/                     # Landing, Questionnaire, Lab, Model (About), Author
├── context/                   # ProfileContext (questionnaire state)
├── hooks/                     # useCSV, usePyodide, useIntersection
├── data/                      # v5_reference, profiles, questionnaire, pair_data
├── utils/                     # Shared helpers (hexToRgba, fmt, buildKDE)
└── workers/                   # Pyodide Web Worker
public/
├── data/                      # Pre-computed CSV datasets (Monte Carlo M=200)
├── flattening_pyodide.py      # Python simulation engine
└── logo.png                   # CartesIA logo
```

## Data

All visualisations are backed by Monte Carlo simulations (M=200, β_conform=0.30). Eight organisational profiles span the parameter space from Singapore's diversified creative agency to Seoul's centralised administration. The simulation engine (`flattening_pyodide.py`) runs in the browser via Pyodide for the Lab's custom parameter exploration.

## Author

Bilel Hatmi — Part III Mathematical Statistics, University of Cambridge (DPMMS). Founder of CartesIA.

## Licence

This project accompanies an academic submission. All rights reserved pending publication.
