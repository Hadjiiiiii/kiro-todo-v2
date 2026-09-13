import { useState } from 'react';
import { Alert, Box, Button, Paper, Typography } from '@mui/material';
import { THEME } from '../constants';
import { useAuth } from '../context/AuthContext';

export default function VerifyEmailScreen() {
  const { currentUser, resendVerification, refreshUser, signOut } = useAuth();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const run = async (action, successMessage) => {
    setBusy(true);
    setError('');
    setMessage('');
    const result = await action();
    if (result?.success) setMessage(successMessage);
    else if (result?.error) setError(result.error);
    setBusy(false);
  };

  return (
    <Box sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', backgroundColor: THEME.bg, p: 2 }}>
      <Paper sx={{ width: '100%', maxWidth: 440, p: { xs: 2.5, sm: 4 }, borderRadius: 4 }} elevation={0}>
        <Typography variant="h4" sx={{ color: THEME.text, mb: 1 }}>Verify your email</Typography>
        <Typography sx={{ color: THEME.textSecondary, mb: 3 }}>
          We sent a verification link to {currentUser?.email}. Verify it before accessing your cloud-synced records.
        </Typography>
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box sx={{ display: 'grid', gap: 1.25 }}>
          <Button variant="contained" disabled={busy} onClick={() => run(resendVerification, 'Verification email sent.')}>Resend verification email</Button>
          <Button variant="outlined" disabled={busy} onClick={() => run(refreshUser, 'Your verification status was refreshed.')}>I verified my email</Button>
          <Button variant="text" disabled={busy} onClick={signOut}>Sign out</Button>
        </Box>
      </Paper>
    </Box>
  );
}
