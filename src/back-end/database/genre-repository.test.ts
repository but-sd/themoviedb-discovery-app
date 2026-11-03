import { DatabaseSync } from 'node:sqlite';
import { describe, expect, it } from 'vitest';
import { findAllGenres, findGenreById, upsertGenre } from './genre-repository';
import { initializeSchema } from './schema';

describe('genre-repository', () => {
  it('finds a genre by identifier and returns undefined when it does not exist', () => {
    const database = createDatabase();
    upsertGenre(database, { id: 28, name: 'Action' });

    expect(findGenreById(database, 28)).toEqual({ id: 28, name: 'Action' });
    expect(findGenreById(database, 18)).toBeUndefined();
    database.close();
  });

  it('lists genres ordered by identifier', () => {
    const database = createDatabase();
    upsertGenre(database, { id: 28, name: 'Action' });
    upsertGenre(database, { id: 18, name: 'Drama' });

    expect(findAllGenres(database)).toEqual([
      { id: 18, name: 'Drama' },
      { id: 28, name: 'Action' },
    ]);
    database.close();
  });

  it('inserts a genre and updates its label on an existing identifier', () => {
    const database = createDatabase();

    upsertGenre(database, { id: 28, name: 'Action' });
    upsertGenre(database, { id: 28, name: 'Action updated' });

    expect(findGenreById(database, 28)).toEqual({
      id: 28,
      name: 'Action updated',
    });
    database.close();
  });
});

function createDatabase(): DatabaseSync {
  const database = new DatabaseSync(':memory:');
  initializeSchema(database);
  return database;
}
