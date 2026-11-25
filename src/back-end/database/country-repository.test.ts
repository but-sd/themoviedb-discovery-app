import { DatabaseSync } from 'node:sqlite';
import { afterEach, describe, expect, it } from 'vitest';
import { initializeSchema } from './schema';
import {
  getCountries,
  getCountryByCode,
  upsertCountries,
} from './country-repository';
import type { Country } from '../types/Country';

describe('country repository', () => {
  const databases: DatabaseSync[] = [];

  afterEach(() => {
    for (const database of databases) {
      database.close();
    }
    databases.length = 0;
  });

  function createDatabase(): DatabaseSync {
    const database = new DatabaseSync(':memory:');
    initializeSchema(database);
    databases.push(database);
    return database;
  }

  it('finds an existing country and returns undefined for an unknown code', () => {
    // Arrange
    const database = createDatabase();
    upsertCountries(database, [{ code: 'FR', name: 'France' }]);

    // Act
    const existingCountry = getCountryByCode(database, 'FR');
    const missingCountry = getCountryByCode(database, 'ZZ');

    // Assert
    expect(existingCountry).toEqual({ code: 'FR', name: 'France' });
    expect(missingCountry).toBeUndefined();
  });

  it('returns an empty list when no country is registered', () => {
    // Arrange
    const database = createDatabase();

    // Act
    const countries = getCountries(database);

    // Assert
    expect(countries).toEqual([]);
  });

  it('lists countries in ascending code order', () => {
    // Arrange
    const database = createDatabase();
    upsertCountries(database, [
      { code: 'US', name: 'United States' },
      { code: 'FR', name: 'France' },
      { code: 'DE', name: 'Germany' },
    ]);

    // Act
    const countries = getCountries(database);

    // Assert
    expect(countries).toEqual([
      { code: 'DE', name: 'Germany' },
      { code: 'FR', name: 'France' },
      { code: 'US', name: 'United States' },
    ]);
  });

  it('accepts arrays and other iterables and updates without duplicates', () => {
    // Arrange
    const database = createDatabase();
    const countryIterable = new Set<Country>([
      { code: 'FR', name: 'France' },
      { code: 'JP', name: 'Japan' },
    ]);

    // Act
    upsertCountries(database, countryIterable);
    upsertCountries(database, [{ code: 'FR', name: 'French Republic' }]);

    // Assert
    expect(getCountries(database)).toEqual([
      { code: 'FR', name: 'French Republic' },
      { code: 'JP', name: 'Japan' },
    ]);
    expect(
      database
        .prepare('SELECT COUNT(*) AS count FROM countries WHERE code = ?')
        .get('FR'),
    ).toEqual({ count: 1 });
  });

  it('does not modify data for an empty iterable and keeps the last repeated label', () => {
    // Arrange
    const database = createDatabase();
    upsertCountries(database, [{ code: 'FR', name: 'France' }]);

    // Act
    upsertCountries(database, []);
    upsertCountries(database, [
      { code: 'FR', name: 'First label' },
      { code: 'FR', name: 'Last label' },
    ]);

    // Assert
    expect(getCountryByCode(database, 'FR')).toEqual({
      code: 'FR',
      name: 'Last label',
    });
  });

  it('rolls back the complete import when a country name is invalid', () => {
    // Arrange
    const database = createDatabase();
    upsertCountries(database, [{ code: 'FR', name: 'France' }]);

    // Act and assert
    expect(() =>
      upsertCountries(database, [
        { code: 'DE', name: 'Germany' },
        { code: 'JP', name: null as unknown as string },
      ]),
    ).toThrow(/NOT NULL constraint failed/);
    expect(getCountries(database)).toEqual([{ code: 'FR', name: 'France' }]);
  });
});
