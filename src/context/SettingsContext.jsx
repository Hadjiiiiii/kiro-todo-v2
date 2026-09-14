import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { setDocument, subscribeDocument } from '../services/cloudDataService.js';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const { currentUser, isVerified } = useAuth();
  const uid = isVerified ? currentUser?.uid : null;
  const [settings, setSettings] = useState({});
  const [ready, setReady] = useState(false);
  const [syncError, setSyncError] = useState(false);
  const settingsRef = useRef(settings);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    setSettings({});
    setReady(false);
    setSyncError(false);

    if (!uid) return undefined;

    return subscribeDocument(
      uid,
      'settings',
      'preferences',
      (value) => {
        setSettings(value || {});
        setReady(true);
      },
      () => {
        setSyncError(true);
        setReady(true);
      },
    );
  }, [uid]);

  const completeOnboarding = useCallback(async () => {
    if (!uid || !ready) return false;

    const nextSettings = { ...settingsRef.current, onboardingCompleted: true };
    try {
      await setDocument(uid, 'settings', 'preferences', nextSettings);
      return true;
    } catch {
      setSyncError(true);
      return false;
    }
  }, [ready, uid]);

  const value = useMemo(() => ({
    settings,
    onboardingCompleted: Boolean(settings.onboardingCompleted),
    ready,
    syncError,
    migration: settings.migration || null,
    completeOnboarding,
  }), [completeOnboarding, ready, settings, syncError]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettingsContext() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettingsContext must be used within a SettingsProvider');
  return context;
}
