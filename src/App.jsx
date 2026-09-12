import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { fl, LEGACY_FLATTENING_PATHS } from './routes';

// Personal site (eager: small, and it is the landing surface)
import SiteLayout from './components/site/SiteLayout';
import Home from './pages/site/Home';
import Projects from './pages/site/Projects';
import ProjectPage from './pages/site/ProjectPage';
import Journey from './pages/site/Journey';
import Documents from './pages/site/Documents';
import Notes from './pages/site/Notes';
import NotePage from './pages/site/NotePage';
import NotFound from './pages/site/NotFound';

// The Flattening explorer (lazy: 18 graphs, Leaflet, KaTeX, the Pyodide
// worker — none of it should ship with the home page)
const FlatteningLayout  = React.lazy(() => import('./components/layout/FlatteningLayout'));
const ExploreOutlet     = React.lazy(() => import('./components/layout/FlatteningLayout').then(m => ({ default: m.ExploreOutlet })));
const Landing           = React.lazy(() => import('./pages/Landing'));
const QuestionnairePage = React.lazy(() => import('./pages/QuestionnairePage'));
const Model             = React.lazy(() => import('./pages/About'));
const Author            = React.lazy(() => import('./pages/Author'));

// Shown while a lazy chunk loads on a cold entry into /flattening: the same
// navy bar as both navs, so the page does not flash empty.
function RouteFallback() {
  return (
    <>
      <div style={{ height: 'var(--nav-h)', background: 'var(--navy)' }} />
      <div style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--text-faint)', fontSize: 13 }}>
        Loading{'…'}
      </div>
    </>
  );
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* ── Personal site ─────────────────────────────────────────── */}
        <Route element={<SiteLayout />}>
          <Route index element={<Home />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:slug" element={<ProjectPage />} />
          <Route path="journey" element={<Journey />} />
          <Route path="documents" element={<Documents />} />
          <Route path="notes" element={<Notes />} />
          <Route path="notes/:slug" element={<NotePage />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* ── The Flattening ────────────────────────────────────────── */}
        <Route path="flattening" element={<FlatteningLayout />}>
          <Route index element={<Landing />} />
          <Route path="questionnaire" element={<QuestionnairePage />} />
          <Route path="explore" element={<ExploreOutlet />} />
          <Route path="model" element={<Model />} />
          <Route path="about" element={<Author />} />
          <Route path="*" element={<Navigate to={fl()} replace />} />
        </Route>

        {/* ── Legacy root paths from before the explorer moved ──────── */}
        {LEGACY_FLATTENING_PATHS.map(p => (
          <Route key={p} path={p} element={<Navigate to={fl(`/${p}`)} replace />} />
        ))}
      </Routes>
    </Suspense>
  );
}
