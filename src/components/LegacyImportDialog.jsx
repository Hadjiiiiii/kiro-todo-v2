import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { useAuth } from '../context/AuthContext.jsx';
import { useSettingsContext } from '../context/SettingsContext.jsx';
import { importLegacySnapshot } from '../services/cloudDataService.js';
import { getSummary, listAccounts, readSnapshot } from '../services/legacyDataService.js';

const SECTION_LABELS = {
  tasks: 'Tasks',
  categories: 'Categories',
  habits: 'Habits',
  habitCompletions: 'Habit completions',
  journal: 'Journal entries',
  finance: 'Finance records',
  settings: 'Settings',
};

export default function LegacyImportDialog({ open, onClose }) {
  const { currentUser, isVerified } = useAuth();
  const { migration, refreshMigration } = useSettingsContext();
  const accountList = useMemo(() => listAccounts(), [open]);
  const [selectedUsername, setSelectedUsername] = useState('');
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const completed = Boolean(migration?.completedAt);

  useEffect(() => {
    if (!open) return;
    setSelectedUsername(accountList.selectedUsername || accountList.accounts[0] || '');
    setError('');
  }, [accountList, open]);

  const snapshot = selectedUsername ? readSnapshot(selectedUsername) : null;
  const summary = getSummary(snapshot);
  const disabled = completed || importing || !snapshot || !isVerified || !currentUser?.uid;

  const handleImport = async () => {
    if (disabled) return;
    setImporting(true);
    setError('');
    try {
      const result = await importLegacySnapshot(currentUser.uid, snapshot);
      refreshMigration(result);
      onClose();
    } catch {
      setError('TasKeep could not import these records. Your local browser data is unchanged.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onClose={importing ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Import browser records</DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 2 }}>
          Choose a previous TasKeep browser account to import into this verified cloud account.
        </Typography>
        <FormControl fullWidth disabled={completed || importing || !accountList.accounts.length} sx={{ mb: 2 }}>
          <InputLabel id="legacy-account-label">Browser account</InputLabel>
          <Select
            labelId="legacy-account-label"
            label="Browser account"
            value={selectedUsername}
            onChange={(event) => setSelectedUsername(event.target.value)}
          >
            {accountList.accounts.map((username) => <MenuItem key={username} value={username}>{username}</MenuItem>)}
          </Select>
        </FormControl>
        {!accountList.accounts.length && <Alert severity="info" sx={{ mb: 2 }}>No legacy browser accounts were found.</Alert>}
        {completed && <Alert severity="success" sx={{ mb: 2 }}>This browser-data import has already been completed.</Alert>}
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Records to import</Typography>
        {Object.entries(summary).map(([section, count]) => (
          <Typography key={section} variant="body2">{SECTION_LABELS[section]}: {count}</Typography>
        ))}
        <Alert severity="warning" sx={{ mt: 2 }}>
          Local browser data will remain unchanged. Matching cloud record IDs, categories, and settings will be replaced by this import.
        </Alert>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={importing}>Cancel</Button>
        <Button variant="contained" onClick={handleImport} disabled={disabled}>Import</Button>
      </DialogActions>
    </Dialog>
  );
}
