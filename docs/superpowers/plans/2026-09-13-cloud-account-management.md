# Cloud Account Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace local browser accounts with verified Firebase accounts and secure per-user cloud persistence, with optional legacy-data import and account settings.

**Architecture:** Firebase Authentication owns identity, credential storage, password reset, verification, and persistent sessions. Cloud Firestore stores records beneath the authenticated user's `uid`; security rules gate every record on both matching `uid` and verified email. Existing React contexts retain their public UI APIs while moving their hydration, mutations, and errors to a shared Firestore repository.

**Tech Stack:** React 19, Vite 8, Material UI 9, Firebase Web SDK, Cloud Firestore, Firebase Local Emulator Suite, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-09-13-cloud-account-management.md`

## Global Constraints

- Firebase Spark plan only; do not add a billing account or paid Firebase feature.
- Email/password authentication only; no MFA, social sign-in, email change, account deletion, or admin interface.
- Enforce email verification before any Firestore read or write.
- Password policy: minimum 12 characters with lowercase, uppercase, numeric, and non-alphanumeric characters.
- Use Firestore paths rooted at `users/{uid}`; never trust a client-provided user ID for authorization.
- Preserve existing readable browser records; migration is optional and one-time, with batches no larger than 400 writes.
- Keep existing desktop/mobile behavior and existing design tokens.
- Preserve unrelated existing working-tree changes.

---

## File Structure

| Path | Responsibility |
|---|---|
| `src/services/firebase.js` | Initializes Firebase Auth and Firestore; connects emulators in development when enabled. |
| `src/services/authService.js` | Wraps Firebase Auth flows and converts Firebase errors into app errors. |
| `src/services/cloudDataService.js` | Owns Firestore paths, subscriptions, writes, and batch import. |
| `src/services/legacyDataService.js` | Reads current TasKeep local keys without mutating or authenticating them. |
| `src/context/AuthContext.jsx` | Exposes Firebase user/session state and account actions. |
| `src/context/SettingsContext.jsx` | Hydrates and persists application settings plus migration status. |
| `src/context/*Context.jsx` | Hydrates user-scoped records and persists mutations through `cloudDataService`. |
| `src/components/LoginScreen.jsx` | Email/password sign-in, sign-up, and reset request. |
| `src/components/VerifyEmailScreen.jsx` | Blocks app data until user verifies email. |
| `src/components/AccountDialog.jsx` | Profile, verification status, password change, migration entry, sign-out. |
| `src/components/LegacyImportDialog.jsx` | Previews and imports one selected local account. |
| `src/components/Sidebar.jsx`, `src/components/MobileNav.jsx`, `src/App.jsx` | Opens account management from desktop and mobile navigation. |
| `firestore.rules`, `firebase.json` | Production authorization and emulator configuration. |
| `.env.example` | Documents required Vite Firebase variables without secrets. |
| `src/test/*` | Unit, component, and Firestore-rule tests. |

### Task 1: Add Firebase and test foundation

**Files:**
- Create: `.env.example`
- Create: `firebase.json`
- Create: `firestore.rules`
- Create: `vitest.config.js`
- Create: `src/test/setup.js`
- Create: `src/test/firestore.rules.test.js`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Produces `npm run test`, `npm run test:rules`, and `npm run emulators` scripts.
- Produces Firebase configuration variables `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`.

- [ ] **Step 1: Add failing Firestore ownership-rule test**

```js
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc } from 'firebase/firestore';

let testEnv;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'taskeep-test',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  });
});

it('allows only verified owner access', async () => {
  const alice = testEnv.authenticatedContext('alice', { email_verified: true }).firestore();
  const bob = testEnv.authenticatedContext('bob', { email_verified: true }).firestore();
  const unverified = testEnv.authenticatedContext('new-user', { email_verified: false }).firestore();

  await assertSucceeds(setDoc(doc(alice, 'users/alice/tasks/task-1'), { title: 'Private' }));
  await assertFails(getDoc(doc(bob, 'users/alice/tasks/task-1')));
  await assertFails(setDoc(doc(unverified, 'users/new-user/tasks/task-1'), { title: 'Blocked' }));
});
```

- [ ] **Step 2: Run rule test and verify it fails**

Run: `npm run test:rules`

Expected: FAIL because Firebase test dependencies, scripts, and rules do not exist.

- [ ] **Step 3: Add runtime and test dependencies**

Add exact package roles:

```json
{
  "dependencies": { "firebase": "^12.0.0" },
  "devDependencies": {
    "@firebase/rules-unit-testing": "^5.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.0.0",
    "firebase-tools": "^14.0.0",
    "jsdom": "^26.0.0",
    "vitest": "^3.0.0"
  }
}
```

Use `npm install` so `package-lock.json` matches exact resolved versions. Define scripts:

```json
{
  "test": "vitest",
  "test:run": "vitest run",
  "emulators": "firebase emulators:start --only auth,firestore",
  "test:rules": "firebase emulators:exec --only firestore \"vitest run src/test/firestore.rules.test.js\""
}
```

- [ ] **Step 4: Add Firebase rules and emulator files**

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function verifiedOwner(userId) {
      return request.auth != null
        && request.auth.uid == userId
        && request.auth.token.email_verified == true;
    }

    match /users/{userId}/{document=**} {
      allow read, write: if verifiedOwner(userId);
    }
  }
}
```

```json
{
  "firestore": { "rules": "firestore.rules" },
  "emulators": {
    "auth": { "port": 9099 },
    "firestore": { "port": 8080 },
    "ui": { "enabled": true, "port": 4000 }
  }
}
```

Configure Vitest with `environment: 'jsdom'`, `setupFiles: ['./src/test/setup.js']`, and `@testing-library/jest-dom/vitest` setup. Add `.env.example` with empty values only; never commit `.env.local`.

- [ ] **Step 5: Run tests and build**

Run: `npm run test:rules && npm run test:run && npm run build`

Expected: all commands pass; the rules test proves verified owner access and denial paths.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json firebase.json firestore.rules .env.example vitest.config.js src/test
git commit -m "chore: add Firebase test foundation"
```

### Task 2: Replace local authentication with Firebase Auth

**Files:**
- Create: `src/services/firebase.js`
- Create: `src/services/authService.js`
- Create: `src/services/authErrors.js`
- Create: `src/components/VerifyEmailScreen.jsx`
- Create: `src/test/AuthContext.test.jsx`
- Modify: `src/context/AuthContext.jsx`
- Modify: `src/components/LoginScreen.jsx`
- Modify: `src/main.jsx`

**Interfaces:**
- Consumes: Vite Firebase variables and Firebase Auth SDK from Task 1.
- Produces `useAuth()` fields `{ currentUser, authReady, isAuthenticated, isVerified, signUp, signIn, signOut, sendPasswordReset, resendVerification, refreshUser, updateDisplayName, changePassword }`.
- `signUp({ displayName, email, password })`, `signIn({ email, password })`, and `changePassword({ currentPassword, nextPassword })` return `{ success: boolean, error?: string }`.

- [ ] **Step 1: Write failing auth-context tests**

```jsx
it('sends verification after sign-up and exposes no data-ready user', async () => {
  mockCreateUserWithEmailAndPassword.mockResolvedValue({ user: unverifiedUser });
  mockSendEmailVerification.mockResolvedValue();
  const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

  await act(() => result.current.signUp({
    displayName: 'Ari', email: 'ari@example.com', password: 'Ari!Secure2026',
  }));

  expect(mockSendEmailVerification).toHaveBeenCalledWith(unverifiedUser, expect.any(Object));
  expect(result.current.isVerified).toBe(false);
});

it('reauthenticates before updating a password', async () => {
  await act(() => result.current.changePassword({
    currentPassword: 'Old!Secure2026', nextPassword: 'New!Secure2026',
  }));
  expect(mockReauthenticateWithCredential).toHaveBeenCalled();
  expect(mockUpdatePassword).toHaveBeenCalledWith(currentUser, 'New!Secure2026');
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `npm run test:run -- src/test/AuthContext.test.jsx`

Expected: FAIL because Firebase-backed AuthContext and actions do not exist.

- [ ] **Step 3: Initialize Firebase exactly once**

Implement `src/services/firebase.js` with explicit local persistence and development emulator opt-in:

```js
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

await setPersistence(auth, browserLocalPersistence);

if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
}
```

Guard each emulator connection with a module-scoped boolean so React strict-mode reloads do not reconnect it.

- [ ] **Step 4: Implement auth service and context**

Use `onAuthStateChanged` to set `authReady` and Firebase user. Map errors in `authErrors.js` without revealing whether an email exists. Implement:

```js
export async function signUp({ displayName, email, password }) {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await updateProfile(credential.user, { displayName: displayName.trim() });
  await sendEmailVerification(credential.user, actionCodeSettings);
}
```

Use `sendPasswordResetEmail`, `reauthenticateWithCredential`, `updatePassword`, `updateProfile`, `reload`, and `signOut`. Remove `simpleHash`, `taskeep-users`, local session creation, and all local password handling.

- [ ] **Step 5: Replace sign-in UI and verification gate**

Make LoginScreen collect display name only during sign-up, email for all auth actions, and a password-reset link. Show generic success feedback after reset request. Add VerifyEmailScreen with resend, refresh-verification, and sign-out controls. In `main.jsx`, render the app providers only when `authReady && isVerified`; render a neutral loading status before `authReady`.

- [ ] **Step 6: Run tests and build**

Run: `npm run test:run -- src/test/AuthContext.test.jsx && npm run build`

Expected: PASS. The build has no browser-local account hash or account-record calls.

- [ ] **Step 7: Commit**

```bash
git add src/services/firebase.js src/services/authService.js src/services/authErrors.js src/context/AuthContext.jsx src/components/LoginScreen.jsx src/components/VerifyEmailScreen.jsx src/main.jsx src/test/AuthContext.test.jsx
git commit -m "feat: add verified Firebase authentication"
```

### Task 3: Add Firestore repository and move application data to cloud records

**Files:**
- Create: `src/services/cloudDataService.js`
- Create: `src/context/SettingsContext.jsx`
- Create: `src/test/cloudDataService.test.js`
- Create: `src/test/SettingsContext.test.jsx`
- Modify: `src/context/TaskContext.jsx`
- Modify: `src/context/HabitContext.jsx`
- Modify: `src/context/JournalContext.jsx`
- Modify: `src/context/FinanceContext.jsx`
- Modify: `src/App.jsx`
- Modify: `src/main.jsx`

**Interfaces:**
- Consumes: `auth.currentUser.uid`, `db`, Firestore rules, and verified AuthContext from Task 2.
- Produces `cloudDataService.subscribeCollection(uid, collectionName, onRecords, onError)`, `setRecord(uid, collectionName, id, value)`, `removeRecord(uid, collectionName, id)`, `subscribeDocument(uid, collectionName, id, onValue, onError)`, and `setDocument(uid, collectionName, id, value)`.
- SettingsContext exposes `{ settings, ready, syncError, completeOnboarding, migration }`.

- [ ] **Step 1: Write failing repository tests**

```js
it('writes only below the active user path', async () => {
  await cloudDataService.setRecord('alice', 'tasks', 'task-1', { title: 'Pay rent' });
  expect(mockSetDoc).toHaveBeenCalledWith(
    expect.objectContaining({ path: 'users/alice/tasks/task-1' }),
    { title: 'Pay rent' },
  );
});

it('unsubscribes a collection listener', () => {
  const unsubscribe = cloudDataService.subscribeCollection('alice', 'tasks', vi.fn(), vi.fn());
  unsubscribe();
  expect(mockUnsubscribe).toHaveBeenCalledOnce();
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `npm run test:run -- src/test/cloudDataService.test.js src/test/SettingsContext.test.jsx`

Expected: FAIL because repository and settings context do not exist.

- [ ] **Step 3: Implement Firestore path and subscription helpers**

Use fixed collection names only. Build paths internally; callers pass no arbitrary path. Use `onSnapshot` for live hydration and return its unsubscribe function. Sort Firestore results in the same order each existing view expects.

```js
function userCollection(uid, collectionName) {
  return collection(db, 'users', uid, collectionName);
}

export function setRecord(uid, collectionName, id, value) {
  return setDoc(doc(userCollection(uid, collectionName), id), value);
}
```

- [ ] **Step 4: Refactor contexts one record type at a time**

For each provider, begin with an empty state, subscribe after a verified user exists, and unsubscribe when `uid` changes or the provider unmounts. Preserve current context method names and view-facing shapes.

| Context | Firestore mapping | Mutation rule |
|---|---|---|
| TaskContext | `tasks/{taskId}`, `categories/current` | Use `setRecord` for task changes; write category array to `categories/current`. Preserve recurring-task creation as two record writes. |
| HabitContext | `habits/{habitId}`, `habitCompletions/{habitId}_{date}` | Create/delete completion document on toggle; delete matching completions when habit deletes. |
| JournalContext | `journal/{YYYY-MM-DD}` | Write only changed date entry. |
| FinanceContext | `finance/{transactionId}` | Create/delete one transaction document. |
| SettingsContext | `settings/preferences` | Persist `onboardingCompleted` and later migration state. |

Each provider exposes `ready` and `syncError`. Disable or show an app-level loading status until all providers are ready. Do not write empty initial state before first snapshot completes.

- [ ] **Step 5: Remove primary-app dependence on `storageService`**

In App, replace `storageService` onboarding and unreadable-record paths with SettingsContext and provider `syncError` state. Keep `storageService` temporarily for Task 4 migration only. In `main.jsx`, place SettingsProvider inside verified AuthGate and above App.

- [ ] **Step 6: Run tests and emulator checks**

Run: `npm run test:run && npm run test:rules && npm run build`

Expected: PASS. A verified emulator user sees only their own data; unverified and different-uid attempts fail.

- [ ] **Step 7: Commit**

```bash
git add src/services/cloudDataService.js src/context src/App.jsx src/main.jsx src/test/cloudDataService.test.js src/test/SettingsContext.test.jsx
git commit -m "feat: persist TasKeep records in Firestore"
```

### Task 4: Build optional one-time legacy import

**Files:**
- Create: `src/services/legacyDataService.js`
- Create: `src/components/LegacyImportDialog.jsx`
- Create: `src/test/legacyDataService.test.js`
- Create: `src/test/LegacyImportDialog.test.jsx`
- Modify: `src/services/cloudDataService.js`
- Modify: `src/context/SettingsContext.jsx`

**Interfaces:**
- Consumes: legacy `taskeep-users`, `taskeep-session`, and `username:<record>` browser keys; verified `uid`; Firestore repository.
- Produces `legacyDataService.listAccounts()`, `readSnapshot(username)`, `getSummary(snapshot)`, and `cloudDataService.importLegacySnapshot(uid, snapshot)`.
- `importLegacySnapshot` resolves `{ counts, importedAt }` and writes `users/{uid}/meta/migration` only after every batch succeeds.

- [ ] **Step 1: Write failing migration tests**

```js
it('reads records without changing localStorage', () => {
  localStorage.setItem('old-user:tasks', JSON.stringify([{ id: 'task-1', title: 'Keep me' }]));
  const snapshot = legacyDataService.readSnapshot('old-user');
  expect(snapshot.tasks).toHaveLength(1);
  expect(localStorage.getItem('old-user:tasks')).not.toBeNull();
});

it('splits import writes into batches of at most 400', async () => {
  await cloudDataService.importLegacySnapshot('new-user', snapshotWith(401, 'tasks'));
  expect(mockCommit).toHaveBeenCalledTimes(2);
  expect(mockBatchSize).toHaveBeenNthCalledWith(1, 400);
  expect(mockBatchSize).toHaveBeenNthCalledWith(2, 1);
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `npm run test:run -- src/test/legacyDataService.test.js src/test/LegacyImportDialog.test.jsx`

Expected: FAIL because the migration service and dialog do not exist.

- [ ] **Step 3: Implement read-only legacy extraction**

Read and validate each old JSON key with the existing record validation rules. Return only records that parse to expected array/object shapes. Never read or compare legacy password hashes. Derive available user names from `taskeep-users` and preselect `taskeep-session.username` when present.

- [ ] **Step 4: Implement idempotent Firestore import**

Map snapshot records to the Task 3 paths. Use deterministic IDs already present in records; for habit completion use `${habitId}_${date}`. Chunk `writeBatch` operations at 400 writes. Write `meta/migration` last with source username, imported counts, and timestamp. If a batch fails, surface the error and do not write the marker; keep local data untouched.

- [ ] **Step 5: Implement import dialog**

Display source-account selector, per-section counts, warning that data remains in browser, Cancel, and Import. Disable duplicate import once `migration.completedAt` exists. On success, close dialog and let existing live Firestore subscriptions update views.

- [ ] **Step 6: Run tests and build**

Run: `npm run test:run -- src/test/legacyDataService.test.js src/test/LegacyImportDialog.test.jsx && npm run build`

Expected: PASS. Import does not remove any local key and batches stay at 400 writes or fewer.

- [ ] **Step 7: Commit**

```bash
git add src/services/legacyDataService.js src/services/cloudDataService.js src/components/LegacyImportDialog.jsx src/context/SettingsContext.jsx src/test/legacyDataService.test.js src/test/LegacyImportDialog.test.jsx
git commit -m "feat: import legacy browser records once"
```

### Task 5: Add account-management UI on desktop and mobile

**Files:**
- Create: `src/components/AccountDialog.jsx`
- Create: `src/test/AccountDialog.test.jsx`
- Modify: `src/components/Sidebar.jsx`
- Modify: `src/components/MobileNav.jsx`
- Modify: `src/App.jsx`
- Modify: `src/components/LoginScreen.jsx`

**Interfaces:**
- Consumes: AuthContext actions from Task 2, migration status from SettingsContext, LegacyImportDialog from Task 4.
- Produces `AccountDialog({ open, onClose })` and `onOpenAccount` navigation callbacks.

- [ ] **Step 1: Write failing account-dialog tests**

```jsx
it('shows verification status and resends verification', async () => {
  render(<AccountDialog open onClose={vi.fn()} />, { wrapper: authenticatedWrapper({ emailVerified: false }) });
  await userEvent.click(screen.getByRole('button', { name: 'Resend verification' }));
  expect(mockResendVerification).toHaveBeenCalledOnce();
});

it('requires current password and matching confirmation before change', async () => {
  render(<AccountDialog open onClose={vi.fn()} />, { wrapper: authenticatedWrapper() });
  await userEvent.click(screen.getByRole('button', { name: 'Update password' }));
  expect(screen.getByText('Current password is required')).toBeVisible();
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `npm run test:run -- src/test/AccountDialog.test.jsx`

Expected: FAIL because AccountDialog and navigation entry points do not exist.

- [ ] **Step 3: Implement AccountDialog**

Use existing MUI dialog, theme tokens, 44px controls, and alert styling. Include:

```text
Profile: display-name field + Save profile button
Email: read-only address + Verified or Verify email status
Security: current password, new password, confirm password + Update password
Data: Import browser records button when migration is incomplete
Session: Sign out button
```

Validate display name non-empty and 64 characters or fewer. Validate password confirmation locally; Firebase Console policy remains authoritative. Keep email read-only and omit destructive controls.

- [ ] **Step 4: Wire navigation entry points**

In App, own `accountDialogOpen` and pass `onOpenAccount` to Sidebar and MobileNav. Make desktop user avatar/name footer a button with account label, retaining separate Sign out. Add Account as a More-sheet item on mobile, then close sheet and open dialog. Keep current view selection unchanged.

- [ ] **Step 5: Update auth copy**

Replace local-only promises in LoginScreen with cloud-storage and verification language. Do not imply end-to-end encryption or device-level protection. Explain password reset sends a link to the entered email without revealing account existence.

- [ ] **Step 6: Run tests and build**

Run: `npm run test:run -- src/test/AccountDialog.test.jsx && npm run build`

Expected: PASS. Desktop and mobile expose account settings; no deletion or MFA control appears.

- [ ] **Step 7: Commit**

```bash
git add src/components/AccountDialog.jsx src/components/Sidebar.jsx src/components/MobileNav.jsx src/components/LoginScreen.jsx src/App.jsx src/test/AccountDialog.test.jsx
git commit -m "feat: add account management controls"
```

### Task 6: Document setup, update product truth, and run release verification

**Files:**
- Modify: `README.md`
- Modify: `PRODUCT.md`
- Modify: `docs/superpowers/specs/2026-09-13-cloud-account-management.md`
- Modify: `package.json`

**Interfaces:**
- Consumes: implementation from Tasks 1–5 and Firebase Console values.
- Produces deployable setup instructions and an automated final verification command.

- [ ] **Step 1: Add failing documentation-check test**

```js
it('documents every required Firebase environment variable', () => {
  const readme = readFileSync('README.md', 'utf8');
  expect(readme).toContain('VITE_FIREBASE_API_KEY');
  expect(readme).toContain('VITE_FIREBASE_AUTH_DOMAIN');
  expect(readme).toContain('VITE_FIREBASE_PROJECT_ID');
  expect(readme).toContain('VITE_FIREBASE_APP_ID');
});
```

- [ ] **Step 2: Run test and verify failure**

Run: `npm run test:run -- src/test/documentation.test.js`

Expected: FAIL because README documents only the Vite template.

- [ ] **Step 3: Document exact setup and security steps**

Replace template README with install, `.env.local` creation from `.env.example`, Firebase Console setup from the spec, emulator commands, test commands, and deployment prerequisite to deploy `firestore.rules`. State Spark free limits as limits, not guarantees. Update PRODUCT.md from local-first/browser-only claims to Firebase-backed private personal records; preserve all other confirmed product truth.

- [ ] **Step 4: Add final verification command**

Add:

```json
{
  "verify": "npm run test:run && npm run test:rules && npm run build"
}
```

- [ ] **Step 5: Run full verification**

Run: `npm run verify`

Expected: component tests, repository tests, Firestore rule tests, and production build pass.

- [ ] **Step 6: Perform manual emulator acceptance pass**

Run: `npm run emulators` in one terminal and `VITE_USE_FIREBASE_EMULATORS=true npm run dev` in another.

Verify in browser:

```text
1. Sign up with a compliant password.
2. Confirm VerifyEmailScreen blocks the app before verification.
3. Open emulator verification URL, refresh verification, and enter app.
4. Create one task; sign out; sign in again; confirm task returns.
5. Sign in as second emulator user; confirm first user's task is absent.
6. Request reset from login; use emulator URL; sign in with new password.
7. Open Account from desktop and mobile; update display name.
8. Import a legacy snapshot; confirm cloud records appear and local keys still exist.
```

- [ ] **Step 7: Commit**

```bash
git add README.md PRODUCT.md package.json src/test/documentation.test.js docs/superpowers/specs/2026-09-13-cloud-account-management.md
git commit -m "docs: document Firebase account setup"
```

## Self-Review

- Spec coverage: Tasks 1–2 cover verified identity, session persistence, reset, password policy configuration, and auth error handling. Task 3 covers per-user cloud data and authorization. Task 4 covers optional safe migration. Task 5 covers desktop/mobile account management. Task 6 covers product truth, setup, and full acceptance verification.
- Placeholder scan: no unresolved implementation placeholders remain.
- Type consistency: all cloud record operations use `(uid, collectionName, id, value)`; AuthContext action names match account UI consumers; SettingsContext is the sole owner of onboarding and migration metadata.
