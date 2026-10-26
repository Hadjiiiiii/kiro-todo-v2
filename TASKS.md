# TASKS
Format: ≤1 h each, 3–6 steps, done-criteria. Status: ⬜ ready · 🔒 claimed (<tool>, <worktree>) · ✅ done

## T1 ✅ Ship the Firebase version on Vercel, test first (~40 min)
Seam under test: app startup with missing Firebase config (src/services/firebase.js and what main.jsx renders). Agree this seam before writing the test.
- [x] 1. **Red:** add a test that renders the app entry with no VITE_FIREBASE_* values and expects a readable "Firebase config missing, see README" message instead of a thrown error. Run `npm run test:run`, confirm it fails.
- [x] 2. **Green:** guard firebase.js so missing config is reported, not thrown on import; render the message. Test passes. Commit `wip(T1): step 2/5 config guard`.
- [x] 3. 🧑 Create `.env.local` from `.env.example` with your Firebase web values; `npm run dev` loads the login screen on localhost.
- [x] 4. 🧑 Vercel → Project → Settings → Environment Variables: add the four VITE_FIREBASE_* values (Production and Preview). Firebase → Authentication → Settings → Authorized domains: add the vercel.app domain. Set the verification email continue URL to the Vercel URL.
- [x] 5. `npx firebase login`, `npx firebase use <project>`, `npx firebase deploy --only firestore:rules`.
Done when: localhost shows the login screen, Vercel has the four variables, and the Firestore rules are deployed. (The live check happens after the push in T3.)

## T2 ✅ README pitch + GIF (~40 min)
Seam under test: `README.md`, through the existing `documentation.test.js`.
- [x] 1. **Red:** extend `documentation.test.js` to expect the live URL and a `docs/demo.gif` image link. Confirm it fails.
- [x] 2. Record a 15–25 s GIF on the live site with a **demo account and fake data**: sign in → Kanban drag → switch to calendar → habit tick → finance entry. Save as `docs/demo.gif` (keep it under ~5 MB).
- [x] 3. Add to the top of README, above Local setup: one-line pitch, **Live demo** link, the GIF, a 5-bullet feature list (tasks with Kanban/list/calendar, habits, journal, finance, stats), Stack line, and a "What's interesting here" line (e.g. per-user Firestore rules tested against the emulator, one-time legacy localStorage import).
- [x] 4. Test goes green. Update the stale lines in `steering/tech.md` and `steering/structure.md` (Firebase, not localStorage). Commit.
Done when: `npm run test:run` passes and the GitHub-rendered README shows the GIF above the fold.

## T3 ✅ Push to GitHub (~20 min)
- [x] 1. Secret check: `git status` and `git ls-files | grep -Ei 'env|log'` show only `.env.example`. (`.env.local` and `firestore-debug.log` are already covered by `*.local` and `*.log` in `.gitignore`.)
- [x] 2. Tidy root: move `task-6-report.md` into `docs/`. Drop `dist/` from the tree if it's tracked.
- [x] 3. `npm run test:run && npm run build`, both green. Squash the `wip(T*)` commits into clean ones.
- [x] 4. `git push -u origin main`.
- [x] 5. 🧑 On GitHub: set the repo **Website** to the Vercel URL, add a description and topics (`react`, `firebase`, `vite`, `productivity`). Leave public/private as it is until Day 6 pinning.
Done when: the push triggers a Vercel deploy; on the Vercel URL in a private window: sign up → verify → sign in → add a task → refresh and it's still there; a second account can't see it. GitHub repo Website field points to the Vercel URL.

Open notes (from T1):
- Test user `sudais.h.amerol+taskeeptest@gmail.com` was created on localhost while debugging; delete it in Firebase → Authentication → Users.
- Sign-up from the owner's own browser failed with `auth/network-request-failed` (works from a clean browser). Suspects: ProtonVPN NetShield, Edge tracking prevention. Resolve before the live check.
- Firestore database location is `nam5` (US), fixed.

## T5 🔒 CI + badge (~30 min) · `tdd` then `code-review` (done locally; waiting on push + green run)
- [x] 1. **Red:** extend `src/test/documentation.test.js` to expect the CI badge URL. Confirm it fails.
- [x] 2. Add `.github/workflows/ci.yml`: push/PR to `main`, Node 22, `npm ci`, `npm run test:run`, `npm run build`. Optional `test:rules` job with Java 21. No secrets.
- [x] 3. Add the badge to the top of README. Green locally, `code-review`, commit. Push after the user says so.
Done when: the Actions run is green and the badge shows "passing".

## T6 🔒 TasKeep tidy-up (~20 min) (steps 2–4 done by Claude Code; step 1 is the user's)
- [ ] 1. 🧑 Firebase → Authentication → Users: delete the `+taskeeptest` user.
- [x] 2. `auth/network-request-failed` in the owner's browser: `diagnosing-bugs`. Write the cause in the open notes.
- [x] 3. Move `_templates/DAY5.md` to `Kiro/_templates/DAY5.md` and remove the stray untracked `_templates/` folder.
- [x] 4. Stretch: code-split the >500 kB chunk (`React.lazy` per view). Skipped: views are already `React.lazy`. The 564 kB (164 kB gzip) chunk is the Firebase SDK (app + auth + Firestore), loaded on the login screen. Shrinking it means loading Firestore only after sign-in, which touches every context; park it as its own ticket.
Done when: `git status` is clean.

Open notes (from T6, 2026-10-26):
- `auth/network-request-failed` is not a config or code bug. Checked from this Mac: the live bundle's API key is valid (Identity Toolkit answers `INVALID_ID_TOKEN` to a dummy token, not `API_KEY_INVALID`), CORS allows the vercel.app origin, and DNS resolves `identitytoolkit.googleapis.com`. A throwaway Chrome and Edge profile on the live site both reach Identity Toolkit. Blocking that one host (`--host-resolver-rules=MAP identitytoolkit.googleapis.com 0.0.0.0`) gives `TypeError: Failed to fetch`, which the Firebase SDK reports as exactly `auth/network-request-failed`.
- Cause: something in the owner's own browser path blocks `identitytoolkit.googleapis.com`. ProtonVPN was not running during the check, so the prime suspect is NetShield's DNS blocklist (it only applies while the VPN is on), then Edge tracking prevention on Strict, then an extension. To confirm: reproduce with the VPN on, then turn NetShield off and retry; if it still fails, set Edge tracking prevention to Balanced for the site. Fix on the user side: allowlist `identitytoolkit.googleapis.com` and `securetoken.googleapis.com` (and `firestore.googleapis.com`).
- No code change, so no regression test: the failing seam is the network outside the app.
