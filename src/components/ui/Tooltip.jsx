import React, { useState, useRef, useEffect } from 'react';

export default function Tooltip({ x, y, visible, children }) {
  const ref = useRef(null);
  const [offset, setOffset] = useState({ left: 0, top: 0 });

  useEffect(() => {
    if (!ref.current || !visible) return;
    const rect = ref.current.getBoundingClientRect();
    let left = 0;
    let top = 0;
    if (rect.right > window.innerWidth) left = -(rect.right - window.innerWidth + 8);
    if (rect.bottom > window.innerHeight) top = -(rect.height + 16);
    setOffset({ left, top });
  }, [x, y, visible]);

  if (!visible) return null;

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        left: x + 12 + offset.left,
        top: y + 12 + offset.top,
        background: '#22375A',
        color: '#FFFFFF',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 12,
        padding: '8px 12px',
        borderRadius: 6,
        pointerEvents: 'none',
        zIndex: 9999,
        maxWidth: 280,
        lineHeight: 1.4,
      }}
    >
      {children}
    </div>
  );
}
