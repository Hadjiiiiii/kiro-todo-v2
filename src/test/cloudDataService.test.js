import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as cloudDataService from '../services/cloudDataService.js';

const firestore = vi.hoisted(() => ({
  collection: vi.fn((_db, ...segments) => ({ path: segments.join('/') })),
  deleteDoc: vi.fn(),
  doc: vi.fn((parent, id) => ({ path: `${parent.path}/${id}` })),
  onSnapshot: vi.fn(),
  setDoc: vi.fn(),
  writeBatch: vi.fn(),
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

  it('splits 401 imported tasks into batches no larger than 400 before writing the marker', async () => {
    const batches = [];
    firestore.writeBatch.mockImplementation(() => {
      const batch = { set: vi.fn(), commit: vi.fn().mockResolvedValue() };
      batches.push(batch);
      return batch;
    });
    firestore.setDoc.mockResolvedValue();
    const snapshot = {
      username: 'old-user',
      tasks: Array.from({ length: 401 }, (_, index) => ({ id: `task-${index}`, title: `Task ${index}` })),
      categories: [], habits: [], habitCompletions: [], journal: {}, finance: [], settings: {},
    };

    const result = await cloudDataService.importLegacySnapshot('new-user', snapshot);

    expect(batches).toHaveLength(2);
    expect(batches.map((batch) => batch.set.mock.calls.length)).toEqual([400, 1]);
    expect(firestore.setDoc).toHaveBeenCalledWith(
      { path: 'users/new-user/meta/migration' },
      expect.objectContaining({
        sourceUsername: 'old-user',
        counts: expect.objectContaining({ tasks: 401 }),
      }),
    );
    expect(result.counts.tasks).toBe(401);
  });

  it('does not write the migration marker when an import batch fails', async () => {
    const batch = { set: vi.fn(), commit: vi.fn().mockRejectedValue(new Error('offline')) };
    firestore.writeBatch.mockReturnValue(batch);

    await expect(cloudDataService.importLegacySnapshot('new-user', {
      username: 'old-user', tasks: [{ id: 'task-1', title: 'Keep me' }],
      categories: [], habits: [], habitCompletions: [], journal: {}, finance: [], settings: {},
    })).rejects.toThrow('offline');

    expect(firestore.setDoc).not.toHaveBeenCalled();
  });
});
