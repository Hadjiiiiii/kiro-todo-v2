import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('Firebase setup documentation', () => {
  it('documents every required Firebase environment variable', () => {
    const readme = readFileSync('README.md', 'utf8');

    expect(readme).toContain('VITE_FIREBASE_API_KEY');
    expect(readme).toContain('VITE_FIREBASE_AUTH_DOMAIN');
    expect(readme).toContain('VITE_FIREBASE_PROJECT_ID');
    expect(readme).toContain('VITE_FIREBASE_APP_ID');
  });
});
