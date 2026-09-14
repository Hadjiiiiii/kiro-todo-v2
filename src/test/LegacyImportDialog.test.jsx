import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LegacyImportDialog from '../components/LegacyImportDialog.jsx';

const legacy = vi.hoisted(() => ({
  getSummary: vi.fn(),
  listAccounts: vi.fn(),
  readSnapshot: vi.fn(),
}));
const cloud = vi.hoisted(() => ({ importLegacySnapshot: vi.fn() }));
const auth = vi.hoisted(() => ({ currentUser: { uid: 'alice' }, isVerified: true }));
const settings = vi.hoisted(() => ({ migration: null, refreshMigration: vi.fn() }));

vi.mock('../services/legacyDataService.js', () => legacy);
vi.mock('../services/cloudDataService.js', () => cloud);
vi.mock('../context/AuthContext.jsx', () => ({ useAuth: () => auth }));
vi.mock('../context/SettingsContext.jsx', () => ({ useSettingsContext: () => settings }));

describe('LegacyImportDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    legacy.listAccounts.mockReturnValue({ accounts: ['old-user'], selectedUsername: 'old-user' });
    legacy.readSnapshot.mockReturnValue({ username: 'old-user', tasks: [{ id: 'task-1' }] });
    legacy.getSummary.mockReturnValue({ tasks: 1, categories: 0, habits: 0, habitCompletions: 0, journal: 0, finance: 0, settings: 0 });
    settings.migration = { completedAt: '2026-09-01T00:00:00.000Z' };
  });

  it('disables completed migration and states that local data remains', () => {
    render(<LegacyImportDialog open onClose={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Import' })).toBeDisabled();
    expect(screen.getByText(/Local browser data will remain unchanged.*replaced by this import/i)).toBeInTheDocument();
    expect(screen.getByText(/already been completed/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });
});
