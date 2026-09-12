import React, { useState, Suspense } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import { ProfileProvider } from '../../context/ProfileContext';
import Nav from './Nav';
import ScrollSections from './ScrollSections';
import GraphSkeleton from '../ui/GraphSkeleton';
import useDocumentTitle from '../../hooks/useDocumentTitle';

// Layout route for everything under /flattening. Owns what App.jsx used to
// own: the profile context and the current act. Both reset when the visitor
// leaves the explorer, which is the intended scope.
export default function FlatteningLayout() {
  useDocumentTitle('The Flattening');
  const [currentAct, setCurrentAct] = useState(0);
  return (
    <ProfileProvider>
      <Nav />
      {/* Pages under /flattening are lazy chunks; keep the bar while one loads. */}
      <Suspense fallback={<div style={{ maxWidth: 720, margin: '40px auto', padding: '0 24px' }}><GraphSkeleton height={320} /></div>}>
        <Outlet context={{ currentAct, setCurrentAct }} />
      </Suspense>
    </ProfileProvider>
  );
}

// /flattening/explore — reads the act state from the layout above.
export function ExploreOutlet() {
  const { currentAct, setCurrentAct } = useOutletContext();
  return <ScrollSections currentAct={currentAct} setCurrentAct={setCurrentAct} />;
}
