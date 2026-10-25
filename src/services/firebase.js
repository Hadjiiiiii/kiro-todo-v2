import { getApp, getApps, initializeApp } from 'firebase/app';
import { browserLocalPersistence, connectAuthEmulator, getAuth, setPersistence } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Without these values getAuth throws on import and the page stays blank, so report it instead.
export const firebaseConfigured = Object.values(firebaseConfig).every(Boolean);

const app = firebaseConfigured ? (getApps().length ? getApp() : initializeApp(firebaseConfig)) : null;

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;

if (auth) await setPersistence(auth, browserLocalPersistence);

let authEmulatorConnected = false;
let firestoreEmulatorConnected = false;

if (app && import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  if (!authEmulatorConnected) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    authEmulatorConnected = true;
  }
  if (!firestoreEmulatorConnected) {
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    firestoreEmulatorConnected = true;
  }
}
