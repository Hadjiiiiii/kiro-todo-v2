import { beforeEach, describe, expect, it } from 'vitest';
import { getSummary, listAccounts, readSnapshot } from '../services/legacyDataService.js';

describe('legacyDataService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('reads records without changing localStorage', () => {
    localStorage.setItem('old-user:tasks', JSON.stringify([{ id: 'task-1', title: 'Keep me' }]));

    const snapshot = readSnapshot('old-user');

    expect(snapshot.tasks).toEqual([{ id: 'task-1', title: 'Keep me' }]);
    expect(localStorage.getItem('old-user:tasks')).toBe(JSON.stringify([{ id: 'task-1', title: 'Keep me' }]));
  });

  it('uses only usernames from safe account and session shapes', () => {
    localStorage.setItem('taskeep-users', JSON.stringify([
      { username: 'ana', passwordHash: 'do-not-read' },
      { username: '' },
      'not-an-account',
    ]));
    localStorage.setItem('taskeep-session', JSON.stringify({ username: 'ben' }));

    expect(listAccounts()).toEqual({ accounts: ['ana', 'ben'], selectedUsername: 'ben' });
  });

  it('finds usernames in the original object-keyed account store', () => {
    localStorage.setItem('taskeep-users', JSON.stringify({ ana: { passwordHash: 'never-import' } }));

    expect(listAccounts()).toEqual({ accounts: ['ana'], selectedUsername: null });
  });

  it('returns safe empty records when legacy values are malformed or unexpected', () => {
    localStorage.setItem('old-user:tasks', '{');
    localStorage.setItem('old-user:categories', JSON.stringify({ not: 'an array' }));
    localStorage.setItem('old-user:journal', JSON.stringify([]));

    const snapshot = readSnapshot('old-user');

    expect(snapshot).toMatchObject({
      username: 'old-user',
      tasks: [],
      categories: [],
      habits: [],
      habitCompletions: [],
      journal: {},
      finance: [],
      settings: {},
    });
    expect(getSummary(snapshot)).toEqual({
      tasks: 0,
      categories: 0,
      habits: 0,
      habitCompletions: 0,
      journal: 0,
      finance: 0,
      settings: 0,
    });
  });
});
