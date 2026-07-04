import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
} from '@mui/material';
import { THEME } from '../constants';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { login, signup } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (isSignup) {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      const result = signup(username, password);
      if (!result.success) setError(result.error);
    } else {
      const result = login(username, password);
      if (!result.success) setError(result.error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: THEME.bg,
        p: 2,
      }}
    >
      <Paper
        sx={{
          width: '100%',
          maxWidth: 400,
          p: 4,
          borderRadius: 4,
          backgroundColor: THEME.surface,
          border: `1px solid ${THEME.border}`,
          boxShadow: THEME.shadow,
        }}
        elevation={0}
      >
        {/* Brand */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 600,
              color: THEME.text,
              mb: 0.5,
              fontSize: '2rem',
            }}
          >
            TasKeep
          </Typography>
          <Typography variant="body2" sx={{ color: THEME.textMuted, fontSize: '0.85rem' }}>
            {isSignup ? 'Create your account' : 'Welcome back'}
          </Typography>
        </Box>

        {/* Error */}
        {error && (
          <Alert
            severity="error"
            onClose={() => setError('')}
            sx={{
              mb: 2,
              backgroundColor: 'rgba(217, 119, 87, 0.1)',
              color: THEME.error,
              border: `1px solid rgba(217, 119, 87, 0.3)`,
              '& .MuiAlert-icon': { color: THEME.error },
            }}
          >
            {error}
          </Alert>
        )}

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            autoFocus
            autoComplete="username"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: THEME.bg,
              },
            }}
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: THEME.bg,
              },
            }}
          />
          {isSignup && (
            <TextField
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              autoComplete="new-password"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: THEME.bg,
                },
              }}
            />
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 1,
              py: 1.25,
              fontSize: '0.9rem',
              fontWeight: 600,
              borderRadius: 2.5,
            }}
          >
            {isSignup ? 'Create Account' : 'Sign In'}
          </Button>
        </Box>

        {/* Toggle */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" sx={{ color: THEME.textMuted, fontSize: '0.82rem' }}>
            {isSignup ? 'Already have an account?' : "Don't have an account?"}
            {' '}
            <Box
              component="span"
              onClick={() => { setIsSignup((v) => !v); setError(''); }}
              sx={{
                color: THEME.accent,
                cursor: 'pointer',
                fontWeight: 600,
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              {isSignup ? 'Sign in' : 'Sign up'}
            </Box>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
