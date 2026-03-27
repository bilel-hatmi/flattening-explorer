import { useProfile } from '../../context/ProfileContext';
import { PROFILES } from '../../data/v5_reference';

const S = {
  wrap: {
    maxWidth: 640, margin: '0 auto', padding: '48px 24px',
  },
  badge: {
    display: 'inline-block',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11, fontWeight: 600, color: '#619EA8',
    background: 'rgba(97,158,168,0.10)',
    padding: '3px 10px', borderRadius: 4,
    marginBottom: 12,
  },
  question: {
    fontFamily: "'Instrument Serif', serif",
    fontSize: 22, color: '#22375A', marginBottom: 20,
    lineHeight: 1.3,
  },
  options: {
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  option: (selected) => ({
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '12px 16px', borderRadius: 8,
    border: selected ? '1.5px solid #619EA8' : '0.5px solid rgba(0,0,0,0.08)',
    background: selected ? 'rgba(97,158,168,0.06)' : '#FFFFFF',
    cursor: 'pointer', transition: 'all 0.2s',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 14, color: '#22375A',
  }),
  key: (selected) => ({
    width: 28, height: 28, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12, fontWeight: 600, flexShrink: 0,
    background: selected ? '#619EA8' : 'rgba(0,0,0,0.04)',
    color: selected ? '#FFFFFF' : '#888780',
    transition: 'all 0.2s',
  }),
  profileHint: {
    marginTop: 12, fontSize: 11, color: '#888780', fontStyle: 'italic',
  },
};

export default function Question({ questionData }) {
  const { setAnswer, ...answers } = useProfile();
  const currentValue = answers[questionData.dimension];

  const handleSelect = (optionKey) => {
    setAnswer(questionData.dimension, optionKey);
  };

  // Show matched profile hint after selection
  const selectedOption = questionData.options.find((o) => o.key === currentValue);
  const pointers = selectedOption?.profilePointers || [];

  return (
    <div style={S.wrap}>
      <div style={S.badge}>{questionData.id}</div>
      <h3 style={S.question}>{questionData.question}</h3>
      <div style={S.options}>
        {questionData.options.map((opt) => {
          const selected = currentValue === opt.key;
          return (
            <div
              key={opt.key}
              style={S.option(selected)}
              onClick={() => handleSelect(opt.key)}
            >
              <div style={S.key(selected)}>{opt.key}</div>
              <span>{opt.label}</span>
            </div>
          );
        })}
      </div>
      {pointers.length > 0 && (
        <div style={S.profileHint}>
          Closest profiles:{' '}
          {pointers.map((pid, i) => {
            const p = PROFILES[pid];
            return (
              <span key={pid}>
                {i > 0 && ', '}
                <span style={{ color: p?.color || '#22375A', fontWeight: 600 }}>
                  {p?.name} ({p?.city})
                </span>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
