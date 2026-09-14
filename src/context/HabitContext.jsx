import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { useAuth } from './AuthContext.jsx';
import { removeRecord, setRecord, subscribeCollection } from '../services/cloudDataService.js';

dayjs.extend(isSameOrBefore);

const HabitContext = createContext(null);

export const SCHEDULE_PRESETS = [
  { value: 'everyday', label: 'Every day', days: [0, 1, 2, 3, 4, 5, 6] },
  { value: 'weekdays', label: 'Weekdays', days: [1, 2, 3, 4, 5] },
  { value: 'mwf', label: 'M-W-F', days: [1, 3, 5] },
  { value: 'tth', label: 'T-Th', days: [2, 4] },
  { value: 'custom', label: 'Custom', days: [] },
];

function makeId() { return `habit_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`; }
function completionId(habitId, date) { return `${habitId}_${date}`; }

export function HabitProvider({ children }) {
  const { currentUser, isVerified } = useAuth();
  const uid = isVerified ? currentUser?.uid : null;
  const [habits, setHabits] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [ready, setReady] = useState(false);
  const [syncError, setSyncError] = useState(false);
  const habitsRef = useRef(habits);
  const completionsRef = useRef(completions);
  useEffect(() => { habitsRef.current = habits; }, [habits]);
  useEffect(() => { completionsRef.current = completions; }, [completions]);

  useEffect(() => {
    setHabits([]); setCompletions([]); setReady(false); setSyncError(false);
    if (!uid) return undefined;
    let active = true; let habitsReady = false; let completionsReady = false;
    const markReady = () => { if (active && habitsReady && completionsReady) setReady(true); };
    const fail = () => { if (active) setSyncError(true); };
    const stopHabits = subscribeCollection(uid, 'habits', (records) => {
      if (!active) return;
      setHabits(records); habitsReady = true; markReady();
    }, () => { habitsReady = true; fail(); markReady(); });
    const stopCompletions = subscribeCollection(uid, 'habitCompletions', (records) => {
      if (!active) return;
      setCompletions(records.map(({ habitId, date }) => ({ habitId, date }))); completionsReady = true; markReady();
    }, () => { completionsReady = true; fail(); markReady(); });
    return () => { active = false; stopHabits(); stopCompletions(); };
  }, [uid]);

  const write = useCallback(async (operation) => { try { await operation(); return true; } catch { setSyncError(true); return false; } }, []);
  const addHabit = useCallback((name, scheduleDays) => {
    const habit = { id: makeId(), name: name.trim(), scheduleDays, createdAt: new Date().toISOString() };
    void write(() => setRecord(uid, 'habits', habit.id, habit));
    return habit;
  }, [uid, write]);
  const deleteHabit = useCallback((id) => {
    const completionDeletes = completionsRef.current.filter((completion) => completion.habitId === id).map((completion) => removeRecord(uid, 'habitCompletions', completionId(completion.habitId, completion.date)));
    void write(() => Promise.all([removeRecord(uid, 'habits', id), ...completionDeletes]));
  }, [uid, write]);
  const updateHabit = useCallback((id, updates) => {
    const habit = habitsRef.current.find((item) => item.id === id);
    if (habit) void write(() => setRecord(uid, 'habits', id, { ...habit, ...updates }));
  }, [uid, write]);
  const toggleHabitDay = useCallback((habitId, date) => {
    const id = completionId(habitId, date);
    const exists = completionsRef.current.some((completion) => completion.habitId === habitId && completion.date === date);
    void write(() => exists ? removeRecord(uid, 'habitCompletions', id) : setRecord(uid, 'habitCompletions', id, { habitId, date }));
  }, [uid, write]);
  const isHabitDone = useCallback((habitId, date) => completions.some((completion) => completion.habitId === habitId && completion.date === date), [completions]);
  const getHabitCompletions = useCallback((habitId) => completions.filter((completion) => completion.habitId === habitId).map((completion) => completion.date), [completions]);
  const getCompletionRate = useCallback((habitId) => {
    const habit = habits.find((item) => item.id === habitId);
    if (!habit) return 0;
    let scheduledCount = 0; let current = dayjs(habit.createdAt).startOf('day'); const today = dayjs().startOf('day');
    while (current.isSameOrBefore(today, 'day')) { if (habit.scheduleDays.includes(current.day())) scheduledCount++; current = current.add(1, 'day'); }
    return scheduledCount ? Math.round((completions.filter((completion) => completion.habitId === habitId).length / scheduledCount) * 100) : 0;
  }, [habits, completions]);
  const value = useMemo(() => ({ habits, completions, ready, syncError, storageError: syncError, addHabit, deleteHabit, updateHabit, toggleHabitDay, isHabitDone, getHabitCompletions, getCompletionRate }), [habits, completions, ready, syncError, addHabit, deleteHabit, updateHabit, toggleHabitDay, isHabitDone, getHabitCompletions, getCompletionRate]);
  return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>;
}

export function useHabitContext() {
  const context = useContext(HabitContext);
  if (!context) throw new Error('useHabitContext must be used within a HabitProvider');
  return context;
}
