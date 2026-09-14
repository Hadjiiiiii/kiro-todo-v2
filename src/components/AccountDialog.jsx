import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  TextField,
  Typography,
} from '@mui/material';
import { useAuth } from '../context/AuthContext.jsx';
import { useSettingsContext } from '../context/SettingsContext.jsx';
import { THEME } from '../constants';
import LegacyImportDialog from './LegacyImportDialog.jsx';

const controlSx = { minHeight: 44 };

export default function AccountDialog({ open, onClose }) {
  const {
    currentUser,
    isVerified,
    changePassword,
    signOut,
    updateDisplayName,
  } = useAuth();
  const { migration } = useSettingsContext();
  const [displayName, setDisplayName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busyAction, setBusyAction] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [importOpen, setImportOpen] = useState(false);
  const migrationIncomplete = !migration?.completedAt;

  useEffect(() => {
    if (!open) return;
    setDisplayName(currentUser?.displayName || '');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setSuccess('');
    setError('');
  }, [currentUser?.displayName, open]);

  const runAction = async (action, work, successMessage) => {
    setBusyAction(action);
    setSuccess('');
    setError('');
    try {
      const result = await work();
      if (result?.success) setSuccess(successMessage);
      else setError(result?.error || 'TasKeep could not complete that account action.');
      return result;
    } catch {
      setError('TasKeep could not complete that account action.');
      return { success: false };
    } finally {
      setBusyAction('');
    }
  };

  const handleSaveProfile = async () => {
    setSuccess('');
    setError('');
    const name = displayName.trim();
    if (!name) {
      setError('Display name is required.');
      return;
    }
    if (name.length > 64) {
      setError('Display name must be 64 characters or fewer.');
      return;
    }
    await runAction('profile', () => updateDisplayName(name), 'Profile saved.');
  };

  const handlePasswordUpdate = async () => {
    setSuccess('');
    setError('');
    if (!currentPassword) {
      setError('Current password is required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }
    const result = await runAction(
      'password',
      () => changePassword({ currentPassword, nextPassword: newPassword }),
      'Password updated.',
    );
    if (result?.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleSignOut = async () => {
    const result = await runAction('signout', signOut, 'Signed out.');
    if (result?.success) onClose();
  };

  const disabled = Boolean(busyAction);

  return (
    <>
      <Dialog open={open} onClose={disabled ? undefined : onClose} fullWidth maxWidth="sm" aria-labelledby="account-dialog-title">
        <DialogTitle id="account-dialog-title">Account</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {error && <Alert severity="error" role="alert">{error}</Alert>}
            {success && <Alert severity="success" role="status">{success}</Alert>}

            <Box>
              <Typography variant="subtitle1" sx={{ color: THEME.text, fontWeight: 600, mb: 1 }}>Profile</Typography>
              <TextField
                fullWidth
                label="Display name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                inputProps={{ maxLength: 64 }}
                autoComplete="name"
              />
              <Button variant="contained" onClick={handleSaveProfile} disabled={disabled} sx={{ ...controlSx, mt: 1.5 }}>
                {busyAction === 'profile' ? 'Saving profile…' : 'Save profile'}
              </Button>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle1" sx={{ color: THEME.text, fontWeight: 600, mb: 1 }}>Email</Typography>
              <TextField fullWidth label="Email" value={currentUser?.email || ''} InputProps={{ readOnly: true }} />
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
                <Typography variant="body2" sx={{ color: isVerified ? THEME.green : THEME.textSecondary }}>
                  {isVerified ? 'Verified' : 'Verification required'}
                </Typography>
              </Box>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle1" sx={{ color: THEME.text, fontWeight: 600, mb: 1 }}>Security</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <TextField label="Current password" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" />
                <TextField label="New password" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" />
                <TextField label="Confirm new password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" />
              </Box>
              <Button variant="contained" onClick={handlePasswordUpdate} disabled={disabled} sx={{ ...controlSx, mt: 1.5 }}>
                {busyAction === 'password' ? 'Updating password…' : 'Update password'}
              </Button>
            </Box>

            {migrationIncomplete && (
              <>
                <Divider />
                <Box>
                  <Typography variant="subtitle1" sx={{ color: THEME.text, fontWeight: 600, mb: 1 }}>Data</Typography>
                  <Button variant="outlined" onClick={() => setImportOpen(true)} disabled={disabled} sx={controlSx}>
                    Import browser records
                  </Button>
                </Box>
              </>
            )}

            <Divider />

            <Box>
              <Typography variant="subtitle1" sx={{ color: THEME.text, fontWeight: 600, mb: 1 }}>Session</Typography>
              <Button color="error" variant="outlined" onClick={handleSignOut} disabled={disabled} sx={controlSx}>
                {busyAction === 'signout' ? 'Signing out…' : 'Sign out'}
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={disabled} sx={controlSx}>Close</Button>
        </DialogActions>
      </Dialog>
      <LegacyImportDialog open={importOpen} onClose={() => setImportOpen(false)} />
    </>
  );
}
