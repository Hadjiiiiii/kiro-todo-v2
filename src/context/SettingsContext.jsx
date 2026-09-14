import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { setDocument, subscribeDocument } from '../services/cloudDataService.js';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const { currentUser, isVerified } = useAuth();
  const uid = isVerified ? currentUser?.uid : null;
  const [settings, setSettings] = useState({});
  const [migration, setMigration] = useState(null);
  const [ready, setReady] = useState(false);
  const [syncError, setSyncError] = useState(false);
  const settingsRef = useRef(settings);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    setSettings({});
    setMigration(null);
    setReady(false);
    setSyncError(false);

    if (!uid) return undefined;

    let active = true;
    let settingsReady = false;
    let migrationReady = false;
    const markReady = () => {
      if (active && settingsReady && migrationReady) setReady(true);
    };
    const fail = () => {
      if (active) setSyncError(true);
    };
    const unsubscribeSettings = subscribeDocument(
      uid,
      'settings',
      'preferences',
      (value) => {
        if (!active) return;
        setSettings(value || {});
        settingsReady = true;
        markReady();
      },
      () => {
        if (!active) return;
        settingsReady = true;
        fail();
        markReady();
      },
    );
    const unsubscribeMigration = subscribeDocument(
      uid,
      'meta',
      'migration',
      (value) => {
        if (!active) return;
        setMigration(value || null);
        migrationReady = true;
        markReady();
      },
      () => {
        if (!active) return;
        migrationReady = true;
        fail();
        markReady();
      },
    );
    return () => {
      active = false;
      unsubscribeSettings();
      unsubscribeMigration();
    };
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

  const refreshMigration = useCallback((value) => {
    if (value && typeof value === 'object') setMigration(value);
  }, []);

  const value = useMemo(() => ({
    settings,
    onboardingCompleted: Boolean(settings.onboardingCompleted),
    ready,
    syncError,
    migration: migration || settings.migration || null,
    completeOnboarding,
    refreshMigration,
  }), [completeOnboarding, migration, ready, refreshMigration, settings, syncError]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettingsContext() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettingsContext must be used within a SettingsProvider');
  return context;
}
