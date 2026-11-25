import { DatabaseSync } from 'node:sqlite';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getCountries } from '../database/country-repository';
import { getGenres } from '../database/genre-repository';
import { getMovies } from '../database/movie-repository';
import { initializeSchema } from '../database/schema';
import { syncTmdbCatalog } from './tmdb-sync-service';

const accessToken = 'test-access-token';

function tmdbResponse(data: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: vi.fn().mockResolvedValue(data),
  } as unknown as Response;
}

function movieDetails(
  id: number,
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    adult: false,
    backdrop_path: '/backdrop.jpg',
    budget: 1200,
    genres: [{ id: 18, name: 'Drama' }],
    id,
    original_language: 'fr',
    original_title: `Film ${id}`,
    overview: 'Synopsis',
    popularity: 12.5,
    poster_path: '/poster.jpg',
    production_companies: [],
    production_countries: [{ iso_3166_1: 'FR', name: 'France' }],
    release_date: '2024-01-02',
    revenue: 3400,
    runtime: 95,
    tagline: null,
    title: `Film ${id}`,
    video: false,
    vote_average: 7.5,
    vote_count: 42,
    ...overrides,
  };
}

describe('syncTmdbCatalog', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('updates genres, countries, popular movies, and their relations', async () => {
    const database = new DatabaseSync(':memory:');
    initializeSchema(database);
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        tmdbResponse({ genres: [{ id: 18, name: 'Drama' }] }),
      )
      .mockResolvedValueOnce(
        tmdbResponse([
          {
            iso_3166_1: 'FR',
            english_name: 'France',
            native_name: 'France',
          },
          {
            iso_3166_1: 'US',
            english_name: 'United States',
            native_name: '',
          },
        ]),
      )
      .mockResolvedValueOnce(
        tmdbResponse({
          page: 1,
          results: [{ id: 1 }, { id: 2 }],
          total_pages: 1,
          total_results: 2,
        }),
      )
      .mockResolvedValueOnce(tmdbResponse(movieDetails(1)))
      .mockResolvedValueOnce(
        tmdbResponse(
          movieDetails(2, {
            budget: 0,
            genres: [],
            production_countries: [],
            release_date: '',
            revenue: 0,
            runtime: null,
          }),
        ),
      );
    vi.stubGlobal('fetch', fetchMock);

    try {
      const summary = await syncTmdbCatalog(database, accessToken);

      expect(summary).toEqual({ movies: 2, genres: 1, countries: 2 });
      expect(getGenres(database)).toEqual([{ id: 18, name: 'Drama' }]);
      expect(getCountries(database)).toEqual([
        { code: 'FR', name: 'France' },
        { code: 'US', name: 'United States' },
      ]);
      expect(
        getMovies(database).map(
          ({ id, release_date, runtime_minutes, budget, revenue }) => ({
            id,
            release_date,
            runtime_minutes,
            budget,
            revenue,
          }),
        ),
      ).toEqual([
        {
          id: 1,
          release_date: '2024-01-02',
          runtime_minutes: 95,
          budget: 1200,
          revenue: 3400,
        },
        {
          id: 2,
          release_date: null,
          runtime_minutes: null,
          budget: null,
          revenue: null,
        },
      ]);
      expect(
        database.prepare('SELECT movie_id, genre_id FROM movie_genres').all(),
      ).toEqual([{ movie_id: 1, genre_id: 18 }]);
      expect(
        database
          .prepare('SELECT movie_id, country_code FROM production_countries')
          .all(),
      ).toEqual([{ movie_id: 1, country_code: 'FR' }]);
      expect(fetchMock).toHaveBeenCalledTimes(5);
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/movie/popular?language=fr-FR&page=1&region=FR',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${accessToken}`,
          }),
        }),
      );
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/movie/1?language=fr-FR',
        expect.any(Object),
      );
    } finally {
      database.close();
    }
  });

  it('does not write catalog data when a TMDB request fails', async () => {
    const database = new DatabaseSync(':memory:');
    initializeSchema(database);
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(tmdbResponse({}, false, 503))
      .mockResolvedValueOnce(tmdbResponse([]))
      .mockResolvedValueOnce(tmdbResponse({ results: [] }));
    vi.stubGlobal('fetch', fetchMock);

    try {
      await expect(syncTmdbCatalog(database, accessToken)).rejects.toThrow(
        'TMDB API request failed for /genre/movie/list?language=fr-FR with status 503',
      );
      expect(getGenres(database)).toEqual([]);
      expect(getCountries(database)).toEqual([]);
      expect(getMovies(database)).toEqual([]);
    } finally {
      database.close();
    }
  });

  it('synchronizes the reference lists when no popular movies are returned', async () => {
    const database = new DatabaseSync(':memory:');
    initializeSchema(database);
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(tmdbResponse({ genres: [] }))
      .mockResolvedValueOnce(tmdbResponse([]))
      .mockResolvedValueOnce(
        tmdbResponse({
          page: 1,
          results: [],
          total_pages: 0,
          total_results: 0,
        }),
      );
    vi.stubGlobal('fetch', fetchMock);

    try {
      await expect(syncTmdbCatalog(database, accessToken)).resolves.toEqual({
        movies: 0,
        genres: 0,
        countries: 0,
      });
      expect(fetchMock).toHaveBeenCalledTimes(3);
    } finally {
      database.close();
    }
  });
});
