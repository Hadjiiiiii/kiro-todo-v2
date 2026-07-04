import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { storageService } from '../services/storageService';

const JournalContext = createContext(null);

export function JournalProvider({ children }) {
  const [entries, setEntries] = useState(() => storageService.getJournal());

  useEffect(() => {
    storageService.saveJournal(entries);
  }, [entries]);

  const getEntry = useCallback((date) => {
    return entries[date] || { dump: '', people: [] };
  }, [entries]);

  const saveEntry = useCallback((date, { dump, people }) => {
    setEntries((prev) => ({
      ...prev,
      [date]: {
        dump: dump ?? '',
        people: people ?? [],
      },
    }));
  }, []);

  const getAllPeople = useCallback(() => {
    const peopleSet = new Set();
    Object.values(entries).forEach((entry) => {
      if (entry.people && Array.isArray(entry.people)) {
        entry.people.forEach((p) => peopleSet.add(p));
      }
    });
    return Array.from(peopleSet).sort();
  }, [entries]);

  const value = useMemo(() => ({
    entries,
    getEntry,
    saveEntry,
    getAllPeople,
  }), [entries, getEntry, saveEntry, getAllPeople]);

  return (
    <JournalContext.Provider value={value}>
      {children}
    </JournalContext.Provider>
  );
}

export function useJournalContext() {
  const context = useContext(JournalContext);
  if (!context) {
    throw new Error('useJournalContext must be used within a JournalProvider');
  }
  return context;
}
