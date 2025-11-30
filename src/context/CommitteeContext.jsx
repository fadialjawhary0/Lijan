import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const CommitteeContext = createContext();

export const useCommittee = () => useContext(CommitteeContext);

export const CommitteeProvider = ({ children }) => {
  const [selectedCommitteeId, setSelectedCommitteeIdState] = useState(() => localStorage.getItem('selectedCommitteeId'));
  const location = useLocation();

  const setSelectedCommitteeId = id => {
    setSelectedCommitteeIdState(id);
    if (id) {
      localStorage.setItem('selectedCommitteeId', id);
    } else {
      localStorage.removeItem('selectedCommitteeId');
    }
  };

  useEffect(() => {
    const storedId = localStorage.getItem('selectedCommitteeId');

    if (location.pathname === '/' || location.pathname === '/home') {
      if (storedId) {
        setSelectedCommitteeIdState(null);
        localStorage.removeItem('selectedCommitteeId');
      }
    } else {
      if (storedId) {
        setSelectedCommitteeIdState(storedId);
      } else {
        setSelectedCommitteeIdState(null);
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    const onStorage = e => {
      if (e.key === 'selectedCommitteeId') {
        setSelectedCommitteeIdState(e.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return <CommitteeContext.Provider value={{ selectedCommitteeId, setSelectedCommitteeId }}>{children}</CommitteeContext.Provider>;
};
