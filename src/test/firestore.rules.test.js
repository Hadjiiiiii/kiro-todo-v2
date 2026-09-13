import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterAll, beforeAll, describe, it } from 'vitest';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc } from 'firebase/firestore';

let testEnvironment;

beforeAll(async () => {
  testEnvironment = await initializeTestEnvironment({
    projectId: 'taskeep-rules-test',
    firestore: {
      rules: readFileSync(resolve(process.cwd(), 'firestore.rules'), 'utf8'),
    },
  });
});

afterAll(async () => {
  await testEnvironment?.cleanup();
});

describe('Firestore user data rules', () => {
  it('allows a verified owner to write but blocks other users and unverified owners', async () => {
    const alice = testEnvironment.authenticatedContext('alice', {
      email: 'alice@example.com',
      email_verified: true,
    });
    const bob = testEnvironment.authenticatedContext('bob', {
      email: 'bob@example.com',
      email_verified: true,
    });
    const unverified = testEnvironment.authenticatedContext('unverified', {
      email: 'unverified@example.com',
      email_verified: false,
    });

    await assertSucceeds(
      setDoc(doc(alice.firestore(), 'users/alice/tasks/task-1'), { title: 'Private task' }),
    );
    await assertFails(getDoc(doc(bob.firestore(), 'users/alice/tasks/task-1')));
    await assertFails(
      setDoc(doc(unverified.firestore(), 'users/unverified/tasks/task-1'), {
        title: 'Unverified task',
      }),
    );
  });
});
