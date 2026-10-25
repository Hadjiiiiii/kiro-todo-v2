# Technology Stack

## Core Framework

- **React** v19.2.7 — UI library
- **Vite** v8.1.3 — Build tool and dev server with HMR
- **@vitejs/plugin-react** v6.0.3 — React support via Oxc

## UI Library

- **MUI (Material UI)** v9.2.0 — Component library (`@mui/material`, `@mui/icons-material`)
- **@mui/x-date-pickers** v9.8.0 — Date/time picker components
- **@emotion/react** v11.14.0 + **@emotion/styled** v11.14.1 — CSS-in-JS styling engine for MUI

## Drag & Drop

- **@dnd-kit/core** v6.3.1 — Drag and drop primitives
- **@dnd-kit/sortable** v10.0.0 — Sortable list utilities
- **@dnd-kit/utilities** v3.2.2 — Shared utilities

## Date Handling

- **dayjs** v1.11.21 — Lightweight date library (with plugins like `isSameOrBefore`)

## Linting

- **Oxlint** — Configured via `.oxlintrc.json`

## Build & Dev Scripts

- `npm run dev` — Start Vite dev server
- `npm run build` — Production build
- `npm run preview` — Preview production build locally
- `npm run postinstall` — Patches Rollup (uses `@rollup/wasm-node`)

## Data Storage

- **Cloud Firestore** — Records live under `users/{uid}/…`, readable and writable only by that verified user (`firestore.rules`)
- **Firebase Auth** — Email/password accounts with email verification
- `legacyDataService` offers a one-time import of data from the older localStorage-only version
- Hosted on **Vercel**; Firebase config comes from `VITE_FIREBASE_*` env vars (`.env.local` locally)

## Module Format

- ES Modules (`"type": "module"` in package.json)
- `.jsx` file extensions for React components
