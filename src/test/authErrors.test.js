import { describe, expect, it } from 'vitest';
import { mapAuthError, PASSWORD_REQUIREMENTS } from '../services/authErrors.js';

describe('mapAuthError', () => {
  it.each(['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found'])(
    'says the email or password is wrong for %s',
    (code) => expect(mapAuthError({ code })).toBe('Email or password is incorrect.'),
  );

  it('points existing users to sign in or reset for auth/email-already-in-use', () => {
    expect(mapAuthError({ code: 'auth/email-already-in-use' })).toMatch(/sign in or reset your password/);
  });

  it.each(['auth/weak-password', 'auth/password-does-not-meet-requirements'])(
    'repeats the password rules for %s',
    (code) => expect(mapAuthError({ code })).toBe(PASSWORD_REQUIREMENTS),
  );
});
