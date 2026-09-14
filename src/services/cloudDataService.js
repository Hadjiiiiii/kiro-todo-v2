import { collection, deleteDoc, doc, onSnapshot, setDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase.js';

const COLLECTIONS = new Set([
  'tasks',
  'categories',
  'habits',
  'habitCompletions',
  'journal',
  'finance',
  'settings',
  'meta',
]);

function requireCollection(collectionName) {
  if (!COLLECTIONS.has(collectionName)) {
    throw new Error(`Unsupported cloud collection: ${collectionName}`);
  }
}

function userCollection(uid, collectionName) {
  requireCollection(collectionName);
  return collection(db, 'users', uid, collectionName);
}

function recordReference(uid, collectionName, id) {
  return doc(userCollection(uid, collectionName), id);
}

export function subscribeCollection(uid, collectionName, onRecords, onError) {
  return onSnapshot(
    userCollection(uid, collectionName),
    (snapshot) => onRecords(snapshot.docs.map((record) => ({ ...record.data(), id: record.id }))),
    onError,
  );
}

export function setRecord(uid, collectionName, id, value) {
  return setDoc(recordReference(uid, collectionName, id), value);
}

export function removeRecord(uid, collectionName, id) {
  return deleteDoc(recordReference(uid, collectionName, id));
}

export function subscribeDocument(uid, collectionName, id, onValue, onError) {
  return onSnapshot(
    recordReference(uid, collectionName, id),
    (snapshot) => onValue(snapshot.exists() ? snapshot.data() : null),
    onError,
  );
}

export function setDocument(uid, collectionName, id, value) {
  return setDoc(recordReference(uid, collectionName, id), value);
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function hasId(record) {
  return isPlainObject(record) && typeof record.id === 'string' && record.id.length > 0;
}

function importOperations(uid, snapshot) {
  const operations = [];
  const addRecords = (collectionName, records) => {
    if (!Array.isArray(records)) return;
    records.filter(hasId).forEach((record) => {
      operations.push({ reference: recordReference(uid, collectionName, record.id), value: record });
    });
  };

  addRecords('tasks', snapshot?.tasks);
  if (Array.isArray(snapshot?.categories) && snapshot.categories.every((category) => typeof category === 'string') && snapshot.categories.length) {
    operations.push({ reference: recordReference(uid, 'categories', 'current'), value: { categories: snapshot.categories } });
  }
  addRecords('habits', snapshot?.habits);
  if (Array.isArray(snapshot?.habitCompletions)) {
    snapshot.habitCompletions.forEach((completion) => {
      if (isPlainObject(completion) && typeof completion.habitId === 'string' && completion.habitId && typeof completion.date === 'string' && completion.date) {
        operations.push({
          reference: recordReference(uid, 'habitCompletions', `${completion.habitId}_${completion.date}`),
          value: { habitId: completion.habitId, date: completion.date },
        });
      }
    });
  }
  if (isPlainObject(snapshot?.journal)) {
    Object.entries(snapshot.journal).forEach(([date, entry]) => {
      if (date && isPlainObject(entry)) operations.push({ reference: recordReference(uid, 'journal', date), value: entry });
    });
  }
  addRecords('finance', snapshot?.finance);
  if (isPlainObject(snapshot?.settings) && Object.keys(snapshot.settings).length) {
    operations.push({ reference: recordReference(uid, 'settings', 'preferences'), value: snapshot.settings });
  }
  return operations;
}

function importedCounts(snapshot) {
  return {
    tasks: Array.isArray(snapshot?.tasks) ? snapshot.tasks.filter(hasId).length : 0,
    categories: Array.isArray(snapshot?.categories) ? snapshot.categories.filter((category) => typeof category === 'string').length : 0,
    habits: Array.isArray(snapshot?.habits) ? snapshot.habits.filter(hasId).length : 0,
    habitCompletions: Array.isArray(snapshot?.habitCompletions) ? snapshot.habitCompletions.filter((completion) => isPlainObject(completion) && completion.habitId && completion.date).length : 0,
    journal: isPlainObject(snapshot?.journal) ? Object.entries(snapshot.journal).filter(([date, entry]) => date && isPlainObject(entry)).length : 0,
    finance: Array.isArray(snapshot?.finance) ? snapshot.finance.filter(hasId).length : 0,
    settings: isPlainObject(snapshot?.settings) ? Object.keys(snapshot.settings).length : 0,
  };
}

export async function importLegacySnapshot(uid, snapshot) {
  const operations = importOperations(uid, snapshot);
  const counts = importedCounts(snapshot);

  for (let offset = 0; offset < operations.length; offset += 400) {
    const batch = writeBatch(db);
    operations.slice(offset, offset + 400).forEach(({ reference, value }) => batch.set(reference, value));
    await batch.commit();
  }

  const importedAt = new Date().toISOString();
  const migration = {
    sourceUsername: typeof snapshot?.username === 'string' ? snapshot.username : '',
    counts,
    importedAt,
    completedAt: importedAt,
  };
  await setDocument(uid, 'meta', 'migration', migration);
  return migration;
}
