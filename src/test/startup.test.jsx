import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const FIREBASE_KEYS = ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_PROJECT_ID', 'VITE_FIREBASE_APP_ID'];

describe('app startup', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    document.body.innerHTML = '';
  });

  it('shows a readable message instead of a blank page when Firebase config is missing', async () => {
    FIREBASE_KEYS.forEach((key) => vi.stubEnv(key, ''));
    document.body.innerHTML = '<div id="root"></div>';

    await import('../main.jsx');

    expect(await screen.findByText(/Firebase configuration is missing/i)).toBeInTheDocument();
    expect(screen.getByText(/README/)).toBeInTheDocument();
  });
});
