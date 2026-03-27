# CLAUDE.md — The Flattening Explorer
## Mémoire permanente du projet pour Claude Code

> **Lire ce fichier en entier avant chaque session.**
> En cas de conflit entre ce fichier et un autre fichier du repo, ce fichier prévaut.

---

## 0. COMMENT DÉMARRER — PREMIÈRE SESSION

Tu reçois un dossier avec tous les fichiers du projet. Voici exactement quoi faire, dans l'ordre :

**Étape 1 — Initialiser le repo**
```bash
bash init_structure.sh flattening-explorer
cd flattening-explorer
```

**Étape 2 — Placer les fichiers reçus**
```
CSV (*.csv)              → /public/data/
Prototypes (*.html)      → /prototypes/
Specs (*_task_spec.md)   → /specs/
flattening_pyodide.py    → /public/
model_content.md         → racine du projet (si disponible)
CLAUDE.md                → déjà à la racine
```

**Prototype C6 — attention :** utiliser `C6_comparator.html` (33k, 28 paires).
PAS `C6_contrast.html` (ancien, 15k). Si les deux sont présents, ignorer C6_contrast.html.

**Étape 3 — Valider les CSV**
```bash
npm run validate:csv
```
Signaler à l'utilisateur tout CSV manquant avant de commencer à coder.

**Étape 4 — Déployer sur Vercel dès maintenant**
```bash
vercel login && vercel --prod
```
Déployer le squelette vide dès le début — permet de tester chaque composant en conditions réelles au fur et à mesure.

**Étape 5 — Identifier ce qui est disponible**

Vérifier si `model_content.md` est présent à la racine.
- **Si OUI** : toutes les phases peuvent être faites, y compris Hero, Questionnaire, About, Calibration, Encart flottant.
- **Si NON** : faire d'abord les phases 1-3 (tous les graphes). Les phases 4-5 attendent ce fichier.

**Règle absolue avant de coder chaque composant :**
Lire `specs/[ID]_task_spec.md` → lire le prototype HTML → vérifier les valeurs numériques vs `src/data/v5_reference.js` → si écart, signaler AVANT de coder.

---



## 1. CONTEXTE DU PROJET

**The Flattening Explorer** est une application web interactive qui accompagne l'essai "The Flattening" soumis au Cambridge-McKinsey Risk Prize 2026. Elle visualise comment l'adoption non gouvernée de l'IA crée un risque de queue invisible dans les organisations.

**Deadline : 31 mars 2026.**

L'app est une longue page narrative en scroll (4 actes) + un onglet Lab séparé. Le visiteur répond à 5 questions au fil du scroll — ses réponses personnalisent progressivement les graphes. À la fin, une page About/Calibration explique le modèle.

---

```
Frontend    : Vite + React 18 + React Router v6
Charts      : Recharts (line charts simples), Canvas 2D (histogrammes), SVG custom (scatter, slope)
Map         : Leaflet.js v1.9 + CartoDB tiles + Natural Earth GeoJSON
Simulations : Pyodide (Python en WebAssembly, Web Worker)
Styling     : CSS modules (pas de Tailwind — trop lourd pour les graphes custom)
Déploiement : Vercel (static SPA, zéro serverless functions)
Node        : >= 18
```

**Ne jamais proposer Next.js, SSR, ou une API backend.** L'app est entièrement statique côté client.

---

## 3. STRUCTURE DU REPO

```
flattening-explorer/
├── CLAUDE.md                    ← ce fichier
├── package.json
├── vite.config.js
├── index.html
├── public/
│   ├── flattening_pyodide.py        ← simulation Python (charger via fetch dans le worker)
│   └── data/                        ← CSV servis statiquement (fetch lazy)
│       ├── histograms_by_profile_b030.csv
│       ├── trajectories_by_profile_b030.csv
│       ├── heatmap_alpha_pi_b030.csv
│       ├── sweep_dimensions.csv
│       ├── scatter_profiles_b030.csv
│       ├── profile_summary_v3_b030.csv
│       ├── sweep_profiles_v3_b030.csv
│       ├── correlation_grid_P3_good.csv
│       ├── correlation_grid_P3_bad.csv
│       ├── ablation_results.csv
│       └── exhibit_2_frontier.csv
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── data/
│   │   ├── profiles.js          ← constantes des 8 profils (couleurs, labels, paramètres)
│   │   ├── v5_reference.js      ← valeurs numériques v5 (NE JAMAIS MODIFIER MANUELLEMENT)
│   │   └── pair_data.js         ← 28 paires C6 avec textes pré-écrits
│   ├── hooks/
│   │   ├── usePyodide.js        ← chargement Pyodide + expose les 3 fonctions
│   │   ├── useCSV.js            ← fetch + parse CSV avec cache
│   │   └── useIntersection.js   ← lazy loading des graphes au scroll
│   ├── components/
│   │   ├── graphs/
│   │   │   ├── A1_BimodalHero.jsx
│   │   │   ├── A2_SilentDrift.jsx
│   │   │   ├── ALIVE_Simulation.jsx
│   │   │   ├── B1_CorrelationGrid.jsx
│   │   │   ├── B2_Convergence.jsx
│   │   │   ├── B3_PiFrontier.jsx
│   │   │   ├── B4_Conformism.jsx
│   │   │   ├── C1_Heatmap.jsx
│   │   │   ├── C2_P99Alpha.jsx
│   │   │   ├── C3_Tornado.jsx
│   │   │   ├── C4_Scatter.jsx
│   │   │   ├── C5_Slope.jsx
│   │   │   ├── C6_Comparator.jsx
│   │   │   ├── CWI_Ablation.jsx
│   │   │   ├── D1_Contagion.jsx
│   │   │   ├── D2BIS_SupplyChain.jsx
│   │   │   ├── D3_GeoMap.jsx
│   │   │   └── DNASH_Game.jsx
│   │   ├── ui/
│   │   │   ├── GraphCard.jsx    ← wrapper carte avec titre, sous-titre, disclaimer
│   │   │   ├── Toggle.jsx       ← boutons G0/G1/G2
│   │   │   ├── Slider.jsx       ← slider custom
│   │   │   └── Tooltip.jsx      ← tooltip flottant standard
│   │   └── layout/
│   │       ├── Nav.jsx
│   │       └── ScrollSections.jsx
│   ├── sections/
│   │   ├── ActA.jsx
│   │   ├── ActB.jsx
│   │   ├── ActC.jsx
│   │   └── ActD.jsx
│   └── workers/
│       └── pyodide.worker.js    ← Web Worker Pyodide
├── prototypes/                  ← HTML de référence (READ ONLY — ne pas modifier)
│   ├── A1_bimodal_hero_v3.html
│   ├── A2_silent_drift.html
│   ├── ALIVE_simulation_v2.html
│   ├── B1_correlation_grid_v2.html
│   ├── B2_convergence.html
│   ├── B3_pi_slider_v2.html
│   ├── B4_conformism.html
│   ├── C1_heatmap.html
│   ├── C2_p99_alpha.html
│   ├── C3_tornado_v2.html
│   ├── C4_scatter_v3.html
│   ├── C5_slope_v3.html
│   ├── C6_comparator.html
│   ├── CWI_ablation.html
│   ├── D1_contagion.html
│   ├── D2BIS_supply_chain.html
│   ├── D3_geomap_v2.html
│   └── DNASH_game.html
└── scripts/
    └── validate_csv.js          ← vérifie que les CSV ont les bonnes colonnes
```

---

## 4. VALEURS NUMÉRIQUES V5 — NE JAMAIS MODIFIER

Ces valeurs viennent des simulations Monte Carlo validées (M=200, β_conform=0.30).
Toute modification nécessite validation explicite de l'orchestrateur modélisateur.

```javascript
// src/data/v5_reference.js — source de vérité pour tous les graphes

export const CENTRAL_CASE = {
  baseline: { EL: 801.7,  p99: 1097, p99theta: 1097, output: 1198 },
  G0:       { EL: 498.9,  p99: 1708, p99theta: 2135, output: 1876 },
  G1:       { EL: 556.8,  p99: 1594, p99theta: 1913, output: 1732 },
  G2:       { EL: 618.0,  p99: 1383, p99theta: 1521, output: 1520 },
};

export const PARADOX = {
  deltaEL:      -37.8,   // % — E[L] baisse
  deltaP99:     +55.7,   // % — P99 brut monte
  deltaP99theta: +94.6,  // % — P99×θ monte
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

// Valeurs interdites (versions v4 obsolètes)
// ❌ P99 = 1115  → ✅ 1097
// ❌ P6 p99G0 = 1380 → ✅ 1845
// ❌ scaffold P6 = +671% → ✅ +40%
// ❌ scaffold P2 = +107% → ✅ +146%
// ❌ P99_OWN (D2-BIS) = 1500 → ✅ 2135
// ❌ Paris-London delta = -35% → ✅ +22%
```

---

## 5. DESIGN SYSTEM — PALETTE ET TYPOGRAPHIE

```javascript
// Palette — utiliser UNIQUEMENT ces valeurs
const COLORS = {
  navy:    '#22375A',
  teal:    '#619EA8',
  cream:   '#F5F4EF',
  danger:  '#B5403F',
  warning: '#C49A3C',
  success: '#4A7C59',
  neutral: '#888780',
};

// Typographie (charger via Google Fonts ou self-hosted)
// - Titres graphes : Instrument Serif
// - Corps/labels : Plus Jakarta Sans
// - Chiffres/axes : JetBrains Mono
```

**Règles visuelles non-négociables :**
- Fond app : `#F5F4EF` (cream), cartes : `#FFFFFF`
- Pas de shadows. Pas de gradients. Flat.
- Border des cartes : `0.5px solid rgba(0,0,0,0.08)`, `border-radius: 12px`
- Axe Y histogrammes : jamais de labels numériques (forme = message)
- Pas de couleur rouge/vert sur les cercles D3 — taille seulement

---

## 6. STATUT DES GRAPHES — QUI PEUT PARTIR MAINTENANT

Tous les CSV sont livrés et validés (12/12). Tous les graphes peuvent partir.

### ✅ Peuvent partir immédiatement (CSV prêts ou JS pur)

| Graphe | Source | Fichier(s) de données | Notes |
|--------|--------|-----------------------|-------|
| A1 | CSV | `histograms_by_profile_b030.csv` | Prototype : `A1_bimodal_hero_v3.html` |
| A2 | CSV | `trajectories_by_profile_b030.csv` | 4 scénarios — prototype : `A2_silent_drift.html` |
| B2 | CSV | `trajectories_by_profile_b030.csv` | Même source que A2 |
| B3 | JS pur | — | Gaussian mixture paramétrique, zéro CSV |
| B4 | JS pur | — | Formule β_conform, sliders seulement |
| C1 | CSV | `heatmap_alpha_pi_b030.csv` | Grille 2D α × E[π] |
| C2 | CSV | `heatmap_alpha_pi_b030.csv` | Même source que C1, courbe marginale |
| C3 | CSV | `sweep_dimensions.csv` | ⚠ voir note barre epi en section 7 |
| C4 | CSV | `scatter_profiles_b030.csv` + `profile_summary_v3_b030.csv` | 8 profils, 3 positions chacun |
| C5 | CSV | `sweep_profiles_v3_b030.csv` | ⚠ format LONG — pivoter, voir section 7 |
| C6 | CSV | `histograms_by_profile_b030.csv` | Prototype : `C6_comparator.html` (PAS C6_contrast) |
| C-WI | CSV | `ablation_results.csv` ✅ | 48 lignes, 8 profils × 6 ablations — données réelles |
| D1 | JS pur | — | PRNG seedé (seeds: 42/99/137) |
| D2-BIS | JS pur | — | ω_eff = 1.0 + 0.8×f^1.5 |
| D3 | JS pur | `profile_summary_v3_b030.csv` (coords) | Leaflet — voir précautions section 7 |
| D-NASH | JS pur | — | Nash threshold = 5%, payoffs P3 Paris |

### ⏳ Bloqués — attendent Pyodide uniquement

| Graphe | Bloquant | Action pendant l'attente |
|--------|----------|--------------------------|
| A-LIVE | `flattening_pyodide.py` ✅ livré | Brancher le worker — fichier disponible dans `/public/` |
| B1 | `flattening_pyodide.py` ✅ livré | Idem — CSV init disponibles (`correlation_grid_P3_*.csv`) |
| C7 Lab | `flattening_pyodide.py` ✅ livré | Dernière priorité — faire après tout le reste |

**`flattening_pyodide.py` est livré et validé (3 tests PASS).** Le placer dans `/public/` avant de coder A-LIVE et B1.

---

## 7. RÈGLES DE DÉVELOPPEMENT CLAUDE CODE

### Workflow obligatoire avant de coder chaque composant
1. Lire `specs/[ID]_task_spec.md` — c'est le contrat, pas une suggestion
2. Ouvrir `prototypes/[ID].html` dans le navigateur — référence visuelle
3. Identifier toutes les valeurs numériques hardcodées dans le prototype
4. Vérifier qu'elles correspondent à `src/data/v5_reference.js`
5. Si écart → signaler à l'utilisateur, NE PAS coder, attendre confirmation
6. Coder le composant JSX
7. Comparer visuellement avec le prototype dans le navigateur

### Gestion des CSV — pattern obligatoire
```javascript
// Toujours via useCSV hook — jamais d'import direct dans le bundle
import { useCSV } from '../hooks/useCSV';

function MyGraph() {
  const { data, loading } = useCSV('/data/histograms_by_profile_b030.csv');
  if (loading) return <GraphSkeleton />;
  // ...
}
```

Les CSV sont dans `/public/data/` et fetchés à la demande (lazy). Jamais dans le bundle.

### ⚠ CSV en format LONG — pivot obligatoire pour C5

`sweep_profiles_v3_b030.csv` est en **format LONG** (32 lignes, colonne `scenario`).
Le pivoter avant utilisation dans `C5_Slope.jsx` :

```javascript
// Pivot sweep_profiles_v3_b030.csv (format long → wide par profil)
const byProfile = {};
data.forEach(row => {
  if (!byProfile[row.profile_id]) byProfile[row.profile_id] = { ...row };
  byProfile[row.profile_id][`p99_theta_${row.scenario}`] = +row.p99_theta;
  byProfile[row.profile_id][`output_${row.scenario}`]    = +row.output_mean;
});
const profiles = Object.values(byProfile);
// → profiles[i].p99_theta_G0, p99_theta_G1, p99_theta_G2 disponibles
```

### ⚠ C3 tornado — barre epi intentionnellement courte

`range_pct` de la dimension `epi` dans `sweep_dimensions.csv` vaut **2.3%** — c'est intentionnel, pas une erreur.

E[π] est non-identifiable à p₀=0.80 : le taux de surrender est si élevé que la frontière inside/outside affecte peu le tail risk agrégé. Ce résultat EST le mécanisme — il ne faut pas l'arrondir ni le "corriger".

Note de bas de graphe **obligatoire** dans C3_Tornado.jsx :
```
"Domain exposure shows near-zero marginal sensitivity at p₀=0.80 —
surrender rate is high enough that inside/outside frontier barely affects
aggregate tail risk. This is not a modelling artefact: it is the mechanism."
```

### Gestion Pyodide — pattern obligatoire
```javascript
// Web Worker obligatoire — ne jamais appeler Pyodide depuis le thread principal
const worker = new Worker(new URL('../workers/pyodide.worker.js', import.meta.url));

// Pyodide se charge une fois (~3-5s au premier accès)
// Afficher "Preparing simulation engine..." pendant le chargement
// Fallback : si Pyodide non prêt → afficher données CSV pré-calculées (B1)
// ou désactiver le bouton (A-LIVE) avec message "Engine loading..."
```

Fonctions exposées par `flattening_pyodide.py` :
- `simulate_one_quarter(profile_id, scenario, seed)` → un trimestre (~20-80ms)
- `simulate_quarter_grid(profile_id, scenario, seed)` → matrice 200×10 (~50ms)
- `run_scenario(profile_id, scenario, M=50, seed)` → M réplications (~3-5s, Web Worker)

### Pattern D3 / Leaflet — précautions Vite obligatoires
```javascript
// Ces 2 lignes sont OBLIGATOIRES — carte vide ou icônes cassées sans elles
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix icônes Leaflet cassées avec Vite (bug classique — ne pas ignorer)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9/dist/images/marker-shadow.png',
});
// scrollWheelZoom: false obligatoire (conflit avec le scroll de la page)
```

### Formulations protégées — NE JAMAIS PARAPHRASER

Ces chaînes apparaissent verbatim dans les graphes :

```
A2:     "↓ Looks like improvement"
A2:     "↑ Tail risk builds silently"
ALIVE:  "Most quarters look safe — then the tail arrives."
B1:     "The difference is structure, not quantity."
C3:     "Domain exposure shows near-zero marginal sensitivity at p₀=0.80 — [...]"
C4:     "What dashboards hide — actual vs perceived tail risk"
C5:     "Governance is regressive — it helps most where it is needed least"
D3:     "The map is a labour market and procurement map wearing geographic clothing."
D-NASH: "not because firms are irresponsible, but because the Nash equilibrium is at the wrong point."
```

### Valeurs interdites — régressions v4 à détecter immédiatement

Si une de ces valeurs apparaît dans le code ou dans un prototype, c'est une version obsolète :

```
❌ 1115  → ✅ 1097  (P99 baseline)
❌ 1380  → ✅ 1845  (P6 Singapore p99G0)
❌ 1495  → ✅ 1668  (P2 London p99G0)
❌ 1500  → ✅ 2135  (P99_OWN dans D2-BIS)
❌ 2015  → ✅ 2041  (P3 Paris p99G0)
❌ 2330  → ✅ 2318  (P8 Seoul p99G0)
❌ 671%  → ✅ 40%   (scaffold P6)
❌ 107%  → ✅ 146%  (scaffold P2)
❌ -35%  → ✅ +22%  (delta Paris-London)
❌ 1330  → ✅ 1303  (P3 Paris p99G2 dans D-NASH)
```

Procédure : signaler à l'utilisateur, ne pas corriger unilatéralement.

### validate_csv.js — colonnes attendues par fichier

```javascript
const EXPECTED = {
  'histograms_by_profile_b030.csv':   ['profile_id','scenario','bin_lo','bin_hi','count'],
  'trajectories_by_profile_b030.csv': ['profile_id','scenario','t','mean_loss','p99_brut','p99_theta','var_tau','h_bar','follow_rate','c_excess'],
  'heatmap_alpha_pi_b030.csv':        ['alpha','epi_mean','scenario','p99_brut','p99_theta'],
  'sweep_dimensions.csv':             ['dimension','param_lo','param_hi','p99_at_lo','p99_at_hi','central_p99'],
  'scatter_profiles_b030.csv':        ['profile_id','scenario','p99_theta','output_mean','scaffold_benefit'],
  'sweep_profiles_v3_b030.csv':       ['profile_id','scenario','p99_theta','output_mean'],  // format LONG
  'ablation_results.csv':             ['profile_id','ablation','p99_theta'],
  'exhibit_2_frontier.csv':           ['scenario','output_mean','p99_theta','mean_loss'],
  'correlation_grid_P3_good.csv':     ['agent_id','decision_id','error'],
  'correlation_grid_P3_bad.csv':      ['agent_id','decision_id','error'],
  'profile_summary_v3_b030.csv':      ['profile_id','p99_theta_G0','p99_theta_G2','scaffold_benefit'],
};
```

---

## 8. ARCHITECTURE PYODIDE — DÉTAIL

```
Fichier source : /public/flattening_pyodide.py
Worker         : src/workers/pyodide.worker.js
Hook React     : src/hooks/usePyodide.js

Chargement (une fois par session, ~3-5s) :
  importScripts('https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js')
  pyodide = await loadPyodide()
  await pyodide.loadPackage(['numpy'])
  const src = await fetch('/flattening_pyodide.py').then(r => r.text())
  await pyodide.runPythonAsync(src)
  postMessage({ type: 'ready' })

Messages reçus du main thread :
  { type: 'simulate_one_quarter',  id, profile_id, scenario, seed }
  { type: 'simulate_quarter_grid', id, profile_id, scenario, seed }
  { type: 'run_scenario',          id, profile_id, scenario, M, seed }

Messages envoyés au main thread :
  { type: 'ready' }                → Pyodide prêt
  { type: 'result', id, data: {} } → résultat JSON
  { type: 'error',  id, message }  → erreur (Promise se résout quand même)
```

**Valeurs de retour attendues :**

`simulate_one_quarter` → `{ total_loss: int, is_crisis: bool, pi_t: float, follow_rate: float, outside_pct: float, output: float }`

`simulate_quarter_grid` → `{ error_matrix: int[][], is_crisis: bool, c_excess: float, pi_t: float }` — error_matrix shape 200×10

`run_scenario` → `{ p99_theta: float, mean_loss: float, output_mean: float, scaffold_benefit: float, histogram_bins: [{bin_lo, bin_hi, count, density}], trajectories: [{t, mean_loss, p99, var_tau, h_bar, follow_rate}] }`

**Tests de validation (lancer avant intégration dans l'UI) :**
```javascript
// Test 1 — simulate_one_quarter(3, 'G0', 42) → total_loss devrait être 179
// Test 2 — simulate_quarter_grid(3, 'G0', 42) → matrice 200×10
// Test 3 — run_scenario(3, 'G0', M=5) → p99_theta dans [1641, 2441]
```

---

## 9. PHASES DE DÉVELOPPEMENT

**Règle de session :** 2-3 composants maximum par session. Finir un composant complètement (JSX + données + vérification visuelle vs prototype) avant d'en commencer un autre.

**Déploiement continu :** `vercel --prod` après chaque phase. L'URL Vercel est la référence visuelle réelle.

---

### PHASE 1 — Foundation (faire en premier, 1 session)

```
1. bash init_structure.sh flattening-explorer && cd flattening-explorer
2. Placer tous les fichiers (CSV → public/data/, prototypes → prototypes/, specs → specs/)
3. npm run validate:csv → signaler CSV manquants à l'utilisateur
4. vercel login && vercel --prod → déployer le squelette vide
5. Créer App.jsx avec React Router (routes: /, /lab, /about)
6. Créer Nav.jsx — sticky, 5 onglets + bouton "Read the essay"
7. Créer ScrollSections.jsx — structure des 4 actes
```

---

### PHASE 2 — Graphes JS pur (zéro dépendance, démarrer en parallèle)

Lancer en sous-agents simultanés — ces graphes sont totalement indépendants :

```
D-NASH_Game.jsx     → specs/DNASH_task_spec.md    + prototypes/DNASH_game.html
D1_Contagion.jsx    → specs/D1_task_spec.md        + prototypes/D1_contagion.html
D2BIS_SupplyChain.jsx → specs/D2BIS_task_spec.md  + prototypes/D2BIS_supply_chain.html
B3_PiFrontier.jsx   → specs/B3_task_spec.md        + prototypes/B3_pi_slider_v2.html
B4_Conformism.jsx   → specs/B4_task_spec.md        + prototypes/B4_conformism.html
```

---

### PHASE 3 — Graphes CSV (2-3 sessions)

```
Session A : A1_BimodalHero.jsx  → specs/A1_task_spec.md  + prototypes/A1_bimodal_hero_v3.html
            C4_Scatter.jsx      → specs/C4_task_spec.md  + prototypes/C4_scatter_v3.html

Session B : C1_Heatmap.jsx      → specs/C1_task_spec.md  + prototypes/C1_heatmap.html
            C2_P99Alpha.jsx     → specs/C2_task_spec.md  + prototypes/C2_p99_alpha.html
            C3_Tornado.jsx      → specs/C3_task_spec.md  + prototypes/C3_tornado_v2.html
                                   ⚠ note barre epi 2.3% obligatoire — voir section 7

Session C : C5_Slope.jsx        → specs/C5_task_spec.md  + prototypes/C5_slope_v3.html
                                   ⚠ pivoter sweep_profiles_v3_b030.csv — voir section 7
            C6_Comparator.jsx   → specs/C6_task_spec.md  + prototypes/C6_comparator.html
                                   ⚠ utiliser C6_comparator.html (28 paires), PAS C6_contrast.html
            B2_Convergence.jsx  → specs/B2_task_spec.md  + prototypes/B2_convergence.html

Session D : A2_SilentDrift.jsx  → specs/A2_task_spec.md  + prototypes/A2_silent_drift.html
            CWI_Ablation.jsx    → specs/CWI_task_spec.md + prototypes/CWI_ablation.html
                                   ✅ ablation_results.csv disponible — utiliser données réelles
```

Note : `exhibit_2_frontier.csv` (4 lignes, scatter frontière risque-rendement) alimente l'Exhibit 2 de l'essai prize, pas un composant interactif. Le rendre disponible dans `/public/data/` — il peut être utilisé dans About.jsx comme graphe statique si `model_content.md` le référence.

---

### PHASE 4 — Pyodide + Leaflet (après phases 2 et 3)

```
Session E : Pyodide worker (src/workers/pyodide.worker.js)
            ALIVE_Simulation.jsx → specs/ALIVE_task_spec.md + prototypes/ALIVE_simulation_v2.html
            B1_CorrelationGrid.jsx → specs/B1_task_spec.md + prototypes/B1_correlation_grid_v2.html

Session F : D3_GeoMap.jsx → specs/D3_task_spec.md + prototypes/D3_geomap_v2.html
            (Leaflet.js — voir section 7 pour les précautions Vite+Leaflet obligatoires)
```

---

### PHASE 5 — UI Shell + intégration narrative (dépend de model_content.md)

**⚠️ Cette phase nécessite `model_content.md` à la racine. Si absent, attendre.**

```
Session G : Hero.jsx
            - Animation compteurs delta_EL / delta_P99 depuis CENTRAL_CASE dans v5_reference.js
            - 3 callouts mémorables depuis model_content.md bloc RESULTS
            - Bouton "Read the essay" (URL dans model_content.md bloc LINKS)

Session H : Questionnaire (React Context global ProfileContext)
            - 5 questions depuis model_content.md bloc QUESTIONNAIRE
            - State : {domain, alpha, beta, h, omega}
            - Chaque réponse pointe vers le profil P1-P8 le plus proche
            - Context mis à jour → graphes downstream re-highlightent le profil

Session I : FloatingCard.jsx (encart sticky bottom-right)
            - Apparaît après Q1
            - Template depuis model_content.md bloc FLOATING_CARD
            - Mini radar 5 dimensions + P99 index depuis PROFILES[id]

Session J : About.jsx + Calibration.jsx + Links.jsx
            - Rendu KaTeX : npm install katex react-katex
            - Contenu intégral depuis model_content.md
            - Equations entre $$...$$ → BlockMath, inline $...$ → InlineMath
```

---

### PHASE 6 — Lab C7 (dernière priorité, après tout le reste)

```
Session K : Lab.jsx (route /lab)
            - 5 sliders : alpha, epi, beta_a, h_range, scenario
            - Presets profils P1-P8
            - 3 charts synchronisés : scatter, histogramme, tornado
            - Configs connues → CSV instantané
            - Configs custom → Pyodide run_scenario M=50 (Web Worker)
```

---

### ORDRE ABSOLU

```
Phase 1 (init) → Phases 2+3 en parallèle → Phase 4 → Phase 5 (si model_content.md prêt) → Phase 6
```

Ne jamais commencer Phase 6 avant que Phases 2, 3 et 4 soient complètes.
Ne jamais commencer Phase 5 sans `model_content.md`.

---

## 10. CHECKLIST AVANT CHAQUE COMMIT

- [ ] Aucune valeur numérique v4 dans le code ajouté (voir liste section 7)
- [ ] CSV fetché via `useCSV` hook — jamais importé directement dans le bundle
- [ ] Formulations protégées présentes verbatim (section 7)
- [ ] `v5_reference.js` non modifié manuellement
- [ ] C6 utilise `C6_comparator.html` comme référence (33k, 28 paires)
- [ ] C3 a sa note de bas de graphe sur la barre epi 2.3%
- [ ] C5 pivote `sweep_profiles_v3_b030.csv` avant usage
- [ ] C-WI utilise `ablation_results.csv` (données réelles) — pas le mock
- [ ] `vercel --prod` après chaque phase pour vérification visuelle en conditions réelles

---

## 11. UI SHELL — Éléments hors graphes

### Navigation sticky
```
Onglets : "The paradox | The mechanisms | The levers | The systemic picture | Lab"
Bouton droit : "Read the essay" → lien PDF (URL dans model_content.md)
Route /lab → onglet Lab séparé (C7)
Fond : Navy #22375A, texte blanc, hauteur 48px
```

### Structure de la page principale (scroll)
```
Hero
↓ Questionnaire Q1
↓ Acte A (A1 → A2 → A-LIVE)
↓ Questionnaire Q2
↓ Acte B (B1 → B2 → B3 → B4)
↓ Questionnaire Q3
↓ Acte C (C1 → C2 → C3 → C4 → C5 → C6 → C-WI)
↓ Questionnaire Q4 + Q5
↓ Acte D (D1 → D2-BIS → D3 → D-NASH)
↓ About / Calibration / Links
```

### Questionnaire — React Context
```javascript
// src/context/ProfileContext.jsx
const ProfileContext = createContext({
  domain: null,    // Q1 → E[π]
  alpha: null,     // Q2 → stack concentration
  beta: null,      // Q3 → labour market
  h: null,         // Q4 → talent level
  omega: null,     // Q5 → org size
  profileId: null, // P1-P8 — profil le plus proche calculé depuis les 5 réponses
});
```

Le contenu des 5 questions (textes, options, mapping profils) vient de `model_content.md` bloc QUESTIONNAIRE. Ne pas hardcoder les textes — les importer depuis le fichier.

### Encart flottant
```
Position : sticky, bottom-right, z-index élevé
Apparaît : après Q1 (premier profil approximé)
Contenu  : "Your profile — [city]" + P99 index + mini SVG radar 5 axes
Dimensions: 200×120px, Navy bg, texte blanc
Source données : PROFILES[profileId] depuis v5_reference.js
```

### About / Calibration — KaTeX
```jsx
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

// Equations : $$...$$ → <BlockMath>, $...$ inline → <InlineMath>
// Tout le contenu prose + équations vient de model_content.md
// Ne pas hardcoder le texte du modèle dans les composants
```

---

## 12. CONTACTS ENTRE CHATS

Ce projet est coordonné par plusieurs chats spécialisés. Claude Code ne communique pas directement avec eux — toute demande passe par l'utilisateur.

| Chat | Ce qu'il peut fournir |
|------|----------------------|
| Orchestrateur modélisateur | CSV manquants, `model_content.md`, validation chiffres |
| Designer graphes | Prototypes HTML mis à jour dans `/prototypes/` |
| Rédacteur prize | Formulations textuelles des insights |

**Règle d'or :** si une valeur numérique dans un prototype ne correspond pas à `v5_reference.js`, signaler à l'utilisateur et attendre confirmation — ne jamais corriger de sa propre initiative.

