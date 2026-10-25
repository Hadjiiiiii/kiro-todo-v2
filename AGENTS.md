# AGENTS.md: kiro-todo-v2 (TasKeep)
Shared rules for Codex, Claude Code (via CLAUDE.md) and Antigravity (via GEMINI.md). Plan: _templates/PLAN.md.
Use the handoff protocol below when switching tools.

## Stack
- React 19 + Vite 8 (JS/JSX, ES modules), MUI 9
- Firebase Auth (email/password) + Cloud Firestore with user-scoped rules
- Vercel hosting; Firebase for auth + Firestore
- Vitest + Testing Library

## Commands
- Install: `npm install` · Dev: `npm run dev` · Test: `npm run test:run` (rules test: `npm run test:rules`, needs Java 21 + emulator) · Lint: `npx oxlint` · Build: `npm run build` · Full check: `npm run verify`

## Rules
- Secrets live in `.env.local` (never commit, never paste values here). See `.env.example`.
- Don't push or deploy unless the ticket says so.
- Product name is TasKeep in all user-facing text; kiro-todo-v2 is only the repo name.

## Gotchas
- Vite bakes VITE_FIREBASE_* into the bundle at build time, so build with .env.local present.
- Java 21+ is required for the Firestore emulator (npm run test:rules).

## Handoff protocol
1. Tickets are small: ≤ ~1 h of agent work, 3–6 numbered steps in TASKS.md. Bigger? Split it before starting.
2. Checkpoint after EVERY step: tick its box in TASKS.md, rewrite HANDOFF.md,
   `git commit -m "wip(T<n>): step <k>/<N> <what>"`.
3. `handoff` keyword: when the user types `handoff`, stop, write HANDOFF.md, commit.
   Reply with this handoff resume prompt:
   > Read AGENTS.md, TASKS.md and HANDOFF.md, then run `git log --oneline -8` and `git status`. Continue ticket T<n> from the first unchecked step. Don't redo checked steps. Keep checkpointing per AGENTS.md.
4. One tool per ticket. Parallel tools work on different tickets, each in its own worktree.
5. Finishing: squash the wip commits into one clean commit, reset HANDOFF.md to the empty template, mark the ticket ✅.
