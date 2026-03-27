import React from 'react';

export default function Slider({ label, min, max, step, value, onChange, format, style }) {
  const display = format ? format(value) : value;
  return (
    <div style={{ marginBottom: 16, ...style }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 6,
        }}
      >
        {label && (
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 13,
              color: '#22375A',
              fontWeight: 500,
            }}
          >
            {label}
          </span>
        )}
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 14,
            color: '#22375A',
            fontWeight: 500,
          }}
        >
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step || 0.01}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: '100%',
          accentColor: '#619EA8',
          cursor: 'pointer',
        }}
      />
    </div>
  );
}
