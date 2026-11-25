import type { DatabaseSync } from 'node:sqlite';

export type Movie = {
  id: number;
  title: string;
  original_title: string;
  original_language: string;
  overview: string;
  release_date: string | null;
  popularity: number | null;
  vote_average: number | null;
  vote_count: number | null;
  poster_path: string | null;
  backdrop_path: string | null;
  runtime_minutes: number | null;
  budget: number | null;
  revenue: number | null;
  collected_at: string;
  genre_ids?: number[];
  production_country_codes?: string[];
};

const MOVIE_COLUMNS = `
  id, title, original_title, original_language, overview, release_date,
  popularity, vote_average, vote_count, poster_path, backdrop_path,
  runtime_minutes, budget, revenue, collected_at
`;

/**
 * Returns the movie identified by its TMDB identifier.
 */
export function getMovieById(
  database: DatabaseSync,
  id: number,
): Movie | undefined {
  return database
    .prepare(`SELECT ${MOVIE_COLUMNS} FROM movies WHERE id = ?`)
    .get(id) as unknown as Movie | undefined;
}

/**
 * Returns all movies ordered by their TMDB identifier.
 */
export function getMovies(database: DatabaseSync): Movie[] {
  return database
    .prepare(`SELECT ${MOVIE_COLUMNS} FROM movies ORDER BY id`)
    .all() as unknown as Movie[];
}

/**
 * Inserts or updates all provided movies in one transaction.
 */
export function saveMovies(
  database: DatabaseSync,
  movies: Iterable<Movie>,
): void {
  const movieStatement = database.prepare(`
    INSERT INTO movies (
      id, title, original_title, original_language, overview, release_date,
      popularity, vote_average, vote_count, poster_path, backdrop_path,
      runtime_minutes, budget, revenue, collected_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      original_title = excluded.original_title,
      original_language = excluded.original_language,
      overview = excluded.overview,
      release_date = excluded.release_date,
      vote_average = excluded.vote_average,
      popularity = excluded.popularity,
      vote_count = excluded.vote_count,
      poster_path = excluded.poster_path,
      backdrop_path = excluded.backdrop_path,
      runtime_minutes = excluded.runtime_minutes,
      budget = excluded.budget,
      revenue = excluded.revenue,
      collected_at = excluded.collected_at
  `);
  const genreStatement = database.prepare(
    `INSERT OR IGNORE INTO movie_genres (movie_id, genre_id)
     SELECT ?, ? WHERE EXISTS (SELECT 1 FROM genres WHERE id = ?)`,
  );
  const countryStatement = database.prepare(
    `INSERT OR IGNORE INTO production_countries (movie_id, country_code)
     SELECT ?, ? WHERE EXISTS (SELECT 1 FROM countries WHERE code = ?)`,
  );

  database.exec('BEGIN TRANSACTION;');
  try {
    for (const movie of movies) {
      movieStatement.run(
        movie.id,
        movie.title,
        movie.original_title,
        movie.original_language,
        movie.overview,
        movie.release_date,
        movie.popularity,
        movie.vote_average,
        movie.vote_count,
        movie.poster_path,
        movie.backdrop_path,
        movie.runtime_minutes,
        movie.budget,
        movie.revenue,
        movie.collected_at,
      );
      if (movie.genre_ids !== undefined) {
        database
          .prepare('DELETE FROM movie_genres WHERE movie_id = ?')
          .run(movie.id);
        for (const genreId of movie.genre_ids)
          genreStatement.run(movie.id, genreId, genreId);
      }
      if (movie.production_country_codes !== undefined) {
        database
          .prepare('DELETE FROM production_countries WHERE movie_id = ?')
          .run(movie.id);
        for (const code of movie.production_country_codes)
          countryStatement.run(movie.id, code, code);
      }
    }
    database.exec('COMMIT;');
  } catch (error) {
    database.exec('ROLLBACK;');
    throw error;
  }
}

/**
 * Inserts or updates one movie.
 */
export function saveMovie(database: DatabaseSync, movie: Movie): void {
  saveMovies(database, [movie]);
}
