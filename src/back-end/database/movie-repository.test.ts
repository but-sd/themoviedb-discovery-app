import { DatabaseSync } from 'node:sqlite';
import { describe, expect, it } from 'vitest';
import { initializeSchema } from './schema';
import { saveMovies, type Movie } from './movie-repository';

const movie = (id: number): Movie => ({
  id,
  title: `Movie ${id}`,
  original_title: `Movie ${id}`,
  original_language: 'en',
  overview: 'Overview',
  release_date: '2020-01-01',
  popularity: 10,
  vote_average: 7,
  vote_count: 10,
  poster_path: null,
  backdrop_path: null,
  runtime_minutes: 100,
  budget: null,
  revenue: null,
  collected_at: '2026-01-01',
  genre_ids: [18],
  production_country_codes: ['FR'],
});

describe('movie-repository.ts', () => {
  it('imports movies, updates relations, and rolls back failed imports', () => {
    const database = new DatabaseSync(':memory:');
    initializeSchema(database);
    database
      .prepare('INSERT INTO genres (id, name) VALUES (?, ?)')
      .run(18, 'Drama');
    database
      .prepare('INSERT INTO countries (code, name) VALUES (?, ?)')
      .run('FR', 'France');

    try {
      saveMovies(database, [movie(2), movie(1)]);
      saveMovies(database, [{ ...movie(2), title: 'Updated' }]);

      expect(
        database.prepare('SELECT id, title FROM movies ORDER BY id').all(),
      ).toEqual([
        { id: 1, title: 'Movie 1' },
        { id: 2, title: 'Updated' },
      ]);
      expect(
        database.prepare('SELECT movie_id, genre_id FROM movie_genres').all(),
      ).toEqual([
        { movie_id: 1, genre_id: 18 },
        { movie_id: 2, genre_id: 18 },
      ]);

      function* failingMovies(): Iterable<Movie> {
        yield movie(3);
        throw new Error('import failed');
      }

      expect(() => saveMovies(database, failingMovies())).toThrow(
        'import failed',
      );
      expect(
        database.prepare('SELECT id FROM movies WHERE id = 3').all(),
      ).toEqual([]);
    } finally {
      database.close();
    }
  });
});
