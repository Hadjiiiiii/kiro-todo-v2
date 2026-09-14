import {
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  reauthenticateWithCredential,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updatePassword,
  updateProfile,
} from 'firebase/auth';
import { auth } from './firebase.js';
import { mapAuthError, validatePassword } from './authErrors.js';

const actionCodeSettings = {
  url: import.meta.env.VITE_FIREBASE_CONTINUE_URL || window.location.origin,
  handleCodeInApp: false,
};

const failure = (error) => ({ success: false, error });

export async function signUp({ displayName, email, password }) {
  const name = displayName?.trim();
  const address = email?.trim();
  const passwordError = validatePassword(password);
  if (!name) return failure('Enter your display name.');
  if (!address) return failure('Enter your email address.');
  if (passwordError) return failure(passwordError);
  try {
    const credential = await createUserWithEmailAndPassword(auth, address, password);
    await updateProfile(credential.user, { displayName: name });
    await sendEmailVerification(credential.user, actionCodeSettings);
    return { success: true };
  } catch (error) {
    return failure(mapAuthError(error));
  }
}

export async function signIn({ email, password }) {
  const address = email?.trim();
  if (!address || !password) return failure('Enter your email address and password.');
  try {
    await signInWithEmailAndPassword(auth, address, password);
    return { success: true };
  } catch (error) {
    return failure(mapAuthError(error));
  }
}

export async function signOut() {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    return failure(mapAuthError(error));
  }
}

export async function sendPasswordReset(email) {
  const address = email?.trim();
  if (!address) return failure('Enter your email address.');
  try {
    await sendPasswordResetEmail(auth, address, actionCodeSettings);
    return { success: true };
  } catch {
    // Do not disclose whether an account exists or whether Firebase accepted the request.
    return { success: true };
  }
}

export async function resendVerification(user) {
  if (!user) return failure('Sign in before requesting a verification email.');
  try {
    await sendEmailVerification(user, actionCodeSettings);
    return { success: true };
  } catch (error) {
    return failure(mapAuthError(error));
  }
}

export async function refreshUser(user) {
  if (!user) return failure('Sign in before refreshing your account.');
  try {
    await reload(user);
    await user.getIdToken(true);
    return { success: true };
  } catch (error) {
    return failure(mapAuthError(error));
  }
}

export async function updateDisplayName(user, displayName) {
  const name = displayName?.trim();
  if (!user) return failure('Sign in before updating your profile.');
  if (!name) return failure('Enter your display name.');
  try {
    await updateProfile(user, { displayName: name });
    return { success: true };
  } catch (error) {
    return failure(mapAuthError(error));
  }
}

export async function changePassword(user, { currentPassword, nextPassword }) {
  if (!user?.email) return failure('Sign in before changing your password.');
  const passwordError = validatePassword(nextPassword);
  if (passwordError) return failure(passwordError);
  if (!currentPassword) return failure('Enter your current password.');
  try {
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, nextPassword);
    return { success: true };
  } catch (error) {
    return failure(mapAuthError(error));
  }
}
