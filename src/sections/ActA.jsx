import React from 'react';
import A1_BimodalHero from '../components/graphs/A1_BimodalHero';
import A2_SilentDrift from '../components/graphs/A2_SilentDrift';
import ALIVE_Simulation from '../components/graphs/ALIVE_Simulation';

export default function ActA() {
  return (
    <section style={{ padding: '12px 0' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 14, fontSize: 28, fontFamily: "'Instrument Serif', serif", color: '#22375A' }}>
        Acte I &mdash; The paradox
      </h2>
      <A1_BimodalHero />
      <A2_SilentDrift />
      <ALIVE_Simulation />
    </section>
  );
}
