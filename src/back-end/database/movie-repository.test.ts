import { DatabaseSync } from 'node:sqlite';
import { describe, expect, it } from 'vitest';
import { initializeSchema } from './schema';
import {
  getMovieById,
  getMovies,
  saveMovie,
  saveMovies,
  type Movie,
} from './movie-repository';

const movie = (id: number, title = `Movie ${id}`): Movie => ({
  id,
  title,
  original_title: title,
  original_language: 'en',
  overview: 'A movie',
  release_date: '2020-01-02',
  popularity: 10,
  vote_average: 7.5,
  vote_count: 100,
  poster_path: '/poster.jpg',
  backdrop_path: '/backdrop.jpg',
  runtime_minutes: 120,
  budget: 1000,
  revenue: 2000,
  collected_at: '2026-01-01T00:00:00.000Z',
});

const importedMovie = (id: number, title = `Movie ${id}`): Movie => ({
  ...movie(id, title),
  genre_ids: [18],
  production_country_codes: ['FR'],
});

describe('movie-repository.ts', () => {
  it('creates a movie, finds it by id, and returns an empty list when no movie exists', () => {
    const database = new DatabaseSync(':memory:');
    initializeSchema(database);

    try {
      saveMovie(database, movie(2, 'Movie'));

      expect(getMovieById(database, 2)).toEqual(movie(2, 'Movie'));
      expect(getMovieById(database, 999)).toBeUndefined();
      expect(getMovies(database)).toEqual([movie(2, 'Movie')]);
    } finally {
      database.close();
    }
  });

  it('updates movies, preserves omitted relations, and lists movies by id', () => {
    const database = new DatabaseSync(':memory:');
    initializeSchema(database);
    database
      .prepare('INSERT INTO genres (id, name) VALUES (?, ?)')
      .run(18, 'Drama');
    database
      .prepare('INSERT INTO countries (code, name) VALUES (?, ?)')
      .run('FR', 'France');

    try {
      saveMovies(database, [movie(20, 'Later'), movie(10, 'Earlier')]);
      saveMovies(database, [importedMovie(20)]);
      saveMovie(database, {
        ...movie(20, 'Updated'),
        overview: 'Updated overview',
      });

      expect(getMovies(database)).toEqual([
        movie(10, 'Earlier'),
        { ...movie(20, 'Updated'), overview: 'Updated overview' },
      ]);
      expect(
        database.prepare('SELECT movie_id, genre_id FROM movie_genres').all(),
      ).toEqual([{ movie_id: 20, genre_id: 18 }]);
      expect(
        database
          .prepare('SELECT movie_id, country_code FROM production_countries')
          .all(),
      ).toEqual([{ movie_id: 20, country_code: 'FR' }]);
    } finally {
      database.close();
    }
  });

  it('imports movies and rolls back failed imports', () => {
    const database = new DatabaseSync(':memory:');
    initializeSchema(database);
    database
      .prepare('INSERT INTO genres (id, name) VALUES (?, ?)')
      .run(18, 'Drama');
    database
      .prepare('INSERT INTO countries (code, name) VALUES (?, ?)')
      .run('FR', 'France');

    function* failingMovies(): Iterable<Movie> {
      yield importedMovie(3);
      throw new Error('import failed');
    }

    try {
      saveMovies(database, [importedMovie(2), importedMovie(1)]);
      saveMovies(database, [importedMovie(2, 'Updated')]);

      expect(
        getMovies(database).map(({ id, title }) => ({ id, title })),
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

      expect(() => saveMovies(database, failingMovies())).toThrow(
        'import failed',
      );
      expect(getMovieById(database, 3)).toBeUndefined();
    } finally {
      database.close();
    }
  });
});
