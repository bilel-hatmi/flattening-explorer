import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { fl, LEGACY_FLATTENING_PATHS } from './routes';

// Personal site
import SiteLayout from './components/site/SiteLayout';
import Home from './pages/site/Home';
import Research from './pages/site/Research';
import Projects from './pages/site/Projects';
import ProjectPage from './pages/site/ProjectPage';
import Journey from './pages/site/Journey';
import Documents from './pages/site/Documents';
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
        <Route path="research" element={<Research />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:slug" element={<ProjectPage />} />
        <Route path="journey" element={<Journey />} />
        <Route path="documents" element={<Documents />} />
        {/* Notes was retired on 2026-09-17; old links land on Research. */}
        <Route path="notes/*" element={<Navigate to="/research" replace />} />
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
