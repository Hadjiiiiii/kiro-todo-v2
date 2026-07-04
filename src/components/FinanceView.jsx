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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from 'dayjs';
import { THEME, FINANCE_CATEGORIES } from '../constants';
import { useFinanceContext } from '../context/FinanceContext';

export default function FinanceView() {
  const { transactions, balance, monthlyIncome, monthlyExpense, addTransaction, deleteTransaction } = useFinanceContext();

  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState(FINANCE_CATEGORIES[0]);
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [note, setNote] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) return;

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
  };

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 }, flex: 1, overflow: 'auto', maxWidth: 720, mx: 'auto', width: '100%' }}>
      {/* Balance Summary */}
      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
          backgroundColor: THEME.surface,
          border: `1px solid ${THEME.border}`,
          mb: 3,
          textAlign: 'center',
        }}
        elevation={0}
      >
        <Typography variant="caption" sx={{ color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.65rem' }}>
          Total Balance
        </Typography>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: balance >= 0 ? THEME.green : THEME.error,
            letterSpacing: '-0.02em',
            my: 1,
          }}
        >
          ${balance.toFixed(2)}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
          <Typography variant="body2" sx={{ color: THEME.green, fontSize: '0.85rem' }}>
            +${monthlyIncome.toFixed(2)} income
          </Typography>
          <Typography variant="body2" sx={{ color: THEME.error, fontSize: '0.85rem' }}>
            -${monthlyExpense.toFixed(2)} expense
          </Typography>
        </Box>
      </Paper>

      {/* Add Transaction Form */}
      <Paper
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 2.5,
          borderRadius: 3,
          backgroundColor: THEME.surface,
          border: `1px solid ${THEME.border}`,
          mb: 3,
        }}
        elevation={0}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: THEME.text, mb: 2, fontSize: '0.85rem' }}>
          Add Transaction
        </Typography>

        {/* Type toggle */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button
            variant={type === 'income' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setType('income')}
            sx={{
              flex: 1,
              textTransform: 'none',
              fontSize: '0.8rem',
              borderRadius: 2,
              backgroundColor: type === 'income' ? THEME.green : 'transparent',
              borderColor: type === 'income' ? THEME.green : THEME.border,
              color: type === 'income' ? '#fff' : THEME.textSecondary,
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
            sx={{
              flex: 1,
              textTransform: 'none',
              fontSize: '0.8rem',
              borderRadius: 2,
              backgroundColor: type === 'expense' ? THEME.error : 'transparent',
              borderColor: type === 'expense' ? THEME.error : THEME.border,
              color: type === 'expense' ? '#fff' : THEME.textSecondary,
              '&:hover': {
                backgroundColor: type === 'expense' ? THEME.error : THEME.surfaceHover,
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
            onChange={(e) => setAmount(e.target.value)}
            size="small"
            required
            inputProps={{ min: 0, step: '0.01' }}
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

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <TextField
            label="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
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
              px: 3,
              whiteSpace: 'nowrap',
              '&:hover': { backgroundColor: THEME.accentHover },
            }}
          >
            Add
          </Button>
        </Box>
      </Paper>

      {/* Transaction List */}
      <Paper
        sx={{
          borderRadius: 3,
          backgroundColor: THEME.surface,
          border: `1px solid ${THEME.border}`,
          overflow: 'hidden',
        }}
        elevation={0}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${THEME.border}` }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: THEME.text, fontSize: '0.85rem' }}>
            Transactions
          </Typography>
        </Box>

        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          {transactions.length === 0 && (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: THEME.textMuted }}>
                No transactions yet.
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
                borderBottom: `1px solid ${THEME.border}`,
                '&:last-child': { borderBottom: 'none' },
              }}
            >
              {/* Color dot */}
              <Box
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
                }}
              >
                {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
              </Typography>

              {/* Date */}
              <Typography variant="caption" sx={{ color: THEME.textMuted, fontSize: '0.7rem', whiteSpace: 'nowrap', minWidth: 50 }}>
                {dayjs(t.date).format('MMM D')}
              </Typography>

              {/* Delete */}
              <IconButton
                size="small"
                onClick={() => deleteTransaction(t.id)}
                sx={{ color: THEME.textMuted, '&:hover': { color: THEME.error } }}
              >
                <DeleteIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}
