import App from '../App.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { TaskProvider } from '../context/TaskContext.jsx';
import { HabitProvider } from '../context/HabitContext.jsx';
import { JournalProvider } from '../context/JournalContext.jsx';
import { FinanceProvider } from '../context/FinanceContext.jsx';
import { SettingsProvider } from '../context/SettingsContext.jsx';
import LoginScreen from './LoginScreen.jsx';
import VerifyEmailScreen from './VerifyEmailScreen.jsx';

export default function AuthGate() {
  const { authReady, isAuthenticated, isVerified } = useAuth();

  if (!authReady) {
    return <div role="status">Loading your account…</div>;
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  if (!isVerified) {
    return <VerifyEmailScreen />;
  }

  return (
    <SettingsProvider>
      <TaskProvider>
        <HabitProvider>
          <JournalProvider>
            <FinanceProvider>
              <App />
            </FinanceProvider>
          </JournalProvider>
        </HabitProvider>
      </TaskProvider>
    </SettingsProvider>
  );
}
