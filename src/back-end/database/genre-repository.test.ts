import { DatabaseSync } from 'node:sqlite';
import { describe, expect, it } from 'vitest';
import { getGenreById, getGenres, upsertGenres } from './genre-repository.ts';
import { initializeSchema } from './schema.ts';

describe('genre-repository', () => {
  it('reads, inserts, updates, and orders genres from any iterable', () => {
    const database = new DatabaseSync(':memory:');
    initializeSchema(database);

    try {
      expect(getGenreById(database, 18)).toBeUndefined();
      expect(getGenres(database)).toEqual([]);

      upsertGenres(database, new Set([{ id: 35, name: 'Comedy' }]));
      upsertGenres(database, [
        { id: 18, name: 'Drama' },
        { id: 35, name: 'Comedie' },
        { id: 35, name: 'Comedy' },
      ]);

      expect(getGenreById(database, 18)).toEqual({ id: 18, name: 'Drama' });
      expect(getGenres(database)).toEqual([
        { id: 18, name: 'Drama' },
        { id: 35, name: 'Comedy' },
      ]);
    } finally {
      database.close();
    }
  });

  it('leaves genres unchanged for an empty iterable and rejects missing names', () => {
    const database = new DatabaseSync(':memory:');
    initializeSchema(database);

    try {
      upsertGenres(database, []);
      expect(() => upsertGenres(database, [{ id: 18 } as never])).toThrow();
    } finally {
      database.close();
    }
  });
});
