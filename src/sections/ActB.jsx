import React from 'react';
import B1_CorrelationGrid from '../components/graphs/B1_CorrelationGrid';
import B2_Convergence from '../components/graphs/B2_Convergence';
import B3_PiFrontier from '../components/graphs/B3_PiFrontier';
import B4_Conformism from '../components/graphs/B4_Conformism';

export default function ActB() {
  return (
    <section style={{ padding: '12px 0' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 14, fontSize: 28, fontFamily: "'Instrument Serif', serif", color: '#22375A' }}>
        Acte II &mdash; The mechanisms
      </h2>
      <B1_CorrelationGrid />
      <B2_Convergence />
      <B3_PiFrontier />
      <B4_Conformism />
    </section>
  );
}
