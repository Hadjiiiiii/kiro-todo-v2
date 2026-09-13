import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase.js';
import * as authService from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [userVersion, setUserVersion] = useState(0);

  useEffect(() => onAuthStateChanged(auth, (user) => {
    setCurrentUser(user);
    setAuthReady(true);
  }), []);

  const signUp = useCallback(async (credentials) => authService.signUp(credentials), []);
  const signIn = useCallback(async (credentials) => authService.signIn(credentials), []);
  const signOut = useCallback(async () => authService.signOut(), []);
  const sendPasswordReset = useCallback(async (email) => authService.sendPasswordReset(email), []);
  const resendVerification = useCallback(async () => authService.resendVerification(currentUser), [currentUser]);

  const refreshUser = useCallback(async () => {
    const result = await authService.refreshUser(currentUser);
    if (result.success) setUserVersion((version) => version + 1);
    return result;
  }, [currentUser]);

  const updateDisplayName = useCallback(async (displayName) => {
    const result = await authService.updateDisplayName(currentUser, displayName);
    if (result.success) setUserVersion((version) => version + 1);
    return result;
  }, [currentUser]);

  const changePassword = useCallback(
    async (passwords) => authService.changePassword(currentUser, passwords),
    [currentUser],
  );

  const value = useMemo(() => ({
    currentUser,
    authReady,
    isAuthenticated: Boolean(currentUser),
    isVerified: Boolean(currentUser?.emailVerified),
    signUp,
    signIn,
    signOut,
    sendPasswordReset,
    resendVerification,
    refreshUser,
    updateDisplayName,
    changePassword,
  }), [
    authReady,
    changePassword,
    currentUser,
    refreshUser,
    resendVerification,
    sendPasswordReset,
    signIn,
    signOut,
    signUp,
    updateDisplayName,
    userVersion,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
