import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { removeRecord, setRecord, subscribeCollection } from '../services/cloudDataService.js';

const FinanceContext = createContext(null);
function makeId() { return `fin_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`; }

export function FinanceProvider({ children }) {
  const { currentUser, isVerified } = useAuth();
  const uid = isVerified ? currentUser?.uid : null;
  const [records, setRecords] = useState([]);
  const [ready, setReady] = useState(false);
  const [syncError, setSyncError] = useState(false);
  useEffect(() => {
    setRecords([]); setReady(false); setSyncError(false);
    if (!uid) return undefined;
    let active = true;
    const unsubscribe = subscribeCollection(uid, 'finance', (transactions) => {
      if (!active) return;
      setRecords(transactions); setReady(true);
    }, () => { if (active) { setSyncError(true); setReady(true); } });
    return () => { active = false; unsubscribe(); };
  }, [uid]);
  const addTransaction = useCallback(async (transaction) => {
    const next = { ...transaction, id: makeId() };
    try { await setRecord(uid, 'finance', next.id, next); return next; } catch { setSyncError(true); return null; }
  }, [uid]);
  const deleteTransaction = useCallback(async (id) => {
    try { await removeRecord(uid, 'finance', id); return true; } catch { setSyncError(true); return false; }
  }, [uid]);
  const transactions = useMemo(() => [...records].sort((left, right) => new Date(right.date) - new Date(left.date)), [records]);
  const balance = useMemo(() => records.reduce((total, transaction) => transaction.type === 'income' ? total + transaction.amount : total - transaction.amount, 0), [records]);
  const monthlyIncome = useMemo(() => monthlyTotal(records, 'income'), [records]);
  const monthlyExpense = useMemo(() => monthlyTotal(records, 'expense'), [records]);
  const value = useMemo(() => ({ transactions, balance, monthlyIncome, monthlyExpense, ready, syncError, storageError: syncError, addTransaction, deleteTransaction }), [transactions, balance, monthlyIncome, monthlyExpense, ready, syncError, addTransaction, deleteTransaction]);
  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

function monthlyTotal(transactions, type) {
  const today = new Date();
  return transactions.filter((transaction) => {
    const date = new Date(transaction.date);
    return transaction.type === type && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  }).reduce((total, transaction) => total + transaction.amount, 0);
}

export function useFinanceContext() {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinanceContext must be used within a FinanceProvider');
  return context;
}
