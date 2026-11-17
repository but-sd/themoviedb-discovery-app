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

const movie = (id: number, title: string): Movie => ({
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

  it('updates an existing movie and lists movies by id', () => {
    const database = new DatabaseSync(':memory:');
    initializeSchema(database);

    try {
      saveMovies(database, [movie(20, 'Later'), movie(10, 'Earlier')]);
      saveMovie(database, {
        ...movie(20, 'Updated'),
        overview: 'Updated overview',
      });

      expect(getMovies(database)).toEqual([
        movie(10, 'Earlier'),
        { ...movie(20, 'Updated'), overview: 'Updated overview' },
      ]);
    } finally {
      database.close();
    }
  });

  it('rolls back all changes when saving movies fails', () => {
    const database = new DatabaseSync(':memory:');
    initializeSchema(database);
    const error = new Error('Unable to read movies');

    function* failingMovies(): Iterable<Movie> {
      yield movie(1, 'Movie');
      throw error;
    }

    try {
      expect(() => saveMovies(database, failingMovies())).toThrow(error);
      expect(getMovies(database)).toEqual([]);
    } finally {
      database.close();
    }
  });
});
