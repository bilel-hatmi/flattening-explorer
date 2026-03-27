import React from 'react';

export default function GraphSkeleton({ height = 300 }) {
  return (
    <div
      style={{
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#888780',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 14,
      }}
    >
      Loading data...
    </div>
  );
}
