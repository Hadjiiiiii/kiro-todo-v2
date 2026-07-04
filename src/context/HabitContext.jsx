import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { storageService } from '../services/storageService';

dayjs.extend(isSameOrBefore);

const HabitContext = createContext(null);

/**
 * Schedule presets map to arrays of day indices (0=Sun, 1=Mon, ..., 6=Sat)
 */
export const SCHEDULE_PRESETS = [
  { value: 'everyday', label: 'Every day', days: [0, 1, 2, 3, 4, 5, 6] },
  { value: 'weekdays', label: 'Weekdays', days: [1, 2, 3, 4, 5] },
  { value: 'mwf', label: 'M-W-F', days: [1, 3, 5] },
  { value: 'tth', label: 'T-Th', days: [2, 4] },
  { value: 'custom', label: 'Custom', days: [] },
];

export function HabitProvider({ children }) {
  const [habits, setHabits] = useState(() => storageService.getHabits());
  const [completions, setCompletions] = useState(() => storageService.getHabitCompletions());

  useEffect(() => { storageService.saveHabits(habits); }, [habits]);
  useEffect(() => { storageService.saveHabitCompletions(completions); }, [completions]);

  const addHabit = useCallback((name, scheduleDays) => {
    const habit = {
      id: `habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      scheduleDays,
      createdAt: new Date().toISOString(),
    };
    setHabits((prev) => [...prev, habit]);
    return habit;
  }, []);

  const deleteHabit = useCallback((id) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    setCompletions((prev) => prev.filter((c) => c.habitId !== id));
  }, []);

  const updateHabit = useCallback((id, updates) => {
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, ...updates } : h)));
  }, []);

  const toggleHabitDay = useCallback((habitId, date) => {
    setCompletions((prev) => {
      const exists = prev.find((c) => c.habitId === habitId && c.date === date);
      if (exists) {
        return prev.filter((c) => !(c.habitId === habitId && c.date === date));
      }
      return [...prev, { habitId, date }];
    });
  }, []);

  const isHabitDone = useCallback((habitId, date) => {
    return completions.some((c) => c.habitId === habitId && c.date === date);
  }, [completions]);

  const getHabitCompletions = useCallback((habitId) => {
    return completions.filter((c) => c.habitId === habitId).map((c) => c.date);
  }, [completions]);

  const getCompletionRate = useCallback((habitId) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return 0;

    const createdAt = dayjs(habit.createdAt).startOf('day');
    const today = dayjs().startOf('day');
    let scheduledCount = 0;
    let current = createdAt;

    while (current.isSameOrBefore(today, 'day')) {
      if (habit.scheduleDays.includes(current.day())) {
        scheduledCount++;
      }
      current = current.add(1, 'day');
    }

    if (scheduledCount === 0) return 0;

    const completedCount = completions.filter((c) => c.habitId === habitId).length;
    return Math.round((completedCount / scheduledCount) * 100);
  }, [habits, completions]);

  const value = useMemo(() => ({
    habits,
    addHabit,
    deleteHabit,
    updateHabit,
    toggleHabitDay,
    isHabitDone,
    getHabitCompletions,
    getCompletionRate,
  }), [habits, addHabit, deleteHabit, updateHabit, toggleHabitDay, isHabitDone, getHabitCompletions, getCompletionRate]);

  return (
    <HabitContext.Provider value={value}>
      {children}
    </HabitContext.Provider>
  );
}

export function useHabitContext() {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabitContext must be used within a HabitProvider');
  }
  return context;
}
