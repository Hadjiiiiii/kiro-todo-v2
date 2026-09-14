import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from '../context/AuthContext.jsx';

const firebaseMocks = vi.hoisted(() => ({
  credential: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  onAuthStateChanged: vi.fn(),
  reauthenticateWithCredential: vi.fn(),
  reload: vi.fn(),
  sendEmailVerification: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  updatePassword: vi.fn(),
  updateProfile: vi.fn(),
}));

vi.mock('../services/firebase.js', () => ({ auth: { name: 'test-auth' } }));

vi.mock('firebase/auth', () => ({
  EmailAuthProvider: { credential: firebaseMocks.credential },
  createUserWithEmailAndPassword: firebaseMocks.createUserWithEmailAndPassword,
  onAuthStateChanged: firebaseMocks.onAuthStateChanged,
  reauthenticateWithCredential: firebaseMocks.reauthenticateWithCredential,
  reload: firebaseMocks.reload,
  sendEmailVerification: firebaseMocks.sendEmailVerification,
  sendPasswordResetEmail: firebaseMocks.sendPasswordResetEmail,
  signInWithEmailAndPassword: firebaseMocks.signInWithEmailAndPassword,
  signOut: firebaseMocks.signOut,
  updatePassword: firebaseMocks.updatePassword,
  updateProfile: firebaseMocks.updateProfile,
}));

const unverifiedUser = {
  uid: 'ari-id',
  email: 'ari@example.com',
  displayName: 'Ari',
  emailVerified: false,
  getIdToken: vi.fn(),
};

const verifiedUser = {
  uid: 'ari-id',
  email: 'ari@example.com',
  displayName: 'Ari',
  emailVerified: true,
  getIdToken: vi.fn(),
};

let authStateUser;

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authStateUser = null;
    firebaseMocks.onAuthStateChanged.mockImplementation((_auth, listener) => {
      listener(authStateUser);
      return vi.fn();
    });
    firebaseMocks.updateProfile.mockResolvedValue();
    firebaseMocks.sendEmailVerification.mockResolvedValue();
    firebaseMocks.reauthenticateWithCredential.mockResolvedValue();
    firebaseMocks.updatePassword.mockResolvedValue();
    unverifiedUser.getIdToken.mockResolvedValue('fresh-token');
    verifiedUser.getIdToken.mockResolvedValue('fresh-token');
  });

  it('sends verification after sign-up and keeps an authenticated unverified user blocked', async () => {
    authStateUser = unverifiedUser;
    firebaseMocks.createUserWithEmailAndPassword.mockResolvedValue({ user: unverifiedUser });
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.currentUser).toBe(unverifiedUser));

    let signUpResult;
    await act(async () => {
      signUpResult = await result.current.signUp({
        displayName: 'Ari',
        email: 'ari@example.com',
        password: 'Ari!Secure2026',
      });
    });

    expect(signUpResult).toEqual({ success: true });
    expect(firebaseMocks.sendEmailVerification).toHaveBeenCalledWith(unverifiedUser, expect.any(Object));
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isVerified).toBe(false);
  });

  it('keeps password-reset results generic when Firebase cannot find an email', async () => {
    firebaseMocks.sendPasswordResetEmail.mockRejectedValue({ code: 'auth/user-not-found' });
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    let resetResult;
    await act(async () => {
      resetResult = await result.current.sendPasswordReset('missing@example.com');
    });

    expect(resetResult).toEqual({ success: true });
  });

  it('refreshes the ID token after reloading verification state', async () => {
    authStateUser = unverifiedUser;
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.currentUser).toBe(unverifiedUser));

    await act(async () => {
      await result.current.refreshUser();
    });

    expect(firebaseMocks.reload).toHaveBeenCalledWith(unverifiedUser);
    expect(unverifiedUser.getIdToken).toHaveBeenCalledWith(true);
  });

  it('reauthenticates before updating a password', async () => {
    authStateUser = verifiedUser;
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.currentUser).toBe(verifiedUser));
    const credential = { email: 'ari@example.com', password: 'Old!Secure2026' };
    firebaseMocks.credential.mockReturnValue(credential);

    let passwordResult;
    await act(async () => {
      passwordResult = await result.current.changePassword({
        currentPassword: 'Old!Secure2026',
        nextPassword: 'New!Secure2026',
      });
    });

    expect(passwordResult).toEqual({ success: true });
    expect(firebaseMocks.reauthenticateWithCredential).toHaveBeenCalledWith(verifiedUser, credential);
    expect(firebaseMocks.updatePassword).toHaveBeenCalledWith(verifiedUser, 'New!Secure2026');
    expect(firebaseMocks.reauthenticateWithCredential.mock.invocationCallOrder[0])
      .toBeLessThan(firebaseMocks.updatePassword.mock.invocationCallOrder[0]);
  });
});
