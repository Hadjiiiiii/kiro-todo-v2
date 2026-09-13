import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AuthGate from '../components/AuthGate.jsx';

const authState = vi.hoisted(() => ({ value: null }));

vi.mock('../context/AuthContext.jsx', () => ({
  useAuth: () => authState.value,
}));

vi.mock('../App.jsx', () => ({
  default: () => <div>Application content</div>,
}));

vi.mock('../components/LoginScreen.jsx', () => ({
  default: () => <div>Login screen</div>,
}));

vi.mock('../components/VerifyEmailScreen.jsx', () => ({
  default: () => <div>Email verification screen</div>,
}));

vi.mock('../context/TaskContext.jsx', () => ({
  TaskProvider: ({ children }) => <div data-testid="task-provider">{children}</div>,
}));

vi.mock('../context/HabitContext.jsx', () => ({
  HabitProvider: ({ children }) => <div data-testid="habit-provider">{children}</div>,
}));

vi.mock('../context/JournalContext.jsx', () => ({
  JournalProvider: ({ children }) => <div data-testid="journal-provider">{children}</div>,
}));

vi.mock('../context/FinanceContext.jsx', () => ({
  FinanceProvider: ({ children }) => <div data-testid="finance-provider">{children}</div>,
}));

describe('AuthGate', () => {
  beforeEach(() => {
    authState.value = {
      authReady: true,
      isAuthenticated: true,
      isVerified: false,
    };
  });

  it('blocks application and data providers for an authenticated unverified user', () => {
    render(<AuthGate />);

    expect(screen.getByText('Email verification screen')).toBeInTheDocument();
    expect(screen.queryByText('Application content')).not.toBeInTheDocument();
    expect(screen.queryByTestId('task-provider')).not.toBeInTheDocument();
    expect(screen.queryByTestId('habit-provider')).not.toBeInTheDocument();
    expect(screen.queryByTestId('journal-provider')).not.toBeInTheDocument();
    expect(screen.queryByTestId('finance-provider')).not.toBeInTheDocument();
  });
});
