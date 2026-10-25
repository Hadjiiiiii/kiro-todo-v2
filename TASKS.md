# TASKS
Format: ≤1 h each, 3–6 steps, done-criteria. Status: ⬜ ready · 🔒 claimed (<tool>, <worktree>) · ✅ done

## T1 ⬜ Deploy to Firebase Hosting, test first (~40 min)
Seam under test: the `firebase.json` hosting config (the public contract the deploy reads). Agree this seam before writing the test.
- [ ] 1. **Red:** add a test (e.g. `src/test/hosting.config.test.js`) that reads `firebase.json` and expects `hosting.public === "dist"` and a `**` → `/index.html` rewrite. Run `npm run test:run`, confirm it fails.
- [ ] 2. **Green:** add the `hosting` block to `firebase.json` (`public: "dist"`, `ignore` firebase.json/dotfiles/node_modules, SPA rewrite). Test passes. Commit `wip(T1): step 2/5 hosting config`.
- [ ] 3. 🧑 In Firebase Console, check your real `.env.local` values exist, then `npx firebase login` and `npx firebase use <project>`.
- [ ] 4. `npm run build && npx firebase deploy --only hosting,firestore:rules`. Copy the `https://<project>.web.app` URL.
- [ ] 5. 🧑 Add `<project>.web.app` and `<project>.firebaseapp.com` to **Authentication → Settings → Authorized domains**, and set the verification email continue URL to the live URL.
Done when, on the live URL in a private window: sign up → verification email arrives → sign in → add a task → refresh and it's still there. Second account can't see the first account's task.

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
- [ ] 5. 🧑 On GitHub: set the repo **Website** to the live URL, add a description and topics (`react`, `firebase`, `vite`, `productivity`). Leave public/private as it is until Day 6 pinning.
Done when: the GitHub page shows the README with the GIF and the website link opens the live app.

