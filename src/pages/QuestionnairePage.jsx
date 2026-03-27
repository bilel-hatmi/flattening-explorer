import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { QUESTIONS } from '../data/questionnaire';
import { PROFILES } from '../data/v5_reference';

const S = {
  page: { minHeight: '100vh', maxWidth: 680, margin: '0 auto', padding: '48px 24px 96px' },
  header: { textAlign: 'center', marginBottom: 48 },
  title: { fontFamily: "'Instrument Serif', serif", fontSize: 32, color: '#22375A', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#888780', lineHeight: 1.5, maxWidth: 500, margin: '0 auto' },
  progress: { display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 40 },
  dot: (filled) => ({
    width: 10, height: 10, borderRadius: '50%',
    background: filled ? '#619EA8' : 'rgba(0,0,0,0.08)',
    transition: 'background 0.3s',
  }),
  qBlock: { marginBottom: 36 },
  qBadge: {
    display: 'inline-block', fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11, fontWeight: 600, color: '#619EA8',
    background: 'rgba(97,158,168,0.10)', padding: '3px 10px', borderRadius: 4, marginBottom: 10,
  },
  qText: { fontFamily: "'Instrument Serif', serif", fontSize: 20, color: '#22375A', marginBottom: 16, lineHeight: 1.3 },
  options: { display: 'flex', flexDirection: 'column', gap: 8 },
  option: (selected) => ({
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '12px 16px', borderRadius: 8,
    border: selected ? '1.5px solid #619EA8' : '0.5px solid rgba(0,0,0,0.08)',
    background: selected ? 'rgba(97,158,168,0.06)' : '#FFFFFF',
    cursor: 'pointer', transition: 'all 0.2s',
    fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, color: '#22375A',
  }),
  key: (selected) => ({
    width: 28, height: 28, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600, flexShrink: 0,
    background: selected ? '#619EA8' : 'rgba(0,0,0,0.04)',
    color: selected ? '#FFFFFF' : '#888780',
    transition: 'all 0.2s',
  }),
  hint: { marginTop: 8, fontSize: 11, color: '#888780', fontStyle: 'italic' },
  footer: { textAlign: 'center', marginTop: 48 },
  startBtn: (enabled) => ({
    padding: '14px 40px', borderRadius: 8, border: 'none',
    background: enabled ? '#22375A' : 'rgba(0,0,0,0.08)',
    color: enabled ? '#FFFFFF' : '#A0A09A',
    fontSize: 16, fontWeight: 600, cursor: enabled ? 'pointer' : 'default',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    transition: 'all 0.2s',
  }),
  profilePreview: {
    marginTop: 24, padding: '16px 20px', borderRadius: 10,
    background: '#22375A', color: '#FFFFFF', display: 'inline-block',
    textAlign: 'left',
  },
};

export default function QuestionnairePage() {
  const navigate = useNavigate();
  const { domain, alpha, beta, h, omega, profileId, setAnswer } = useProfile();

  const answers = { domain, alpha, beta, h, omega };
  const answeredCount = [domain, alpha, beta, h].filter(Boolean).length;
  const canStart = answeredCount >= 4; // Q5 optional

  const matchedProfile = profileId ? PROFILES[profileId] : null;

  return (
    <div style={S.page}>
      <div style={S.header}>
        <h1 style={S.title}>Tell us about your organisation</h1>
        <p style={S.subtitle}>
          Your answers personalise the visualisations; closer matches produce more relevant tail risk analysis.
        </p>
      </div>

      {/* Progress dots */}
      <div style={S.progress}>
        {QUESTIONS.map((q, i) => (
          <div key={q.id} style={S.dot(!!answers[q.dimension])} />
        ))}
      </div>

      {/* Questions */}
      {QUESTIONS.map((q) => {
        const current = answers[q.dimension];
        const selectedOpt = q.options.find((o) => o.key === current);
        const pointers = selectedOpt?.profilePointers || [];

        return (
          <div key={q.id} style={S.qBlock}>
            <div style={S.qBadge}>{q.id}</div>
            <h3 style={S.qText}>{q.question}</h3>
            <div style={S.options}>
              {q.options.map((opt) => {
                const selected = current === opt.key;
                return (
                  <div key={opt.key} style={S.option(selected)} onClick={() => setAnswer(q.dimension, opt.key)}>
                    <div style={S.key(selected)}>{opt.key}</div>
                    <span>{opt.label}</span>
                  </div>
                );
              })}
            </div>
            {pointers.length > 0 && (
              <div style={S.hint}>
                Closest profiles:{' '}
                {pointers.map((pid, i) => {
                  const p = PROFILES[pid];
                  return (
                    <span key={pid}>
                      {i > 0 && ', '}
                      <span style={{ color: p?.color, fontWeight: 600 }}>{p?.name} ({p?.city})</span>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Footer */}
      <div style={S.footer}>
        {matchedProfile && (
          <div style={S.profilePreview}>
            <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 4 }}>Your matched profile</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>
              <span style={{ color: matchedProfile.color }}>{matchedProfile.name}</span>
              {' \u2014 '}{matchedProfile.city}
         </div>
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
              {'P99\u00d7\u03b8'} = {matchedProfile.p99G0.toLocaleString()} | Scaffold: {matchedProfile.scaffold > 0 ? '+' : ''}{Math.round(matchedProfile.scaffold * 100)}%
            </div>
          </div>
        )}

        <div style={{ marginTop: 24 }}>
          <button
            style={S.startBtn(canStart)}
            onClick={() => canStart && navigate('/explore')}
            disabled={!canStart}
          >
            {canStart ? 'Start exploring' : `Answer ${4 - answeredCount} more question${4 - answeredCount > 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
