import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Typography } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { AuthProvider } from './context/AuthContext.jsx';
import { firebaseConfigured } from './services/firebase.js';
import AuthGate from './components/AuthGate.jsx';
import { THEME } from './constants';
import './index.css';

const SERIF = "'Fraunces', Georgia, 'Times New Roman', serif";
const SANS = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: THEME.accent,
      light: '#e08e70',
      dark: THEME.accentHover,
      contrastText: THEME.onAccent,
    },
    secondary: {
      main: THEME.blue,
      light: '#8bb4dc',
      dark: '#4f7ba8',
    },
    background: {
      default: THEME.bg,
      paper: THEME.surface,
    },
    text: {
      primary: THEME.text,
      secondary: THEME.textSecondary,
    },
    divider: THEME.border,
    error: { main: THEME.error, contrastText: THEME.onAccent },
    success: { main: THEME.success, contrastText: THEME.onAccent },
    warning: { main: THEME.warning, contrastText: THEME.onAccent },
  },
  typography: {
    fontFamily: SANS,
    h3: { fontFamily: SERIF, fontWeight: 600, letterSpacing: '-0.02em' },
    h4: { fontFamily: SERIF, fontWeight: 600, letterSpacing: '-0.02em' },
    h5: { fontFamily: SERIF, fontWeight: 600, letterSpacing: '-0.01em' },
    h6: { fontFamily: SERIF, fontWeight: 600, letterSpacing: '-0.01em' },
    subtitle1: { fontWeight: 500 },
    body2: { color: THEME.textSecondary },
  },
  shape: {
    borderRadius: THEME.radius,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: THEME.bg,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: THEME.surface,
          border: `1px solid ${THEME.border}`,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: THEME.surface,
          border: `1px solid ${THEME.border}`,
          borderRadius: THEME.radiusLg,
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: THEME.surfaceHover,
            borderColor: THEME.borderStrong,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          backgroundColor: THEME.elevated,
          border: `1px solid ${THEME.border}`,
          borderRadius: THEME.radiusXl,
          boxShadow: THEME.shadow,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 10,
        },
        contained: {
          backgroundColor: THEME.accent,
          color: THEME.onAccent,
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: THEME.accentHover,
            boxShadow: 'none',
          },
        },
        outlined: {
          borderColor: THEME.border,
          color: THEME.text,
          '&:hover': {
            borderColor: THEME.accent,
            backgroundColor: THEME.accentSoft,
          },
        },
        text: {
          color: THEME.textSecondary,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          backgroundColor: THEME.accent,
          color: THEME.onAccent,
          boxShadow: THEME.shadowLight,
          '&:hover': {
            backgroundColor: THEME.accentHover,
            boxShadow: THEME.shadow,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: THEME.bg,
            '& fieldset': {
              borderColor: THEME.border,
            },
            '&:hover fieldset': {
              borderColor: THEME.borderStrong,
            },
            '&.Mui-focused fieldset': {
              borderColor: THEME.accent,
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: THEME.bg,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          '& .MuiSwitch-switchBase.Mui-checked': {
            color: THEME.accent,
          },
          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
            backgroundColor: THEME.accent,
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: THEME.textMuted,
          '&.Mui-checked': {
            color: THEME.accent,
          },
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {firebaseConfigured ? (
          <AuthProvider>
            <AuthGate />
          </AuthProvider>
        ) : (
          <Box role="alert" sx={{ maxWidth: 520, mx: 'auto', mt: 10, p: 3, color: THEME.text }}>
            <Typography variant="h5" sx={{ mb: 1 }}>Firebase configuration is missing</Typography>
            <Typography>
              TasKeep needs its VITE_FIREBASE_* values. Copy .env.example to .env.local, fill in your Firebase web app config,
              and restart the dev server. See README → Local setup.
            </Typography>
          </Box>
        )}
      </LocalizationProvider>
    </ThemeProvider>
  </React.StrictMode>
);
