const styles = {
  card: {
    background: '#FFFFFF',
    border: '0.5px solid rgba(0, 0, 0, 0.08)',
    borderRadius: 12,
    padding: '18px 22px',
    marginBottom: 16,
    maxWidth: '94%',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  title: {
    fontFamily: "'Instrument Serif', serif",
    fontSize: 20,
    color: '#22375A',
    marginBottom: 4,
    lineHeight: 1.2,
  },
  subtitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 12,
    color: '#888780',
    marginBottom: 12,
    lineHeight: 1.5,
  },
  children: {
    minHeight: 100,
  },
  footnote: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 12,
    color: '#888780',
    marginTop: 16,
    lineHeight: 1.5,
    fontStyle: 'italic',
  },
};

export default function GraphCard({ id, title, subtitle, footnote, children, style }) {
  return (
    <div id={id} style={{ ...styles.card, ...style }}>
      {title && <h3 style={styles.title}>{title}</h3>}
      {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
      <div style={styles.children}>{children}</div>
      {footnote && <p style={styles.footnote}>{footnote}</p>}
    </div>
  );
}
