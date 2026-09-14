const RECORDS = {
  tasks: { key: 'tasks', empty: [], isValid: isObjectArrayWithId },
  categories: { key: 'categories', empty: [], isValid: (value) => Array.isArray(value) && value.every((item) => typeof item === 'string') },
  habits: { key: 'habits', empty: [], isValid: isObjectArrayWithId },
  habitCompletions: { key: 'habit-completions', empty: [], isValid: isCompletionArray },
  journal: { key: 'journal', empty: {}, isValid: isJournal },
  finance: { key: 'finance', empty: [], isValid: isObjectArrayWithId },
  settings: { key: 'settings', empty: {}, isValid: isPlainObject },
};

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isObjectArrayWithId(value) {
  return Array.isArray(value) && value.every((item) => isPlainObject(item) && hasText(item.id));
}

function isCompletionArray(value) {
  return Array.isArray(value) && value.every((item) => (
    isPlainObject(item) && hasText(item.habitId) && hasText(item.date)
  ));
}

function isJournal(value) {
  return isPlainObject(value) && Object.entries(value).every(([date, entry]) => hasText(date) && isPlainObject(entry));
}

function parse(key, empty, isValid) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return empty;
    const value = JSON.parse(raw);
    return isValid(value) ? value : empty;
  } catch {
    return empty;
  }
}

function usernamesFromUsers() {
  const users = parse('taskeep-users', [], Array.isArray);
  return users
    .filter(isPlainObject)
    .map((user) => user.username)
    .filter(hasText)
    .map((username) => username.trim());
}

export function listAccounts() {
  const session = parse('taskeep-session', {}, isPlainObject);
  const selectedUsername = hasText(session.username) ? session.username.trim() : null;
  const accounts = [...new Set([
    ...usernamesFromUsers(),
    ...(selectedUsername ? [selectedUsername] : []),
  ])];
  return { accounts, selectedUsername: selectedUsername && accounts.includes(selectedUsername) ? selectedUsername : null };
}

export function readSnapshot(username) {
  const safeUsername = hasText(username) ? username.trim() : '';
  const snapshot = { username: safeUsername };
  Object.entries(RECORDS).forEach(([name, record]) => {
    snapshot[name] = safeUsername
      ? parse(`${safeUsername}:${record.key}`, record.empty, record.isValid)
      : record.empty;
  });
  return snapshot;
}

export function getSummary(snapshot) {
  return {
    tasks: Array.isArray(snapshot?.tasks) ? snapshot.tasks.length : 0,
    categories: Array.isArray(snapshot?.categories) ? snapshot.categories.length : 0,
    habits: Array.isArray(snapshot?.habits) ? snapshot.habits.length : 0,
    habitCompletions: Array.isArray(snapshot?.habitCompletions) ? snapshot.habitCompletions.length : 0,
    journal: isPlainObject(snapshot?.journal) ? Object.keys(snapshot.journal).length : 0,
    finance: Array.isArray(snapshot?.finance) ? snapshot.finance.length : 0,
    settings: isPlainObject(snapshot?.settings) ? Object.keys(snapshot.settings).length : 0,
  };
}
