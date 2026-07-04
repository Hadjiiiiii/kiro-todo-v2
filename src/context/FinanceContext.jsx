import { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import { storageService } from '../services/storageService';

const FinanceContext = createContext(null);

const ACTION_TYPES = {
  SET_TRANSACTIONS: 'SET_TRANSACTIONS',
  ADD_TRANSACTION: 'ADD_TRANSACTION',
  DELETE_TRANSACTION: 'DELETE_TRANSACTION',
};

function financeReducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.SET_TRANSACTIONS:
      return { ...state, transactions: action.payload };

    case ACTION_TYPES.ADD_TRANSACTION: {
      const newTransaction = {
        ...action.payload,
        id: `fin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
      return { ...state, transactions: [...state.transactions, newTransaction] };
    }

    case ACTION_TYPES.DELETE_TRANSACTION: {
      return { ...state, transactions: state.transactions.filter((t) => t.id !== action.payload) };
    }

    default:
      return state;
  }
}

const initialState = {
  transactions: [],
};

export function FinanceProvider({ children }) {
  const [state, dispatch] = useReducer(financeReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    const transactions = storageService.getFinance();
    dispatch({ type: ACTION_TYPES.SET_TRANSACTIONS, payload: transactions });
  }, []);

  // Save to localStorage whenever transactions change
  useEffect(() => {
    storageService.saveFinance(state.transactions);
  }, [state.transactions]);

  const addTransaction = useCallback((transaction) => {
    dispatch({ type: ACTION_TYPES.ADD_TRANSACTION, payload: transaction });
  }, []);

  const deleteTransaction = useCallback((id) => {
    dispatch({ type: ACTION_TYPES.DELETE_TRANSACTION, payload: id });
  }, []);

  // Sorted by date descending
  const transactions = useMemo(() => {
    return [...state.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [state.transactions]);

  // Balance: income - expenses
  const balance = useMemo(() => {
    return state.transactions.reduce((acc, t) => {
      return t.type === 'income' ? acc + t.amount : acc - t.amount;
    }, 0);
  }, [state.transactions]);

  // Monthly income (current month)
  const monthlyIncome = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return state.transactions
      .filter((t) => {
        const d = new Date(t.date);
        return t.type === 'income' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((acc, t) => acc + t.amount, 0);
  }, [state.transactions]);

  // Monthly expense (current month)
  const monthlyExpense = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return state.transactions
      .filter((t) => {
        const d = new Date(t.date);
        return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((acc, t) => acc + t.amount, 0);
  }, [state.transactions]);

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        balance,
        monthlyIncome,
        monthlyExpense,
        addTransaction,
        deleteTransaction,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinanceContext() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinanceContext must be used within a FinanceProvider');
  }
  return context;
}
