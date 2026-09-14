import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as cloudDataService from '../services/cloudDataService.js';

const firestore = vi.hoisted(() => ({
  collection: vi.fn((_db, ...segments) => ({ path: segments.join('/') })),
  deleteDoc: vi.fn(),
  doc: vi.fn((parent, id) => ({ path: `${parent.path}/${id}` })),
  onSnapshot: vi.fn(),
  setDoc: vi.fn(),
}));

vi.mock('../services/firebase.js', () => ({ db: { name: 'test-db' } }));

vi.mock('firebase/firestore', () => firestore);

describe('cloudDataService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('writes a task only below the active user path', async () => {
    firestore.setDoc.mockResolvedValue();

    await cloudDataService.setRecord('alice', 'tasks', 'task-1', { title: 'Pay rent' });

    expect(firestore.setDoc).toHaveBeenCalledWith(
      { path: 'users/alice/tasks/task-1' },
      { title: 'Pay rent' },
    );
  });

  it('unsubscribes a collection listener', () => {
    const firestoreUnsubscribe = vi.fn();
    firestore.onSnapshot.mockReturnValue(firestoreUnsubscribe);

    const unsubscribe = cloudDataService.subscribeCollection('alice', 'tasks', vi.fn(), vi.fn());
    unsubscribe();

    expect(firestoreUnsubscribe).toHaveBeenCalledOnce();
  });
});
