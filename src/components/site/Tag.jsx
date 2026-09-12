// Small mono pill, as in the explorer's profile badge.
export default function Tag({ children, tone, style }) {
  const color = tone ? `var(--${tone})` : 'var(--text-muted)';
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 4,
      background: 'rgba(34,55,90,0.05)', fontFamily: 'var(--font-mono)',
      fontSize: 10, fontWeight: 500, color, whiteSpace: 'nowrap', ...style,
    }}>
      {children}
    </span>
  );
}

export function TagRow({ tags, tone, style }) {
  if (!tags || tags.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, ...style }}>
      {tags.map(t => <Tag key={t} tone={tone}>{t}</Tag>)}
    </div>
  );
}
