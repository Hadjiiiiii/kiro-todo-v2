import { DEFAULT_CATEGORIES } from '../constants';

let _userPrefix = '';
const unreadable = new Set();

function key(base) {
  return _userPrefix ? `${_userPrefix}:${base}` : base;
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Missing keys hydrate as empty. Present-but-invalid payloads stay on disk
 * and block later writes so a save effect cannot replace them with [].
 */
function readRecord(base, { empty, isValid, map }) {
  let raw;
  try {
    raw = localStorage.getItem(key(base));
  } catch {
    return empty;
  }

  if (raw === null) {
    unreadable.delete(base);
    return empty;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!isValid(parsed)) {
      unreadable.add(base);
      return empty;
    }
    unreadable.delete(base);
    return map ? map(parsed) : parsed;
  } catch {
    unreadable.add(base);
    return empty;
  }
}

function writeRecord(base, value) {
  if (unreadable.has(base)) {
    return false;
  }
  try {
    localStorage.setItem(key(base), JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Failed to save ${base}:`, error);
    return false;
  }
}

export const storageService = {
  /**
   * Set the current user prefix for all storage operations.
   * Call this when user logs in/out.
   */
  setUser(username) {
    const next = username || '';
    if (next === _userPrefix) return;
    _userPrefix = next;
    unreadable.clear();
  },

  hasUnreadableRecords() {
    return unreadable.size > 0;
  },

  /**
   * Remove only the keys that failed to parse, then allow writes again.
   * Callers should reload so providers hydrate from the cleared keys.
   */
  discardUnreadableRecords() {
    unreadable.forEach((base) => {
      try {
        localStorage.removeItem(key(base));
      } catch {
        // Keep going; reload still re-reads whatever remains.
      }
    });
    unreadable.clear();
  },

  getTasks() {
    return readRecord('tasks', {
      empty: [],
      isValid: Array.isArray,
      map: (tasks) =>
        tasks.map((task) => ({
          subtasks: [],
          recurrence: 'none',
          completedAt: null,
          ...task,
        })),
    });
  },

  saveTasks(tasks) {
    return writeRecord('tasks', tasks);
  },

  getSettings() {
    return readRecord('settings', {
      empty: {},
      isValid: isPlainObject,
    });
  },

  saveSettings(settings) {
    return writeRecord('settings', settings);
  },

  getCategories() {
    return readRecord('categories', {
      empty: DEFAULT_CATEGORIES,
      isValid: Array.isArray,
      map: (categories) => (categories.length > 0 ? categories : DEFAULT_CATEGORIES),
    });
  },

  saveCategories(categories) {
    return writeRecord('categories', categories);
  },

  getHabits() {
    return readRecord('habits', {
      empty: [],
      isValid: Array.isArray,
    });
  },

  saveHabits(habits) {
    return writeRecord('habits', habits);
  },

  getHabitCompletions() {
    return readRecord('habit-completions', {
      empty: [],
      isValid: Array.isArray,
    });
  },

  saveHabitCompletions(completions) {
    return writeRecord('habit-completions', completions);
  },

  getJournal() {
    return readRecord('journal', {
      empty: {},
      isValid: isPlainObject,
    });
  },

  saveJournal(entries) {
    return writeRecord('journal', entries);
  },

  getFinance() {
    return readRecord('finance', {
      empty: [],
      isValid: Array.isArray,
    });
  },

  saveFinance(transactions) {
    return writeRecord('finance', transactions);
  },

  generateId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  generateSubtaskId() {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },
};
