import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { setRecord, subscribeCollection } from '../services/cloudDataService.js';

const JournalContext = createContext(null);

export function JournalProvider({ children }) {
  const { currentUser, isVerified } = useAuth();
  const uid = isVerified ? currentUser?.uid : null;
  const [entries, setEntries] = useState({});
  const [ready, setReady] = useState(false);
  const [syncError, setSyncError] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);

  useEffect(() => {
    setEntries({}); setReady(false); setSyncError(false); setLastSavedAt(null);
    if (!uid) return undefined;
    let active = true;
    const unsubscribe = subscribeCollection(uid, 'journal', (records) => {
      if (!active) return;
      setEntries(Object.fromEntries(records.map(({ id, ...entry }) => [id, entry])));
      setReady(true);
    }, () => { if (active) { setSyncError(true); setReady(true); } });
    return () => { active = false; unsubscribe(); };
  }, [uid]);

  const getEntry = useCallback((date) => entries[date] || { dump: '', people: [] }, [entries]);
  const saveEntry = useCallback(async (date, { dump, people }) => {
    try {
      await setRecord(uid, 'journal', date, { dump: dump ?? '', people: people ?? [] });
      setLastSavedAt(Date.now());
      return true;
    } catch {
      setSyncError(true);
      return false;
    }
  }, [uid]);
  const getAllPeople = useCallback(() => Array.from(new Set(Object.values(entries).flatMap((entry) => Array.isArray(entry.people) ? entry.people : []))).sort(), [entries]);
  const getEntriesForPerson = useCallback((name) => Object.entries(entries).filter(([, entry]) => entry.people?.includes(name)).map(([date]) => date).sort().reverse(), [entries]);
  const value = useMemo(() => ({ entries, ready, syncError, storageError: syncError, lastSavedAt, getEntry, saveEntry, getAllPeople, getEntriesForPerson }), [entries, ready, syncError, lastSavedAt, getEntry, saveEntry, getAllPeople, getEntriesForPerson]);
  return <JournalContext.Provider value={value}>{children}</JournalContext.Provider>;
}

export function useJournalContext() {
  const context = useContext(JournalContext);
  if (!context) throw new Error('useJournalContext must be used within a JournalProvider');
  return context;
}
