import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProfileProvider } from './context/ProfileContext';
import Nav from './components/layout/Nav';
import Landing from './pages/Landing';
import QuestionnairePage from './pages/QuestionnairePage';
import ScrollSections from './components/layout/ScrollSections';

import Model from './pages/About';
import Author from './pages/Author';

export default function App() {
  const [currentAct, setCurrentAct] = useState(0);

  return (
    <ProfileProvider>
      <Nav />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/questionnaire" element={<QuestionnairePage />} />
        <Route path="/explore" element={
          <ScrollSections currentAct={currentAct} setCurrentAct={setCurrentAct} />
        } />
        <Route path="/about" element={<Author />} />
        <Route path="/model" element={<Model />} />
      </Routes>
    </ProfileProvider>
  );
}
