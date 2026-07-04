import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const AuthContext = createContext(null);

const USERS_KEY = 'taskeep-users';
const SESSION_KEY = 'taskeep-session';

/**
 * Simple hash for passwords (not cryptographically secure, but adequate
 * for local-only storage where the threat model is just account separation).
 */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

function getUsers() {
  try {
    const data = localStorage.getItem(USERS_KEY);
    if (!data) return {};
    return JSON.parse(data);
  } catch {
    return {};
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSession() {
  try {
    const data = localStorage.getItem(SESSION_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch {
    return null;
  }
}

function saveSession(user) {
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => getSession());

  /**
   * Sign up a new account.
   * Returns { success: true } or { success: false, error: "..." }
   */
  const signup = useCallback((username, password) => {
    const trimmed = username.trim().toLowerCase();
    if (!trimmed) return { success: false, error: 'Username is required' };
    if (trimmed.length < 2) return { success: false, error: 'Username must be at least 2 characters' };
    if (!password) return { success: false, error: 'Password is required' };
    if (password.length < 4) return { success: false, error: 'Password must be at least 4 characters' };

    const users = getUsers();
    if (users[trimmed]) {
      return { success: false, error: 'Account already exists' };
    }

    users[trimmed] = {
      username: trimmed,
      passwordHash: simpleHash(password),
      createdAt: new Date().toISOString(),
    };
    saveUsers(users);

    const session = { username: trimmed };
    setCurrentUser(session);
    saveSession(session);
    return { success: true };
  }, []);

  /**
   * Log in to an existing account.
   */
  const login = useCallback((username, password) => {
    const trimmed = username.trim().toLowerCase();
    if (!trimmed) return { success: false, error: 'Username is required' };
    if (!password) return { success: false, error: 'Password is required' };

    const users = getUsers();
    const user = users[trimmed];
    if (!user) {
      return { success: false, error: 'Account not found' };
    }
    if (user.passwordHash !== simpleHash(password)) {
      return { success: false, error: 'Incorrect password' };
    }

    const session = { username: trimmed };
    setCurrentUser(session);
    saveSession(session);
    return { success: true };
  }, []);

  /**
   * Log out the current user.
   */
  const logout = useCallback(() => {
    setCurrentUser(null);
    saveSession(null);
  }, []);

  const value = useMemo(() => ({
    currentUser,
    isAuthenticated: !!currentUser,
    login,
    signup,
    logout,
  }), [currentUser, login, signup, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
