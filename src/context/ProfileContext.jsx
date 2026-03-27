import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { matchProfile } from '../data/questionnaire';

const ProfileContext = createContext({
  domain: null,
  alpha: null,
  beta: null,
  h: null,
  omega: null,
  profileId: null,
  setAnswer: () => {},
});

export function ProfileProvider({ children }) {
  const [answers, setAnswers] = useState({
    domain: null,
    alpha: null,
    beta: null,
    h: null,
    omega: null,
  });

  const setAnswer = useCallback((key, value) => {
    setAnswers((prev) => {
      const next = { ...prev, [key]: value };
      return next;
    });
  }, []);

  const profileId = useMemo(() => {
    const { domain, alpha, beta, h } = answers;
    if (domain == null && alpha == null && beta == null && h == null) return null;
    return matchProfile(answers);
  }, [answers]);

  const value = useMemo(
    () => ({ ...answers, profileId, setAnswer }),
    [answers, profileId, setAnswer]
  );

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}

export default ProfileContext;
