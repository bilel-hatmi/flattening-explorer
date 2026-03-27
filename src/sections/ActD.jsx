import React from 'react';
import D1_Contagion from '../components/graphs/D1_Contagion';
import D2BIS_SupplyChain from '../components/graphs/D2BIS_SupplyChain';
import D3_GeoMap from '../components/graphs/D3_GeoMap';
import DNASH_Game from '../components/graphs/DNASH_Game';

export default function ActD() {
  return (
    <section style={{ padding: '12px 0' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 14, fontSize: 28, fontFamily: "'Instrument Serif', serif", color: '#22375A' }}>
        Acte IV &mdash; The systemic picture
      </h2>
      <D1_Contagion />
      <D2BIS_SupplyChain />
      <D3_GeoMap />
      <DNASH_Game />
    </section>
  );
}
