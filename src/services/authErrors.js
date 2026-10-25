const GENERIC_AUTH_ERROR = 'We could not complete that request. Please check your details and try again.';

export const PASSWORD_REQUIREMENTS = 'Use at least 12 characters with uppercase, lowercase, a number, and a symbol.';

export function validatePassword(password) {
  if (
    typeof password !== 'string'
    || password.length < 12
    || !/[a-z]/.test(password)
    || !/[A-Z]/.test(password)
    || !/\d/.test(password)
    || !/[^A-Za-z0-9]/.test(password)
  ) return PASSWORD_REQUIREMENTS;
  return null;
}

export function mapAuthError(error) {
  switch (error?.code) {
    case 'auth/invalid-email': return 'Enter a valid email address.';
    case 'auth/network-request-failed': return 'We could not reach the account service. Check your connection and try again.';
    case 'auth/too-many-requests': return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/requires-recent-login': return 'For your security, sign in again and retry this action.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found': return 'Email or password is incorrect.';
    case 'auth/email-already-in-use': return "Couldn't create the account. If you already have one, sign in or reset your password.";
    case 'auth/weak-password':
    case 'auth/password-does-not-meet-requirements': return PASSWORD_REQUIREMENTS;
    default:
      // Keep the raw code visible in DevTools so unmapped failures can be diagnosed.
      console.error('Unhandled auth error:', error?.code);
      return GENERIC_AUTH_ERROR;
  }
}
