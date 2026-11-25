import type { DatabaseSync } from 'node:sqlite';
import { saveCountries, type Country } from '../database/country-repository';
import { saveGenres, type Genre } from '../database/genre-repository';
import { saveMovies, type Movie } from '../database/movie-repository';
import {
  DEFAULT_LANGUAGE,
  DEFAULT_PAGE,
  DEFAULT_REGION,
} from '../utils/constants';
import type {
  TmdbMovieDetails,
  TmdbMoviesRawResponse,
} from '../types/MoviesTypes';

const TMDB_API_URL = 'https://api.themoviedb.org/3';

type TmdbGenreResponse = {
  genres: Genre[];
};

type TmdbCountry = {
  iso_3166_1: string;
  english_name: string;
  native_name: string;
};

type TmdbMovieDetailsForSync = TmdbMovieDetails & {
  runtime: number | null;
  budget: number;
  revenue: number;
  production_countries: Array<{ iso_3166_1: string; name: string }>;
};

type SyncSummary = {
  movies: number;
  genres: number;
  countries: number;
};

async function fetchTmdb<T>(path: string, accessToken: string): Promise<T> {
  const response = await fetch(`${TMDB_API_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json;charset=utf-8',
    },
  });

  if (!response.ok) {
    throw new Error(
      `TMDB API request failed for ${path} with status ${response.status}`,
    );
  }

  return (await response.json()) as T;
}

function toDatabaseMovie(movie: TmdbMovieDetailsForSync): Movie {
  const positiveOrNull = (value: number | null): number | null =>
    value !== null && value > 0 ? value : null;

  return {
    id: movie.id,
    title: movie.title,
    original_title: movie.original_title,
    original_language: movie.original_language,
    overview: movie.overview,
    release_date: movie.release_date || null,
    popularity: movie.popularity,
    vote_average: movie.vote_average,
    vote_count: movie.vote_count,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    runtime_minutes: positiveOrNull(movie.runtime),
    budget: positiveOrNull(movie.budget),
    revenue: positiveOrNull(movie.revenue),
    collected_at: new Date().toISOString(),
    genre_ids: movie.genres.map(({ id }) => id),
    production_country_codes: movie.production_countries.map(
      ({ iso_3166_1 }) => iso_3166_1,
    ),
  };
}

/**
 * Synchronizes the default popular movie page and TMDB genre and country lists.
 * Network requests finish before any catalog data is written to the database.
 */
export async function syncTmdbCatalog(
  database: DatabaseSync,
  accessToken: string,
): Promise<SyncSummary> {
  const movieQuery = new URLSearchParams({
    language: DEFAULT_LANGUAGE,
    page: String(DEFAULT_PAGE),
    region: DEFAULT_REGION,
  });
  const languageQuery = new URLSearchParams({ language: DEFAULT_LANGUAGE });

  const [genreResponse, tmdbCountries, popularResponse] = await Promise.all([
    fetchTmdb<TmdbGenreResponse>(
      `/genre/movie/list?${languageQuery.toString()}`,
      accessToken,
    ),
    fetchTmdb<TmdbCountry[]>(
      `/configuration/countries?${languageQuery.toString()}`,
      accessToken,
    ),
    fetchTmdb<TmdbMoviesRawResponse>(
      `/movie/popular?${movieQuery.toString()}`,
      accessToken,
    ),
  ]);
  const countries: Country[] = tmdbCountries.map((country) => ({
    code: country.iso_3166_1,
    name: country.native_name || country.english_name,
  }));
  const movies: Movie[] = [];

  for (const popularMovie of popularResponse.results) {
    const detailsQuery = new URLSearchParams({
      language: DEFAULT_LANGUAGE,
    });
    const details = await fetchTmdb<TmdbMovieDetailsForSync>(
      `/movie/${popularMovie.id}?${detailsQuery.toString()}`,
      accessToken,
    );
    movies.push(toDatabaseMovie(details));
  }

  saveGenres(database, genreResponse.genres);
  saveCountries(database, countries);
  saveMovies(database, movies);

  return {
    movies: movies.length,
    genres: genreResponse.genres.length,
    countries: countries.length,
  };
}
