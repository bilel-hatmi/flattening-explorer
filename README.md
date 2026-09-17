# bilelhatmi — personal site, with The Flattening Explorer as a sub-site

One Vite + React app. The root is the personal site of Bilel Hatmi; the interactive companion to *The Flattening: Invisible Tail Risk in AI-Adopting Organisations* (Cambridge–McKinsey Risk Prize 2026) lives under `/flattening`.

## Routes

| Path | Page |
|---|---|
| `/` | Home: hero, The Flattening card with the poster schema, four lines of research, milestones, contact |
| `/research` | Vision, the risks that deserve the effort, current work |
| `/projects`, `/projects/:slug` | Current / Earlier / Paused grids (numbered I–III) and one page per project with previous/next inside the group; `/projects/eleven-strategy` redirects to `/projects/eleven-rag` |
| `/journey` | Bio, two narratives (giving back; sport), timeline, CV |
| `/documents` | Essays, poster, the Part III essay, SRIE decks, reports, code |
| `/notes/*` | Retired 2026-09-17; redirects to `/research` |
| `/flattening` | The Flattening landing |
| `/flattening/questionnaire` → `/flattening/explore` | Profile questionnaire, then the four acts and the Lab |
| `/flattening/model`, `/flattening/about` | Model calibration; project page and documents |
| `/explore`, `/questionnaire`, `/model`, `/about` | Legacy paths, redirect into `/flattening/…` (the printed poster QR still works) |

## Editing the content

Everything the personal site says lives in `src/content/`, never in components:

- `site.js` — name, tagline, short and long bio, links, the Flattening card on the home page
- `research.md` — the Research page, split on its `## ` headings (lede, then sections numbered I, II, III in framed panels); `research.js` holds the four current-work cards dropped at the `<!-- lines -->` marker
- `projects.js` — one entry per project with `group` (`current`, `earlier`, `paused`, `programme`) and `icon` (a name from `components/site/Icon.jsx`); long prose in `projects/<slug>.md`; the three SRIE projects are first-class current entries whose `parent` is `srie-2026` (the stream page, not listed in the grid); `deck` adds a PDF strip with a thumbnail
- `journey.js` — timeline entries, the two narratives, the asides. Bio and narrative strings may carry `**bold**` spans (`src/utils/inline.js`)
- `documents.js` — the document grid (also read by `/flattening/about`): `type` picks the badge icon, `action` the link text, `secondary` a second link, `logo` an image

Markdown files may use a few HTML blocks, rendered through `rehype-raw` and styled in `src/prose-rich.css`: `<p class="lead">`, `<aside class="callout">`, `<blockquote class="pull">`, `<figure class="wide">` with `<figcaption>`, `<div class="stats">`, `<div class="cards3">`, `<dl class="work">`, `<dl class="levers">`, `<div class="projects3">`, `<p class="sources">`, `<span class="tag">`.

## What The Flattening shows

AI adoption reduces average decision errors while silently increasing worst-case losses. The explorer walks through that paradox in four acts, then lets you test your own organisational parameters in the laboratory.

- **Act I** — The paradox: bimodal loss distributions, silent drift, live simulation
- **Act II** — The mechanisms: correlation structure, convergence trap, catastrophe frontier, conformism
- **Act III** — The levers: heatmap, stack diversification, sensitivity analysis, dashboard bias, governance regressivity, profile comparator, ablation
- **Act IV** — The systemic picture: provider contagion, supply chain amplification, geographic map, Nash equilibrium
- **Lab** — Parameter explorer with live Monte Carlo simulation via Pyodide

## Stack

- **Frontend**: React 18 + Vite 5 + React Router 6
- **Charts**: Canvas 2D, SVG
- **Map**: Leaflet.js + CartoDB tiles
- **Equations**: KaTeX
- **Markdown**: react-markdown + remark-gfm + remark-math + rehype-katex (lazy chunk)
- **Simulation**: Pyodide (Python in WebAssembly) running `flattening_pyodide.py` in a Web Worker
- **Styling**: Inline styles + CSS variables in `src/index.css` (no CSS framework)
- **Deployment**: Static SPA on Vercel; `vercel.json` carries the SPA rewrite that deep links need

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build and deploy

```bash
npm run build
vercel --prod
```

Output in `dist/`. The `/flattening` subtree is code-split: the home page ships without the 18 graphs, Leaflet or KaTeX.

## Project structure

```
src/
├── App.jsx                    # Two layout routes, legacy redirects, lazy explorer
├── routes.js                  # FLATTENING_BASE, fl(), SITE — the only source of paths
├── content/                   # All personal-site copy (see above)
├── prose-rich.css             # HTML blocks allowed inside the Markdown content
├── motion.css                 # Entrances, scroll reveals, hero field, hover depth (off under reduced motion)
├── pages/site/                # Home, Research, Projects, ProjectPage, Journey, Documents, NotFound
├── components/site/           # SiteLayout, SiteNav, Footer, Card, DocCard, Icon, Reveal, Section, Tag, Timeline, Prose
├── components/
│   ├── graphs/                # 18 interactive visualisations (A1–DNASH)
│   ├── layout/                # FlatteningLayout, Nav, ScrollSections (sidebar + acts)
│   └── ui/                    # GraphCard, Toggle, Slider, Tooltip, GraphSkeleton
├── sections/                  # ActA through ActD (graph composition)
├── pages/                     # Landing, Questionnaire, Lab, Model (About), Author
├── context/                   # ProfileContext (questionnaire state)
├── hooks/                     # useCSV, usePyodide, useIntersection, useIsMobile, useDocumentTitle, useScrollToTop
├── data/                      # v5_reference, profiles, questionnaire, pair_data
├── utils/                     # helpers (hexToRgba, fmt, buildKDE), frontmatter
└── workers/                   # Pyodide Web Worker
public/
├── data/                      # Pre-computed CSV datasets (Monte Carlo M=200)
├── docs/                      # PDFs: essay, poster, CV, CartesIA
├── flattening_pyodide.py      # Python simulation engine
├── favicon.svg                # Site favicon
└── logo.png                   # CartesIA logo
```

## Data

All visualisations are backed by Monte Carlo simulations (M=200, β_conform=0.30). Eight organisational profiles span the parameter space from Singapore's diversified creative agency to Seoul's centralised administration. The simulation engine (`flattening_pyodide.py`) runs in the browser via Pyodide for the Lab's custom parameter exploration.

## Author

Bilel Hatmi — Part III Mathematical Statistics, University of Cambridge (DPMMS). Founder of CartesIA.

## Licence

This project accompanies an academic submission. All rights reserved pending publication.
