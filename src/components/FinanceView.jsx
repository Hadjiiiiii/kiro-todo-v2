import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from 'dayjs';
import { THEME, FINANCE_CATEGORIES, CARD_HOVER_ZOOM } from '../constants';
import { useFinanceContext } from '../context/FinanceContext';
import ConfirmDialog from './ConfirmDialog';

const CURRENCY = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'USD',
});
const MAX_AMOUNT = 999999999999;

export default function FinanceView() {
  const { transactions, balance, monthlyIncome, monthlyExpense, addTransaction, deleteTransaction } = useFinanceContext();

  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState(FINANCE_CATEGORIES[0]);
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [note, setNote] = useState('');
  const [amountError, setAmountError] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0 || parsedAmount > MAX_AMOUNT) {
      setAmountError(`Enter an amount between ${CURRENCY.format(0.01)} and ${CURRENCY.format(MAX_AMOUNT)}.`);
      return;
    }

    addTransaction({
      amount: parsedAmount,
      type,
      category,
      date,
      note: note.trim(),
    });

    // Reset form
    setAmount('');
    setNote('');
    setAmountError('');
    setMessage(`${type === 'income' ? 'Income' : 'Expense'} added.`);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteTransaction(pendingDelete.id);
    setMessage('Transaction deleted from this device.');
    setPendingDelete(null);
  };

  return (
    <Box className="card-hover-reveal" sx={{ p: { xs: 1.5, md: 3 }, flex: 1, overflow: 'auto', maxWidth: 720, mx: 'auto', width: '100%' }}>
      {/* Balance Summary */}
      <Paper
        className="card-reveal"
        sx={{
          p: 3,
          borderRadius: 3,
          backgroundColor: THEME.surface,
          border: `1px solid ${THEME.border}`,
          mb: 3,
          textAlign: 'center',
          ...CARD_HOVER_ZOOM,
        }}
        elevation={0}
      >
        <Typography variant="caption" sx={{ color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.65rem' }}>
          Current balance
        </Typography>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: balance >= 0 ? THEME.green : THEME.error,
            letterSpacing: '-0.02em',
            my: 1,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {CURRENCY.format(balance)}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
          <Typography variant="body2" sx={{ color: THEME.green, fontSize: '0.85rem' }}>
            +{CURRENCY.format(monthlyIncome)} income
          </Typography>
          <Typography variant="body2" sx={{ color: THEME.error, fontSize: '0.85rem' }}>
            -{CURRENCY.format(monthlyExpense)} expense
          </Typography>
        </Box>
      </Paper>

      {/* Add Transaction Form */}
      <Paper
        className="card-reveal"
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{
          p: 2.5,
          borderRadius: 3,
          backgroundColor: THEME.surface,
          border: `1px solid ${THEME.border}`,
          mb: 3,
          ...CARD_HOVER_ZOOM,
        }}
        elevation={0}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: THEME.text, mb: 2, fontSize: '0.85rem' }}>
          Add transaction
        </Typography>

        {/* Type toggle */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button
            variant={type === 'income' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setType('income')}
            aria-pressed={type === 'income'}
            sx={{
              flex: 1,
              textTransform: 'none',
              fontSize: '0.8rem',
              borderRadius: 2,
              backgroundColor: type === 'income' ? THEME.green : 'transparent',
              borderColor: type === 'income' ? THEME.green : THEME.border,
              color: type === 'income' ? THEME.onAccent : THEME.textSecondary,
              '&:hover': {
                backgroundColor: type === 'income' ? THEME.green : THEME.surfaceHover,
                borderColor: THEME.green,
              },
            }}
          >
            Income
          </Button>
          <Button
            variant={type === 'expense' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setType('expense')}
            aria-pressed={type === 'expense'}
            sx={{
              flex: 1,
              textTransform: 'none',
              fontSize: '0.8rem',
              borderRadius: 2,
              backgroundColor: type === 'expense' ? THEME.error : 'transparent',
              borderColor: type === 'expense' ? THEME.error : THEME.border,
              color: type === 'expense' ? THEME.onAccent : THEME.textSecondary,
              '&:hover': {
                backgroundColor: type === 'expense' ? THEME.errorHover : THEME.surfaceHover,
                borderColor: THEME.error,
              },
            }}
          >
            Expense
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
          <TextField
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setAmountError(''); }}
            size="small"
            required
            error={!!amountError}
            helperText={amountError}
            slotProps={{ htmlInput: { min: 0.01, max: MAX_AMOUNT, step: '0.01' } }}
            sx={{
              flex: 1,
              minWidth: 120,
              '& .MuiOutlinedInput-root': { backgroundColor: THEME.bg, fontSize: '0.85rem' },
            }}
          />
          <FormControl size="small" sx={{ flex: 1, minWidth: 120 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              label="Category"
              onChange={(e) => setCategory(e.target.value)}
              sx={{ backgroundColor: THEME.bg, fontSize: '0.85rem' }}
            >
              {FINANCE_CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{
              flex: 1,
              minWidth: 140,
              '& .MuiOutlinedInput-root': { backgroundColor: THEME.bg, fontSize: '0.85rem' },
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: { xs: 'stretch', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' } }}>
          <TextField
            label="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            slotProps={{ htmlInput: { maxLength: 200 } }}
            size="small"
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': { backgroundColor: THEME.bg, fontSize: '0.85rem' },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            size="small"
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              backgroundColor: THEME.accent,
              color: THEME.onAccent,
              px: 3,
              whiteSpace: 'nowrap',
              width: { xs: '100%', sm: 'auto' },
              '&:hover': { backgroundColor: THEME.accentHover },
            }}
          >
            Add transaction
          </Button>
        </Box>
      </Paper>

      {/* Transaction List */}
      <Paper
        className="card-reveal"
        sx={{
          borderRadius: 3,
          backgroundColor: THEME.surface,
          border: `1px solid ${THEME.border}`,
          overflow: 'hidden',
          ...CARD_HOVER_ZOOM,
        }}
        elevation={0}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${THEME.border}` }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: THEME.text, fontSize: '0.85rem' }}>
            Transaction history
          </Typography>
        </Box>

        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          {transactions.length === 0 && (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: THEME.textMuted }}>
                No transactions yet. Add income or an expense above.
              </Typography>
            </Box>
          )}

          {transactions.map((t) => (
            <Box
              key={t.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2,
                py: 1.25,
                minHeight: 44,
                flexWrap: 'wrap',
                borderBottom: `1px solid ${THEME.border}`,
                '&:last-child': { borderBottom: 'none' },
              }}
            >
              {/* Color dot */}
              <Box
                role="img"
                aria-label={t.type === 'income' ? 'Income' : 'Expense'}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: t.type === 'income' ? THEME.green : THEME.error,
                  flexShrink: 0,
                }}
              />

              {/* Category + Note */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ color: THEME.text, fontSize: '0.82rem', fontWeight: 500 }}>
                  {t.category}
                </Typography>
                {t.note && (
                  <Typography variant="caption" sx={{ color: THEME.textMuted, fontSize: '0.72rem' }}>
                    {t.note}
                  </Typography>
                )}
              </Box>

              {/* Amount */}
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  color: t.type === 'income' ? THEME.green : THEME.error,
                  whiteSpace: 'nowrap',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {t.type === 'income' ? '+' : '-'}{CURRENCY.format(t.amount)}
              </Typography>

              {/* Date */}
              <Typography variant="caption" sx={{ color: THEME.textMuted, fontSize: '0.7rem', whiteSpace: 'nowrap', minWidth: 50 }}>
                {dayjs(t.date).format('MMM D')}
              </Typography>

              {/* Delete */}
              <IconButton
                size="small"
                onClick={() => setPendingDelete(t)}
                aria-label={`Delete ${t.type} transaction for ${t.category}, ${CURRENCY.format(t.amount)}`}
                sx={{ color: THEME.textMuted, '&:hover': { color: THEME.error } }}
              >
                <DeleteIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
            </Box>
          ))}
        </Box>
      </Paper>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this transaction?"
        description={pendingDelete ? `This permanently removes the ${pendingDelete.type} of ${CURRENCY.format(pendingDelete.amount)} from this device.` : ''}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />

      <Snackbar open={!!message} autoHideDuration={4000} onClose={() => setMessage('')}>
        <Alert severity="success" variant="filled" onClose={() => setMessage('')}>
          {message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
