# TASKS
Format: ≤1 h each, 3–6 steps, done-criteria. Status: ⬜ ready · 🔒 claimed (<tool>, <worktree>) · ✅ done

## T1 ⬜ Ship the Firebase version on Vercel, test first (~40 min)
Seam under test: app startup with missing Firebase config (src/services/firebase.js and what main.jsx renders). Agree this seam before writing the test.
- [ ] 1. **Red:** add a test that renders the app entry with no VITE_FIREBASE_* values and expects a readable "Firebase config missing, see README" message instead of a thrown error. Run `npm run test:run`, confirm it fails.
- [ ] 2. **Green:** guard firebase.js so missing config is reported, not thrown on import; render the message. Test passes. Commit `wip(T1): step 2/5 config guard`.
- [ ] 3. 🧑 Create `.env.local` from `.env.example` with your Firebase web values; `npm run dev` loads the login screen on localhost.
- [ ] 4. 🧑 Vercel → Project → Settings → Environment Variables: add the four VITE_FIREBASE_* values (Production and Preview). Firebase → Authentication → Settings → Authorized domains: add the vercel.app domain. Set the verification email continue URL to the Vercel URL.
- [ ] 5. `npx firebase login`, `npx firebase use <project>`, `npx firebase deploy --only firestore:rules`.
Done when: localhost shows the login screen, Vercel has the four variables, and the Firestore rules are deployed. (The live check happens after the push in T3.)

## T2 ⬜ README pitch + GIF (~40 min)
Seam under test: `README.md`, through the existing `documentation.test.js`.
- [ ] 1. **Red:** extend `documentation.test.js` to expect the live URL and a `docs/demo.gif` image link. Confirm it fails.
- [ ] 2. Record a 15–25 s GIF on the live site with a **demo account and fake data**: sign in → Kanban drag → switch to calendar → habit tick → finance entry. Save as `docs/demo.gif` (keep it under ~5 MB).
- [ ] 3. Add to the top of README, above Local setup: one-line pitch, **Live demo** link, the GIF, a 5-bullet feature list (tasks with Kanban/list/calendar, habits, journal, finance, stats), Stack line, and a "What's interesting here" line (e.g. per-user Firestore rules tested against the emulator, one-time legacy localStorage import).
- [ ] 4. Test goes green. Update the stale lines in `steering/tech.md` and `steering/structure.md` (Firebase, not localStorage). Commit.
Done when: `npm run test:run` passes and the GitHub-rendered README shows the GIF above the fold.

## T3 ⬜ Push to GitHub (~20 min)
- [ ] 1. Secret check: `git status` and `git ls-files | grep -Ei 'env|log'` show only `.env.example`. (`.env.local` and `firestore-debug.log` are already covered by `*.local` and `*.log` in `.gitignore`.)
- [ ] 2. Tidy root: move `task-6-report.md` into `docs/`. Drop `dist/` from the tree if it's tracked.
- [ ] 3. `npm run test:run && npm run build`, both green. Squash the `wip(T*)` commits into clean ones.
- [ ] 4. `git push -u origin main`.
- [ ] 5. 🧑 On GitHub: set the repo **Website** to the Vercel URL, add a description and topics (`react`, `firebase`, `vite`, `productivity`). Leave public/private as it is until Day 6 pinning.
Done when: the push triggers a Vercel deploy; on the Vercel URL in a private window: sign up → verify → sign in → add a task → refresh and it's still there; a second account can't see it. GitHub repo Website field points to the Vercel URL.

