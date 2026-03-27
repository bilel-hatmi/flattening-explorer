import React from 'react';
import C1_Heatmap from '../components/graphs/C1_Heatmap';
import C2_P99Alpha from '../components/graphs/C2_P99Alpha';
import C3_Tornado from '../components/graphs/C3_Tornado';
import C4_Scatter from '../components/graphs/C4_Scatter';
import C5_Slope from '../components/graphs/C5_Slope';
import C6_Comparator from '../components/graphs/C6_Comparator';
import CWI_Ablation from '../components/graphs/CWI_Ablation';

export default function ActC() {
  return (
    <section style={{ padding: '12px 0' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 14, fontSize: 28, fontFamily: "'Instrument Serif', serif", color: '#22375A' }}>
        Acte III &mdash; The levers
      </h2>
      <C1_Heatmap />
      <C2_P99Alpha />
      <C3_Tornado />
      <C4_Scatter />
      <C5_Slope />
      <C6_Comparator />
      <CWI_Ablation />
    </section>
  );
}
