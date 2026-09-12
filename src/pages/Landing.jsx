import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useIsMobile from '../hooks/useIsMobile';
import { fl } from '../routes';

const COUNTERS = [
  { label: 'Average loss', value: '-38%', color: '#4A7C59', description: 'Expected loss falls with AI adoption' },
  { label: 'Worst-case (P99)', value: '+56%', color: '#B5403F', description: 'Worst-case loss rises with AI adoption' },
  { label: 'Output', value: '+54%', color: '#4A7C59', description: 'Throughput rises while the tail hides' },
];

function AnimatedCounter({ target, duration = 1200, delay = 0 }) {
  const [display, setDisplay] = useState('');
  useEffect(() => {
    const prefix = target.startsWith('+') ? '+' : target.startsWith('-') ? '-' : '';
    const suffix = target.includes('%') ? '%' : '';
    const multiplier = target.startsWith('\u00d7');
    const numStr = target.replace(/[+\-\×%]/g, '');
    const targetNum = parseFloat(numStr);
    const timer = setTimeout(() => {
      const start = performance.now();
      const animate = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = targetNum * eased;
        if (multiplier) setDisplay(`\×${current.toFixed(1)}`);
        else setDisplay(`${prefix}${Math.round(current)}${suffix}`);
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, delay);
    return () => clearTimeout(timer);
  }, [target, duration, delay]);
  return <span>{display || target}</span>;
}

export default function Landing() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '40px 18px' : '40px 24px' }}>
      <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: isMobile ? 40 : 56, fontWeight: 400, color: '#22375A', lineHeight: 1.1, marginBottom: 16, textAlign: 'center' }}>
        The Flattening
      </h1>
      <p style={{ fontSize: isMobile ? 17 : 20, color: '#22375A', fontWeight: 500, maxWidth: 600, margin: isMobile ? '0 auto 32px' : '0 auto 48px', lineHeight: 1.4, textAlign: 'center' }}>
        AI optimises the mean and concentrates the tail.
      </p>

      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'center', gap: isMobile ? 12 : 32, marginBottom: isMobile ? 32 : 48, flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
        {COUNTERS.map((c, i) => (
          <div key={c.label} style={{ background: '#FFFFFF', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: isMobile ? '18px 20px' : '24px 32px', minWidth: isMobile ? 0 : 180, width: isMobile ? '100%' : 'auto', boxSizing: 'border-box', textAlign: 'center' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 36, fontWeight: 700, color: c.color, marginBottom: 4 }}>
              <AnimatedCounter target={c.value} delay={i * 400} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#22375A', marginBottom: 2 }}>{c.label}</div>
            <div style={{ fontSize: 11, color: '#888780' }}>{c.description}</div>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate(fl('/questionnaire'))}
        style={{
          padding: '14px 40px', borderRadius: 8, border: 'none',
          background: '#22375A', color: '#FFFFFF', fontSize: 16, fontWeight: 600,
          cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
          transition: 'transform 0.15s',
          ...(isMobile ? { width: '100%', maxWidth: 360, minHeight: 48 } : {}),
        }}
        onMouseEnter={(e) => (e.target.style.transform = 'scale(1.03)')}
        onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
      >
        Explore the data
      </button>

      <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <img src="/logo.png" alt="CartesIA" style={{ height: 64 }} />
        <p style={{ fontSize: 12, color: '#888780', maxWidth: 500, textAlign: 'center', lineHeight: 1.5 }}>
          Interactive companion to "The Flattening", Cambridge{'\u2013'}McKinsey Risk Prize 2026.
        </p>
      </div>
    </div>
  );
}
