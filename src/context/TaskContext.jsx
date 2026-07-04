import { createContext, useContext, useReducer, useState, useEffect, useMemo, useCallback } from 'react';
import dayjs from 'dayjs';
import { storageService } from '../services/storageService';

const TaskContext = createContext(null);

const ACTION_TYPES = {
  SET_TASKS: 'SET_TASKS',
  ADD_TASK: 'ADD_TASK',
  UPDATE_TASK: 'UPDATE_TASK',
  DELETE_TASK: 'DELETE_TASK',
  TOGGLE_COMPLETE: 'TOGGLE_COMPLETE',
  REORDER_TASKS: 'REORDER_TASKS',
  ADD_SUBTASK: 'ADD_SUBTASK',
  TOGGLE_SUBTASK: 'TOGGLE_SUBTASK',
  DELETE_SUBTASK: 'DELETE_SUBTASK',
  ACCOMPLISH_TASK: 'ACCOMPLISH_TASK',
};

function getNextDueDate(currentDue, pattern) {
  const date = dayjs(currentDue);
  switch (pattern) {
    case 'daily':
      return date.add(1, 'day').toISOString();
    case 'weekly':
      return date.add(1, 'week').toISOString();
    case 'biweekly':
      return date.add(2, 'week').toISOString();
    case 'monthly':
      return date.add(1, 'month').toISOString();
    default:
      return null;
  }
}

function taskReducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.SET_TASKS:
      return { ...state, tasks: action.payload };

    case ACTION_TYPES.ADD_TASK: {
      const newTask = {
        ...action.payload,
        id: storageService.generateId(),
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
        subtasks: action.payload.subtasks || [],
        recurrence: action.payload.recurrence || 'none',
        order: state.tasks.filter((t) => t.category === action.payload.category).length,
      };
      return { ...state, tasks: [...state.tasks, newTask] };
    }

    case ACTION_TYPES.UPDATE_TASK: {
      const tasks = state.tasks.map((task) =>
        task.id === action.payload.id ? { ...task, ...action.payload } : task
      );
      return { ...state, tasks };
    }

    case ACTION_TYPES.DELETE_TASK: {
      const tasks = state.tasks.filter((task) => task.id !== action.payload);
      return { ...state, tasks };
    }

    case ACTION_TYPES.TOGGLE_COMPLETE: {
      let tasks = state.tasks.map((task) => {
        if (task.id !== action.payload) return task;
        const nowCompleted = !task.completed;
        return {
          ...task,
          completed: nowCompleted,
          completedAt: nowCompleted ? new Date().toISOString() : null,
        };
      });

      // If completing a recurring task, create next instance
      const toggledTask = tasks.find((t) => t.id === action.payload);
      if (
        toggledTask?.completed &&
        toggledTask.recurrence !== 'none' &&
        toggledTask.dueDate
      ) {
        const nextDue = getNextDueDate(toggledTask.dueDate, toggledTask.recurrence);
        if (nextDue) {
          const newTask = {
            ...toggledTask,
            id: storageService.generateId(),
            completed: false,
            completedAt: null,
            createdAt: new Date().toISOString(),
            dueDate: nextDue,
            subtasks: toggledTask.subtasks.map((s) => ({ ...s, completed: false })),
            order: tasks.filter((t) => t.category === toggledTask.category && !t.completed).length,
          };
          tasks = [...tasks, newTask];
        }
      }

      return { ...state, tasks };
    }

    case ACTION_TYPES.REORDER_TASKS: {
      return { ...state, tasks: action.payload };
    }

    case ACTION_TYPES.ADD_SUBTASK: {
      const { taskId, title } = action.payload;
      const tasks = state.tasks.map((task) => {
        if (task.id !== taskId) return task;
        const subtask = {
          id: storageService.generateSubtaskId(),
          title,
          completed: false,
        };
        return { ...task, subtasks: [...task.subtasks, subtask] };
      });
      return { ...state, tasks };
    }

    case ACTION_TYPES.TOGGLE_SUBTASK: {
      const { taskId, subtaskId } = action.payload;
      const tasks = state.tasks.map((task) => {
        if (task.id !== taskId) return task;
        const subtasks = task.subtasks.map((s) =>
          s.id === subtaskId ? { ...s, completed: !s.completed } : s
        );
        return { ...task, subtasks };
      });
      return { ...state, tasks };
    }

    case ACTION_TYPES.DELETE_SUBTASK: {
      const { taskId, subtaskId } = action.payload;
      const tasks = state.tasks.map((task) => {
        if (task.id !== taskId) return task;
        return { ...task, subtasks: task.subtasks.filter((s) => s.id !== subtaskId) };
      });
      return { ...state, tasks };
    }

    case ACTION_TYPES.ACCOMPLISH_TASK: {
      const { taskId, date } = action.payload;
      const tasks = state.tasks.map((task) => {
        if (task.id !== taskId) return task;
        return {
          ...task,
          completed: true,
          completedAt: new Date().toISOString(),
          accomplishedDate: date,
        };
      });
      return { ...state, tasks };
    }

    default:
      return state;
  }
}

const initialState = {
  tasks: [],
};

export function TaskProvider({ children }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const [categories, setCategories] = useState(() => storageService.getCategories());

  // Load tasks from localStorage on mount
  useEffect(() => {
    const tasks = storageService.getTasks();
    dispatch({ type: ACTION_TYPES.SET_TASKS, payload: tasks });
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    storageService.saveTasks(state.tasks);
  }, [state.tasks]);

  // Persist categories whenever they change
  useEffect(() => {
    storageService.saveCategories(categories);
  }, [categories]);

  const addCategory = useCallback((name) => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) return false;
    setCategories((prev) => [...prev, trimmed]);
    return true;
  }, [categories]);

  const deleteCategory = useCallback((name) => {
    setCategories((prev) => prev.filter((c) => c !== name));
  }, []);

  const renameCategory = useCallback((oldName, newName) => {
    const trimmed = newName.trim();
    if (!trimmed) return false;
    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase() && c !== oldName)) return false;
    setCategories((prev) => prev.map((c) => (c === oldName ? trimmed : c)));
    // Also update tasks that belong to the renamed category
    const updated = state.tasks.map((t) =>
      t.category === oldName ? { ...t, category: trimmed } : t
    );
    dispatch({ type: ACTION_TYPES.REORDER_TASKS, payload: updated });
    return true;
  }, [categories, state.tasks]);

  const addTask = (task) => {
    dispatch({ type: ACTION_TYPES.ADD_TASK, payload: task });
  };

  const updateTask = (task) => {
    dispatch({ type: ACTION_TYPES.UPDATE_TASK, payload: task });
  };

  const deleteTask = (id) => {
    dispatch({ type: ACTION_TYPES.DELETE_TASK, payload: id });
  };

  const toggleComplete = (id) => {
    dispatch({ type: ACTION_TYPES.TOGGLE_COMPLETE, payload: id });
  };

  const reorderTasks = (tasks) => {
    dispatch({ type: ACTION_TYPES.REORDER_TASKS, payload: tasks });
  };

  const addSubtask = (taskId, title) => {
    dispatch({ type: ACTION_TYPES.ADD_SUBTASK, payload: { taskId, title } });
  };

  const toggleSubtask = (taskId, subtaskId) => {
    dispatch({ type: ACTION_TYPES.TOGGLE_SUBTASK, payload: { taskId, subtaskId } });
  };

  const deleteSubtask = (taskId, subtaskId) => {
    dispatch({ type: ACTION_TYPES.DELETE_SUBTASK, payload: { taskId, subtaskId } });
  };

  const accomplishTask = (taskId, date) => {
    dispatch({ type: ACTION_TYPES.ACCOMPLISH_TASK, payload: { taskId, date } });
  };

  // Statistics
  const stats = useMemo(() => {
    const now = dayjs();
    const startOfWeek = now.startOf('week');
    const allTasks = state.tasks;
    const completed = allTasks.filter((t) => t.completed);
    const active = allTasks.filter((t) => !t.completed);
    const completedThisWeek = completed.filter(
      (t) => t.completedAt && dayjs(t.completedAt).isAfter(startOfWeek)
    );
    const overdue = active.filter(
      (t) => t.dueDate && dayjs(t.dueDate).isBefore(now, 'day')
    );

    // Tasks by category
    const byCategory = {};
    allTasks.forEach((task) => {
      byCategory[task.category] = (byCategory[task.category] || 0) + 1;
    });

    // Completion rate
    const completionRate = allTasks.length > 0
      ? Math.round((completed.length / allTasks.length) * 100)
      : 0;

    // Completed per day this week
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = startOfWeek.add(i, 'day');
      const count = completed.filter(
        (t) => t.completedAt && dayjs(t.completedAt).isSame(day, 'day')
      ).length;
      weekDays.push({ day: day.format('ddd'), count });
    }

    return {
      total: allTasks.length,
      completed: completed.length,
      active: active.length,
      completedThisWeek: completedThisWeek.length,
      overdue: overdue.length,
      completionRate,
      byCategory,
      weekDays,
    };
  }, [state.tasks]);

  return (
    <TaskContext.Provider
      value={{
        tasks: state.tasks,
        stats,
        categories,
        addTask,
        updateTask,
        deleteTask,
        toggleComplete,
        reorderTasks,
        addSubtask,
        toggleSubtask,
        deleteSubtask,
        accomplishTask,
        addCategory,
        deleteCategory,
        renameCategory,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
}
