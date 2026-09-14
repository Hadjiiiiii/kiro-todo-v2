import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
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
