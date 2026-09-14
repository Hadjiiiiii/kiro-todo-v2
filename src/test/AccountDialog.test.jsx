import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AccountDialog from '../components/AccountDialog.jsx';

const auth = vi.hoisted(() => ({
  currentUser: {
    uid: 'ari-id',
    displayName: 'Ari',
    email: 'ari@example.com',
    emailVerified: false,
  },
  isVerified: false,
  changePassword: vi.fn(),
  resendVerification: vi.fn(),
  signOut: vi.fn(),
  updateDisplayName: vi.fn(),
}));
const settings = vi.hoisted(() => ({ migration: null }));

vi.mock('../context/AuthContext.jsx', () => ({ useAuth: () => auth }));
vi.mock('../context/SettingsContext.jsx', () => ({ useSettingsContext: () => settings }));
vi.mock('../components/LegacyImportDialog.jsx', () => ({
  default: ({ open }) => open ? <div>Import browser records dialog</div> : null,
}));

describe('AccountDialog', () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    vi.clearAllMocks();
    auth.currentUser = {
      uid: 'ari-id',
      displayName: 'Ari',
      email: 'ari@example.com',
      emailVerified: false,
    };
    auth.isVerified = false;
    auth.resendVerification.mockResolvedValue({ success: true });
    auth.changePassword.mockResolvedValue({ success: true });
    auth.updateDisplayName.mockResolvedValue({ success: true });
    auth.signOut.mockResolvedValue({ success: true });
    settings.migration = null;
  });

  it('shows verified account status without destructive controls', () => {
    auth.isVerified = true;
    render(<AccountDialog open onClose={vi.fn()} />);

    expect(screen.getByText('Verified')).toBeVisible();
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });

  it('requires a current password and matching confirmation before updating', async () => {
    const user = userEvent.setup();
    render(<AccountDialog open onClose={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Update password' }));
    expect(screen.getByText('Current password is required.')).toBeVisible();

    await user.type(screen.getByLabelText('Current password'), 'Old!Secure2026');
    await user.type(screen.getByLabelText('New password'), 'New!Secure2026');
    await user.type(screen.getByLabelText('Confirm new password'), 'Different!Secure2026');
    await user.click(screen.getByRole('button', { name: 'Update password' }));

    expect(screen.getByText('Password confirmation does not match.')).toBeVisible();
    expect(auth.changePassword).not.toHaveBeenCalled();
  });

  it('updates a confirmed password and clears the password fields', async () => {
    const user = userEvent.setup();
    render(<AccountDialog open onClose={vi.fn()} />);

    await user.type(screen.getByLabelText('Current password'), 'Old!Secure2026');
    await user.type(screen.getByLabelText('New password'), 'New!Secure2026');
    await user.type(screen.getByLabelText('Confirm new password'), 'New!Secure2026');
    await user.click(screen.getByRole('button', { name: 'Update password' }));

    expect(auth.changePassword).toHaveBeenCalledWith({
      currentPassword: 'Old!Secure2026',
      nextPassword: 'New!Secure2026',
    });
    expect(await screen.findByText('Password updated.')).toBeVisible();
    expect(screen.getByLabelText('Current password')).toHaveValue('');
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });

  it('clears prior success before showing a local validation error', async () => {
    const user = userEvent.setup();
    render(<AccountDialog open onClose={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Save profile' }));
    expect(await screen.findByText('Profile saved.')).toBeVisible();

    await user.clear(screen.getByLabelText('Display name'));
    await user.click(screen.getByRole('button', { name: 'Save profile' }));

    expect(screen.getByText('Display name is required.')).toBeVisible();
    expect(screen.queryByText('Profile saved.')).not.toBeInTheDocument();
  });
});
