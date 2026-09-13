# Task 1: Firebase and test foundation report

## Commit

`dda289f chore: add firebase test foundation`

The commit contains only Task 1 paths. Pre-existing removals of
`@types/react` and `@types/react-dom` in `package.json` and
`package-lock.json` were deliberately left unstaged.

## TDD evidence

1. Added `src/test/firestore.rules.test.js` before adding Firebase rules,
   emulator configuration, test scripts, or Vitest configuration. The test
   verifies that a verified owner may write `users/alice/tasks/task-1`, a
   second verified user cannot read it, and an unverified user cannot write
   their own task.
2. RED command: `npm run test:rules`
3. RED result: npm reported `Missing script: "test:rules"`, as expected
   before the test tooling was added.
4. Added the minimal Firebase, emulator, rules, and Vitest configuration.

## Follow-up assertion fix

The first emulator-backed run with JDK 21 reached the test and exposed a
rules-unit-testing API mismatch: `assertFails(...)` propagated the expected
`FirebaseError` with code `permission-denied`, so asserting that it resolved
to `undefined` failed. Both denied-operation checks now await `assertFails(...)`
directly, which is the helper's intended assertion contract. The unused
`expect` import was removed.

## Changed files

- `.env.example`
- `firebase.json`
- `firestore.rules`
- `package.json`
- `package-lock.json`
- `vitest.config.js`
- `src/test/setup.js`
- `src/test/firestore.rules.test.js`

## Verification

- `npm run build` passed.
- RED: `PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH" npm run test:rules`
  started the Firestore Emulator and failed at the invalid assertion on line
  46: `expected FirebaseError ... code: "permission-denied" ... to be
  undefined`.
- GREEN: `PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH" npm run test:rules`
  passed: `Test Files 1 passed (1)`, `Tests 1 passed (1)`, and the emulator
  script exited with code 0.
- Final build: `npm run build` passed (`✓ built in 161ms`).

## Self-review

- Rules use the required verified-email and matching-UID check for every
  document under `/users/{userId}`.
- Emulator ports are Auth 9099, Firestore 8080, and UI 4000.
- No `.env.local` file was created or modified.
- The emulator-backed rules test now has a passing GREEN result when JDK 21 is
  prepended to `PATH`.
