# TasKeep

TasKeep is a personal planning app with verified Firebase accounts and private, user-scoped cloud records.

TasKeep keeps your tasks, habits, journal and spending in one place, synced to a private cloud account.

**Live demo:** https://hadjiiiiii-taskeep.vercel.app

![TasKeep demo](docs/demo.gif)

## Features

- Tasks with Kanban, list and calendar views, plus a stats dashboard
- Habit tracking with daily, weekday and custom schedules
- A daily journal with a monthly view
- A simple finance log for income and spending
- A verified email account; each user can only read and write their own records

**Stack:** React 19, Vite, MUI, Firebase Auth + Cloud Firestore, Vercel, Vitest.

**What's interesting here:** per-user Firestore security rules, tested against the Firestore emulator; a one-time import of data from the older browser-only version; and a test-first startup guard and auth error messages, so a broken config shows a readable message instead of a blank page.

## Local setup

Requirements:

- Node.js and npm
- Java 21 to run the local Firestore Emulator
- A Firebase project that you control; never commit genuine secrets

Install dependencies and create your local Firebase configuration:

```bash
npm install
cp .env.example .env.local
```

Set these values in `.env.local` from the Firebase web app configuration for your own project:

```dotenv
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
```

`VITE_USE_FIREBASE_EMULATORS=true` is optional and enables local Auth and Firestore emulator connections during development. `.env.local` keeps project-specific configuration out of this repository. Firebase web configuration identifies the app; it is not a credential. Restrict its API key and protect data with Firestore Rules.

## Firebase Console setup

These are user-controlled steps in the Firebase Console; this repository cannot create the project or configure its security settings for you.

1. Create or select a Firebase project on the Spark plan and register a web app to obtain the values above.
2. In **Firestore Database**, create and confirm a **Standard** Cloud Firestore database.
3. In **Authentication → Sign-in method**, enable the Email/Password provider.
4. Configure Firebase Authentication password policy to require at least 12 characters, uppercase, lowercase, a digit, and a symbol; enforce the policy.
5. Enable email enumeration protection.
6. Add local development and production origins to Authentication’s Authorized domains.
7. Customize the verification and password-reset email templates with the TasKeep name and configure their continue URL for your authorized app URL.
8. Deploy the repository’s Firestore rules before any production use.

The Spark plan’s current quotas are service limits, not a guarantee of capacity, availability, or suitability for every workload. Review Firebase’s current plan and quota information before launch.

## Run and verify

Start the app:

```bash
npm run dev
```

For local Auth and Firestore testing, run the emulators in one terminal and the app in another after setting `VITE_USE_FIREBASE_EMULATORS=true` in `.env.local`:

```bash
npm run emulators
npm run dev
```

The normal test suite deliberately excludes the emulator-only Firestore rules test. Run it separately, or run the complete verification sequence:

```bash
npm run test:run
npm run test:rules
npm run verify
```

## Deploy Firestore rules

After you have authenticated with Firebase CLI and selected your production project, deploy only the Firestore rules:

```bash
npx firebase login
npx firebase use --add
npx firebase deploy --only firestore:rules
```

Manual emulator acceptance still requires a real Firebase project and the corresponding local configuration. Before release, use emulator users to verify email confirmation, account sign-in persistence, per-user data isolation, password reset, account settings, and the optional one-time legacy import. Do not represent that acceptance as completed until it has been run against your own configured project.

## Troubleshooting

- **Blank page or "Firebase configuration is missing" locally:** `.env.local` is missing or incomplete. Copy `.env.example` to `.env.local`, fill in the four `VITE_FIREBASE_*` values and restart `npm run dev`.
- **"TasKeep is misconfigured (invalid Firebase API key)":** the host's `VITE_FIREBASE_API_KEY` is wrong. In Vercel → Settings → Environment Variables, paste the real key (not the masked `AIza…••••` text), then redeploy.
