import { DatabaseSync } from 'node:sqlite';
import { describe, expect, it } from 'vitest';
import {
  getCountries,
  getCountryByCode,
  upsertCountries,
} from './country-repository.ts';
import { initializeSchema } from './schema.ts';

describe('country-repository', () => {
  it('reads, inserts, updates, and orders countries from any iterable', () => {
    const database = new DatabaseSync(':memory:');
    initializeSchema(database);

    try {
      expect(getCountryByCode(database, 'FR')).toBeUndefined();
      expect(getCountries(database)).toEqual([]);

      upsertCountries(
        database,
        new Set([{ code: 'US', name: 'United States' }]),
      );
      upsertCountries(database, [
        { code: 'FR', name: 'France' },
        { code: 'US', name: 'Etats-Unis' },
        { code: 'US', name: 'United States' },
      ]);

      expect(getCountryByCode(database, 'FR')).toEqual({
        code: 'FR',
        name: 'France',
      });
      expect(getCountries(database)).toEqual([
        { code: 'FR', name: 'France' },
        { code: 'US', name: 'United States' },
      ]);
    } finally {
      database.close();
    }
  });

  it('leaves countries unchanged for an empty iterable and rejects missing names', () => {
    const database = new DatabaseSync(':memory:');
    initializeSchema(database);

    try {
      upsertCountries(database, []);
      expect(() =>
        upsertCountries(database, [{ code: 'FR' } as never]),
      ).toThrow();
    } finally {
      database.close();
    }
  });
});
