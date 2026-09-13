import { useState } from 'react';
import { Alert, Box, Button, Paper, TextField, Typography } from '@mui/material';
import { THEME } from '../constants';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { signIn, signUp, sendPasswordReset } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setResetSent(false);
    if (isSignup && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    const result = isSignup
      ? await signUp({ displayName, email, password })
      : await signIn({ email, password });
    if (!result.success) setError(result.error);
    setBusy(false);
  };

  const handleReset = async () => {
    setError('');
    setResetSent(false);
    setBusy(true);
    const result = await sendPasswordReset(email);
    if (result.success) setResetSent(true);
    else setError(result.error);
    setBusy(false);
  };

  const toggleMode = () => {
    setIsSignup((value) => !value);
    setError('');
    setResetSent(false);
  };

  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: THEME.bg, p: 2, pt: 'max(16px, env(safe-area-inset-top))', pb: 'max(16px, env(safe-area-inset-bottom))' }}>
      <Paper sx={{ width: '100%', maxWidth: 400, p: { xs: 2.5, sm: 4 }, borderRadius: 4, backgroundColor: THEME.surface, border: `1px solid ${THEME.border}`, boxShadow: THEME.shadow }} elevation={0}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 600, color: THEME.text, mb: 0.5, fontSize: '2rem' }}>TasKeep</Typography>
          <Typography variant="body2" sx={{ color: THEME.textMuted, fontSize: '0.85rem' }}>{isSignup ? 'Create your cloud account' : 'Welcome back'}</Typography>
          <Box sx={{ mt: 2, px: 2, py: 1.5, borderRadius: 2.5, backgroundColor: THEME.bg, border: `1px solid ${THEME.border}`, textAlign: 'left' }}>
            <Typography variant="body2" sx={{ color: THEME.textSecondary, fontSize: '0.78rem', lineHeight: 1.5 }}>
              Your encrypted account session and records sync through Firebase. Verify your email before accessing your data.
            </Typography>
          </Box>
        </Box>

        {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
        {resetSent && <Alert severity="success" sx={{ mb: 2 }}>If an account matches that email, a reset message has been sent.</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {isSignup && <TextField label="Display name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} fullWidth autoFocus autoComplete="name" />}
          <TextField label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} fullWidth autoFocus={!isSignup} autoComplete="email" />
          <TextField label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} fullWidth autoComplete={isSignup ? 'new-password' : 'current-password'} helperText={isSignup ? '12+ characters with upper, lower, number, and symbol.' : undefined} />
          {isSignup && <TextField label="Confirm password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} fullWidth autoComplete="new-password" />}
          <Button type="submit" variant="contained" fullWidth disabled={busy} sx={{ mt: 1, py: 1.25, fontSize: '0.9rem', fontWeight: 600, borderRadius: 2.5 }}>
            {isSignup ? 'Create cloud account' : 'Sign in'}
          </Button>
          {!isSignup && <Button type="button" variant="text" disabled={busy} onClick={handleReset}>Forgot password?</Button>}
        </Box>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography component="span" variant="body2" sx={{ color: THEME.textMuted, fontSize: '0.82rem' }}>
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <Button variant="text" size="small" onClick={toggleMode} sx={{ color: THEME.accent, fontWeight: 600, minWidth: 0, p: 0, verticalAlign: 'baseline', '&:hover': { textDecoration: 'underline' } }}>
              {isSignup ? 'Sign in' : 'Create one'}
            </Button>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
