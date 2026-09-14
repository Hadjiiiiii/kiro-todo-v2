import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsProvider, useSettingsContext } from '../context/SettingsContext.jsx';

const cloud = vi.hoisted(() => ({
  setDocument: vi.fn(),
  subscribeDocument: vi.fn(),
}));

const auth = vi.hoisted(() => ({
  currentUser: { uid: 'alice' },
  isVerified: true,
}));

vi.mock('../services/cloudDataService.js', () => cloud);
vi.mock('../context/AuthContext.jsx', () => ({ useAuth: () => auth }));

describe('SettingsContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cloud.subscribeDocument.mockImplementation((_uid, _collection, _id, onValue) => {
      onValue({ onboardingCompleted: false, migration: { completedAt: '2026-09-01' } });
      return vi.fn();
    });
  });

  it('hydrates onboarding state without writing a blank default', async () => {
    const { result } = renderHook(() => useSettingsContext(), { wrapper: SettingsProvider });

    await waitFor(() => expect(result.current.ready).toBe(true));

    expect(result.current.settings).toEqual({ onboardingCompleted: false, migration: { completedAt: '2026-09-01' } });
    expect(result.current.migration).toEqual({ completedAt: '2026-09-01' });
    expect(cloud.setDocument).not.toHaveBeenCalled();
  });

  it('persists completing onboarding for the verified user', async () => {
    cloud.setDocument.mockResolvedValue();
    const { result } = renderHook(() => useSettingsContext(), { wrapper: SettingsProvider });
    await waitFor(() => expect(result.current.ready).toBe(true));

    await act(async () => {
      await result.current.completeOnboarding();
    });

    expect(cloud.setDocument).toHaveBeenCalledWith('alice', 'settings', 'preferences', {
      onboardingCompleted: true,
      migration: { completedAt: '2026-09-01' },
    });
  });
});
