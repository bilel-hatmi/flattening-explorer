import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { fl, LEGACY_FLATTENING_PATHS } from './routes';

// Personal site
import SiteLayout from './components/site/SiteLayout';
import Home from './pages/site/Home';
import NotFound from './pages/site/NotFound';

// The Flattening explorer (sub-site under /flattening)
import FlatteningLayout, { ExploreOutlet } from './components/layout/FlatteningLayout';
import Landing from './pages/Landing';
import QuestionnairePage from './pages/QuestionnairePage';
import Model from './pages/About';
import Author from './pages/Author';

export default function App() {
  return (
    <Routes>
      {/* ── Personal site ─────────────────────────────────────────── */}
      <Route element={<SiteLayout />}>
        <Route index element={<Home />} />
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
  );
}
