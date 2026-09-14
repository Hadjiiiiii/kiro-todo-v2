import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { DEFAULT_CATEGORIES } from '../constants';
import { useAuth } from './AuthContext.jsx';
import { removeRecord, setDocument, setRecord, subscribeCollection, subscribeDocument } from '../services/cloudDataService.js';

const TaskContext = createContext(null);

function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function getNextDueDate(currentDue, pattern) {
  const date = dayjs(currentDue);
  switch (pattern) {
    case 'daily': return date.add(1, 'day').toISOString();
    case 'weekly': return date.add(1, 'week').toISOString();
    case 'biweekly': return date.add(2, 'week').toISOString();
    case 'monthly': return date.add(1, 'month').toISOString();
    default: return null;
  }
}

function orderTasks(records) {
  return [...records].sort((left, right) => {
    if (left.category !== right.category) return String(left.category).localeCompare(String(right.category));
    if ((left.order ?? 0) !== (right.order ?? 0)) return (left.order ?? 0) - (right.order ?? 0);
    return String(left.createdAt || left.id).localeCompare(String(right.createdAt || right.id));
  });
}

export function TaskProvider({ children }) {
  const { currentUser, isVerified } = useAuth();
  const uid = isVerified ? currentUser?.uid : null;
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [ready, setReady] = useState(false);
  const [syncError, setSyncError] = useState(false);
  const tasksRef = useRef(tasks);
  const categoriesRef = useRef(categories);

  useEffect(() => { tasksRef.current = tasks; }, [tasks]);
  useEffect(() => { categoriesRef.current = categories; }, [categories]);

  useEffect(() => {
    setTasks([]); setCategories([]); setReady(false); setSyncError(false);
    if (!uid) return undefined;
    let active = true;
    let tasksReady = false;
    let categoriesReady = false;
    const markReady = () => { if (active && tasksReady && categoriesReady) setReady(true); };
    const onError = () => { if (active) setSyncError(true); };
    const stopTasks = subscribeCollection(uid, 'tasks', (records) => {
      if (!active) return;
      setTasks(orderTasks(records)); tasksReady = true; markReady();
    }, () => { tasksReady = true; onError(); markReady(); });
    const stopCategories = subscribeDocument(uid, 'categories', 'current', (value) => {
      if (!active) return;
      setCategories(Array.isArray(value?.categories) && value.categories.length ? value.categories : DEFAULT_CATEGORIES);
      categoriesReady = true; markReady();
    }, () => { categoriesReady = true; onError(); markReady(); });
    return () => { active = false; stopTasks(); stopCategories(); };
  }, [uid]);

  const write = useCallback(async (operation) => {
    try { await operation(); return true; } catch { setSyncError(true); return false; }
  }, []);

  const addCategory = useCallback((name) => {
    const trimmed = name.trim();
    if (!trimmed || categoriesRef.current.some((category) => category.toLowerCase() === trimmed.toLowerCase())) return false;
    void write(() => setDocument(uid, 'categories', 'current', { categories: [...categoriesRef.current, trimmed] }));
    return true;
  }, [uid, write]);
  const deleteCategory = useCallback((name) => {
    void write(() => setDocument(uid, 'categories', 'current', { categories: categoriesRef.current.filter((category) => category !== name) }));
  }, [uid, write]);
  const renameCategory = useCallback((oldName, newName) => {
    const trimmed = newName.trim();
    if (!trimmed || categoriesRef.current.some((category) => category.toLowerCase() === trimmed.toLowerCase() && category !== oldName)) return false;
    const nextCategories = categoriesRef.current.map((category) => category === oldName ? trimmed : category);
    const updatedTasks = tasksRef.current.filter((task) => task.category === oldName).map((task) => ({ ...task, category: trimmed }));
    void write(() => Promise.all([
      setDocument(uid, 'categories', 'current', { categories: nextCategories }),
      ...updatedTasks.map((task) => setRecord(uid, 'tasks', task.id, task)),
    ]));
    return true;
  }, [uid, write]);

  const addTask = useCallback((task) => {
    const newTask = { ...task, id: makeId('task'), completed: false, createdAt: new Date().toISOString(), completedAt: null, subtasks: task.subtasks || [], recurrence: task.recurrence || 'none', order: tasksRef.current.filter((item) => item.category === task.category).length };
    void write(() => setRecord(uid, 'tasks', newTask.id, newTask));
  }, [uid, write]);
  const updateTask = useCallback((task) => { void write(() => setRecord(uid, 'tasks', task.id, task)); }, [uid, write]);
  const deleteTask = useCallback((id) => { void write(() => removeRecord(uid, 'tasks', id)); }, [uid, write]);
  const toggleComplete = useCallback((id) => {
    const task = tasksRef.current.find((item) => item.id === id);
    if (!task) return;
    const completed = !task.completed;
    const updatedTask = { ...task, completed, completedAt: completed ? new Date().toISOString() : null };
    const writes = [setRecord(uid, 'tasks', id, updatedTask)];
    if (completed && task.recurrence !== 'none' && task.dueDate) {
      const dueDate = getNextDueDate(task.dueDate, task.recurrence);
      if (dueDate) {
        const nextTask = { ...updatedTask, id: makeId('task'), completed: false, completedAt: null, createdAt: new Date().toISOString(), dueDate, subtasks: (task.subtasks || []).map((subtask) => ({ ...subtask, completed: false })), order: tasksRef.current.filter((item) => item.category === task.category && !item.completed).length };
        writes.push(setRecord(uid, 'tasks', nextTask.id, nextTask));
      }
    }
    void write(() => Promise.all(writes));
  }, [uid, write]);
  const reorderTasks = useCallback((updatedTasks) => { void write(() => Promise.all(updatedTasks.map((task) => setRecord(uid, 'tasks', task.id, task)))); }, [uid, write]);
  const updateSubtasks = useCallback((taskId, transform) => {
    const task = tasksRef.current.find((item) => item.id === taskId);
    if (!task) return;
    void write(() => setRecord(uid, 'tasks', taskId, { ...task, subtasks: transform(task.subtasks || []) }));
  }, [uid, write]);
  const addSubtask = useCallback((taskId, title) => updateSubtasks(taskId, (subtasks) => [...subtasks, { id: makeId('sub'), title, completed: false }]), [updateSubtasks]);
  const toggleSubtask = useCallback((taskId, subtaskId) => updateSubtasks(taskId, (subtasks) => subtasks.map((subtask) => subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask)), [updateSubtasks]);
  const deleteSubtask = useCallback((taskId, subtaskId) => updateSubtasks(taskId, (subtasks) => subtasks.filter((subtask) => subtask.id !== subtaskId)), [updateSubtasks]);
  const accomplishTask = useCallback((taskId, date) => {
    const task = tasksRef.current.find((item) => item.id === taskId);
    if (task) void write(() => setRecord(uid, 'tasks', taskId, { ...task, completed: true, completedAt: new Date().toISOString(), accomplishedDate: date }));
  }, [uid, write]);

  const stats = useMemo(() => {
    const now = dayjs(); const startOfWeek = now.startOf('week');
    const completed = tasks.filter((task) => task.completed); const active = tasks.filter((task) => !task.completed); const byCategory = {};
    tasks.forEach((task) => { byCategory[task.category] = (byCategory[task.category] || 0) + 1; });
    return { total: tasks.length, completed: completed.length, active: active.length, completedThisWeek: completed.filter((task) => task.completedAt && dayjs(task.completedAt).isAfter(startOfWeek)).length, overdue: active.filter((task) => task.dueDate && dayjs(task.dueDate).isBefore(now, 'day')).length, completionRate: tasks.length ? Math.round((completed.length / tasks.length) * 100) : 0, byCategory, weekDays: Array.from({ length: 7 }, (_, index) => { const day = startOfWeek.add(index, 'day'); return { day: day.format('ddd'), count: completed.filter((task) => task.completedAt && dayjs(task.completedAt).isSame(day, 'day')).length }; }) };
  }, [tasks]);

  const value = useMemo(() => ({ tasks, stats, categories, ready, syncError, storageError: syncError, addTask, updateTask, deleteTask, toggleComplete, reorderTasks, addSubtask, toggleSubtask, deleteSubtask, accomplishTask, addCategory, deleteCategory, renameCategory }), [tasks, stats, categories, ready, syncError, addTask, updateTask, deleteTask, toggleComplete, reorderTasks, addSubtask, toggleSubtask, deleteSubtask, accomplishTask, addCategory, deleteCategory, renameCategory]);
  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTaskContext must be used within a TaskProvider');
  return context;
}
