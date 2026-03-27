import React from 'react';

const baseBtn = {
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize: 13,
  fontWeight: 600,
  padding: '6px 16px',
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
};

const SCENARIO_COLORS = {
  baseline: '#888780',
  G0: '#B5403F',
  G1: '#C49A3C',
  G2: '#4A7C59',
};

export default function Toggle({ options, value, onChange, style }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        borderRadius: 8,
        overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.08)',
        ...style,
      }}
    >
      {options.map((opt) => {
        const key = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        const active = key === value;
        const color = SCENARIO_COLORS[key] || '#22375A';
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            style={{
              ...baseBtn,
              background: active ? color : '#FFFFFF',
              color: active ? '#FFFFFF' : '#22375A',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
