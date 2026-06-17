import React from 'react';
import A1_BimodalHero from '../components/graphs/A1_BimodalHero';
import A2_SilentDrift from '../components/graphs/A2_SilentDrift';
import ALIVE_Simulation from '../components/graphs/ALIVE_Simulation';
import useIsMobile from '../hooks/useIsMobile';

export default function ActA() {
  const isMobile = useIsMobile();
  return (
    <section style={{ padding: '12px 0' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 14, fontSize: isMobile ? 24 : 28, fontFamily: "'Instrument Serif', serif", color: '#22375A' }}>
        Act I: The paradox
      </h2>
      <A1_BimodalHero />
      <A2_SilentDrift />
      <ALIVE_Simulation />
    </section>
  );
}
