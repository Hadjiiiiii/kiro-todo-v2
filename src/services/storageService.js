import { DEFAULT_CATEGORIES } from '../constants';

let _userPrefix = '';

function key(base) {
  return _userPrefix ? `${_userPrefix}:${base}` : base;
}

export const storageService = {
  /**
   * Set the current user prefix for all storage operations.
   * Call this when user logs in/out.
   */
  setUser(username) {
    _userPrefix = username || '';
  },

  getUser() {
    return _userPrefix;
  },

  getTasks() {
    try {
      const data = localStorage.getItem(key('tasks'));
      if (!data) return [];
      const tasks = JSON.parse(data);
      if (!Array.isArray(tasks)) return [];
      return tasks.map((task) => ({
        subtasks: [],
        recurrence: 'none',
        completedAt: null,
        ...task,
      }));
    } catch {
      return [];
    }
  },

  saveTasks(tasks) {
    try {
      localStorage.setItem(key('tasks'), JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to save tasks:', error);
    }
  },

  getSettings() {
    try {
      const data = localStorage.getItem(key('settings'));
      if (!data) return {};
      return JSON.parse(data);
    } catch {
      return {};
    }
  },

  saveSettings(settings) {
    try {
      localStorage.setItem(key('settings'), JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  },

  getCategories() {
    try {
      const data = localStorage.getItem(key('categories'));
      if (!data) return DEFAULT_CATEGORIES;
      const categories = JSON.parse(data);
      if (!Array.isArray(categories) || categories.length === 0) return DEFAULT_CATEGORIES;
      return categories;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  },

  saveCategories(categories) {
    try {
      localStorage.setItem(key('categories'), JSON.stringify(categories));
    } catch (error) {
      console.error('Failed to save categories:', error);
    }
  },

  getHabits() {
    try {
      const data = localStorage.getItem(key('habits'));
      if (!data) return [];
      const habits = JSON.parse(data);
      return Array.isArray(habits) ? habits : [];
    } catch {
      return [];
    }
  },

  saveHabits(habits) {
    try {
      localStorage.setItem(key('habits'), JSON.stringify(habits));
    } catch (error) {
      console.error('Failed to save habits:', error);
    }
  },

  getHabitCompletions() {
    try {
      const data = localStorage.getItem(key('habit-completions'));
      if (!data) return [];
      const completions = JSON.parse(data);
      return Array.isArray(completions) ? completions : [];
    } catch {
      return [];
    }
  },

  saveHabitCompletions(completions) {
    try {
      localStorage.setItem(key('habit-completions'), JSON.stringify(completions));
    } catch (error) {
      console.error('Failed to save habit completions:', error);
    }
  },

  getJournal() {
    try {
      const data = localStorage.getItem(key('journal'));
      if (!data) return {};
      const entries = JSON.parse(data);
      return typeof entries === 'object' && entries !== null ? entries : {};
    } catch {
      return {};
    }
  },

  saveJournal(entries) {
    try {
      localStorage.setItem(key('journal'), JSON.stringify(entries));
    } catch (error) {
      console.error('Failed to save journal:', error);
    }
  },

  getFinance() {
    try {
      const data = localStorage.getItem(key('finance'));
      if (!data) return [];
      const transactions = JSON.parse(data);
      return Array.isArray(transactions) ? transactions : [];
    } catch {
      return [];
    }
  },

  saveFinance(transactions) {
    try {
      localStorage.setItem(key('finance'), JSON.stringify(transactions));
    } catch (error) {
      console.error('Failed to save finance:', error);
    }
  },

  generateId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  generateSubtaskId() {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },
};
