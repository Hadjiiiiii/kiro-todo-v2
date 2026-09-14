# Cloud Account Management Specification

## Goal

Replace browser-only account separation and data storage with verified, cloud-backed Firebase accounts and per-user Firestore data.

## Decisions

- Platform: Firebase Spark plan, using Firebase Authentication and Cloud Firestore.
- Identity: email/password, persistent browser session, verified email before data access.
- Profile: editable display name, shown in desktop sidebar and mobile account entry.
- Security: Firebase-managed password storage; password policy enforced in Firebase Console; password reset; re-authentication before password change; Firestore rules require matching authenticated, verified `uid`.
- Account management: display name update, verification resend/status, password change, sign-out. No MFA, admin tools, email change, or account deletion.
- Data: tasks, categories, habits, habit completions, journal entries, finance transactions, and settings persist under `users/{uid}` in Firestore.
- Migration: optional, one-time import of readable current-browser records. Process at most 400 Firestore writes per batch; preserve local records after import.
- Cost: remain within Firebase Spark free services. Spark quotas are service limits, not guarantees of capacity, availability, or suitability for every workload.

## Data Model

```
users/{uid}/tasks/{taskId}
users/{uid}/categories/current
users/{uid}/habits/{habitId}
users/{uid}/habitCompletions/{habitId}_{YYYY-MM-DD}
users/{uid}/journal/{YYYY-MM-DD}
users/{uid}/finance/{transactionId}
users/{uid}/settings/preferences
users/{uid}/meta/migration
```

## Acceptance Criteria

- New accounts use email and password, receive a verification email, and cannot read or write Firestore data until verified.
- Existing accounts survive reload and a second browser/device sign-in.
- Firestore rules deny unauthenticated, unverified, and cross-user access.
- Password reset works from sign-in; password change requires current password and confirmation.
- Account settings opens from desktop sidebar and mobile navigation.
- A legacy user can import readable browser data once, see result counts, and keep local records unchanged.
- Tests run against Firebase emulators; production build succeeds.

## Required Console Configuration

1. Create a Firebase project on the Spark plan and register a web app. Keep the resulting local configuration in `.env.local`, never in source control.
2. In Firestore Database, create and confirm a Standard Cloud Firestore database.
3. Enable the Authentication Email/Password provider.
4. Set and enforce a password policy: minimum 12 characters; require lowercase, uppercase, number, and non-alphanumeric character.
5. Enable email enumeration protection.
6. Add development and production origins to Authorized domains.
7. Customize verification and reset email templates with TasKeep name and a configured continue URL.
8. After `firebase login` and production project selection, deploy `firestore.rules` with `npx firebase deploy --only firestore:rules` before production use.

## Local Emulator and Manual Acceptance

Java 21 is required for the local Firestore Emulator. Run `npm run emulators` and set `VITE_USE_FIREBASE_EMULATORS=true` in local configuration before starting the development server. The emulator acceptance flow needs a real Firebase project and local configuration owned by the user; it is a follow-up validation, not evidence that a repository-only run has completed it.

## Out of Scope

- MFA, social sign-in, account deletion, admin users, paid Firebase services, offline-first conflict resolution, and email-address changes.
