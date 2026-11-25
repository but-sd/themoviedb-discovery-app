#!/usr/bin/env node
import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'csv-parse/sync';
import { DEFAULT_DATABASE_PATH, getDatabase } from './database/schema.ts';
import {
  deleteUnreferencedCountries,
  saveCountries,
  type Country,
} from './database/country-repository.ts';
import type { Genre } from './database/genre-repository.ts';
import { deleteUnusedGenres, saveGenres } from './database/genre-repository.ts';
import { saveMovies, type Movie } from './database/movie-repository.ts';
import { syncTmdbCatalog } from './services/tmdb-sync-service.ts';

export function parseCountriesCsv(content: string): Country[] {
  let records: string[][];
  try {
    records = parse(content, {
      bom: true,
      relax_column_count: true,
      skip_empty_lines: true,
      trim: true,
    }) as string[][];
  } catch (error) {
    throw new Error(
      `Invalid countries CSV syntax: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const [headers, ...rows] = records;
  if (
    !headers ||
    headers.length !== 2 ||
    new Set(headers.map((header) => header.toLowerCase())).size !== 2 ||
    !headers.every((header) => ['code', 'name'].includes(header.toLowerCase()))
  ) {
    throw new Error('Invalid countries CSV headers: expected code and name');
  }

  const codeIndex = headers.findIndex(
    (header) => header.toLowerCase() === 'code',
  );
  const nameIndex = headers.findIndex(
    (header) => header.toLowerCase() === 'name',
  );

  return rows.map((row, index) => {
    if (row.length !== 2) {
      throw new Error(
        `Invalid countries CSV row ${index + 2}: expected code and name`,
      );
    }

    const code = row[codeIndex];
    const name = row[nameIndex];
    if (!code || !/^[A-Z]{2}$/.test(code)) {
      throw new Error(
        `Invalid country code at row ${index + 2}: expected two uppercase letters`,
      );
    }
    if (!name) {
      throw new Error(
        `Invalid country name at row ${index + 2}: value cannot be empty`,
      );
    }

    return { code, name };
  });
}

function readCountriesCsv(path: string): Country[] {
  return parseCountriesCsv(readFileSync(path, 'utf8'));
}

const MOVIE_HEADERS = [
  'id',
  'title',
  'original_title',
  'original_language',
  'overview',
  'release_date',
  'popularity',
  'vote_average',
  'vote_count',
  'poster_path',
  'backdrop_path',
  'runtime',
  'budget',
  'revenue',
  'genres',
  'production_countries',
];

export function parseMoviesCsv(content: string): Movie[] {
  let records: string[][];
  try {
    records = parse(content, {
      bom: true,
      columns: false,
      relax_column_count: true,
      skip_empty_lines: true,
      trim: true,
    }) as string[][];
  } catch (error) {
    throw new Error(
      `Invalid movies CSV syntax: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const [headers, ...rows] = records;
  if (
    !headers ||
    headers.length !== MOVIE_HEADERS.length ||
    headers.some((header, index) => header !== MOVIE_HEADERS[index])
  ) {
    throw new Error('Invalid movies CSV headers');
  }

  return rows.map((row, index) => {
    if (row.length !== MOVIE_HEADERS.length) {
      throw new Error(`Invalid movie CSV row ${index + 2}`);
    }
    const number = (value: string): number | null =>
      value === '' ? null : Number(value);
    const json = <T>(value: string): T => {
      try {
        return JSON.parse(value) as T;
      } catch {
        throw new Error(`Invalid movie JSON on CSV line ${index + 2}`);
      }
    };
    const id = Number(row[0]);
    if (!Number.isInteger(id) || row[1] === '' || row[3] === '') {
      throw new Error(`Invalid movie on CSV line ${index + 2}`);
    }
    const genres = json<number[]>(row[14]);
    const countries = json<Array<{ iso_3166_1: string }>>(row[15]);
    if (
      !genres.every(Number.isInteger) ||
      !countries.every((country) => country.iso_3166_1)
    ) {
      throw new Error(`Invalid movie relations on CSV line ${index + 2}`);
    }
    return {
      id,
      title: row[1],
      original_title: row[2],
      original_language: row[3],
      overview: row[4],
      release_date: row[5] || null,
      popularity: number(row[6]),
      vote_average: number(row[7]),
      vote_count: number(row[8]),
      poster_path: row[9] || null,
      backdrop_path: row[10] || null,
      runtime_minutes: number(row[11]),
      budget: number(row[12]),
      revenue: number(row[13]),
      collected_at: new Date().toISOString(),
      genre_ids: genres,
      production_country_codes: countries.map((country) => country.iso_3166_1),
    };
  });
}

export function addMovies(
  databasePath = DEFAULT_DATABASE_PATH,
  csvPath = resolve('data/movies.csv'),
): void {
  const database = getDatabase(databasePath);
  try {
    const movies = parseMoviesCsv(readFileSync(csvPath, 'utf8'));
    saveMovies(database, movies);
    console.log(`Imported ${movies.length} movies from ${resolve(csvPath)}`);
  } finally {
    database.close();
  }
}

const DEFAULT_GENRES_PATH = resolve('data/genres.csv');

function parseGenresCsv(csv: string): Genre[] {
  const [header, ...rows] = csv.trim().split(/\r?\n/);
  if (header !== 'id,name') {
    throw new Error('The genres CSV must start with the "id,name" header');
  }

  return rows
    .filter((row) => row.trim() !== '')
    .map((row, index) => {
      const [idValue, ...nameParts] = row.split(',');
      const id = Number(idValue);
      const name = nameParts.join(',').trim();

      if (!Number.isInteger(id) || name === '') {
        throw new Error(`Invalid genre on CSV line ${index + 2}`);
      }

      return { id, name };
    });
}

export function addGenres(
  databasePath = DEFAULT_DATABASE_PATH,
  csvPath = DEFAULT_GENRES_PATH,
): void {
  const database = getDatabase(databasePath);
  try {
    const genres = parseGenresCsv(readFileSync(csvPath, 'utf8'));
    saveGenres(database, genres);
    console.log(`Imported ${genres.length} genres from ${resolve(csvPath)}`);
  } finally {
    database.close();
  }
}

export function cleanGenres(databasePath = DEFAULT_DATABASE_PATH): void {
  const database = getDatabase(databasePath);
  try {
    deleteUnusedGenres(database);
    console.log('Unused genres removed');
  } finally {
    database.close();
  }
}

/** Command-line interface for movie database operations. */
const program = new Command().description('CLI for movie database operations');

program
  .command('create-database')
  .description('Create and initialize the movies database schema')
  .option(
    '-p, --path <path>',
    'path to the SQLite database file',
    DEFAULT_DATABASE_PATH,
  )
  .action(({ path }: { path: string }) => {
    const database = getDatabase(path);
    database.close();
    console.log(`Database available at ${resolve(path)}`);
  });

program
  .command('sync-database')
  .description('Synchronize the popular movies catalog from TMDB')
  .option(
    '-p, --path <path>',
    'path to the SQLite database file',
    DEFAULT_DATABASE_PATH,
  )
  .action(async ({ path }: { path: string }) => {
    const database = getDatabase(path);
    try {
      const { tmdbAccessToken } = await import('./utils/config');
      if (!tmdbAccessToken) {
        throw new Error(
          'TMDB_ACCESS_TOKEN is not defined in the environment variables.',
        );
      }
      const summary = await syncTmdbCatalog(database, tmdbAccessToken);
      console.log(
        `Synchronized ${summary.movies} movies, ${summary.genres} genres and ${summary.countries} countries`,
      );
    } finally {
      database.close();
    }
  });

program
  .command('add-countries <csv-file>')
  .description('Import countries from a CSV file')
  .option(
    '-p, --path <path>',
    'path to the SQLite database file',
    DEFAULT_DATABASE_PATH,
  )
  .action((csvFile: string, { path }: { path: string }) => {
    const countries = readCountriesCsv(csvFile);
    let database: ReturnType<typeof getDatabase> | undefined;
    try {
      database = getDatabase(path);
      saveCountries(database, countries);
      console.log(
        `${countries.length} countries imported/updated in ${resolve(path)}`,
      );
    } finally {
      database?.close();
    }
  });

program
  .command('clean-countries')
  .description('Remove countries not referenced by any movie')
  .option(
    '-p, --path <path>',
    'path to the SQLite database file',
    DEFAULT_DATABASE_PATH,
  )
  .action(({ path }: { path: string }) => {
    let database: ReturnType<typeof getDatabase> | undefined;
    try {
      database = getDatabase(path);
      const deletedCount = deleteUnreferencedCountries(database);
      console.log(`${deletedCount} countries deleted from ${resolve(path)}`);
    } finally {
      database?.close();
    }
  });

program
  .command('add-genres')
  .description('Import genres from a CSV file')
  .option(
    '-p, --path <path>',
    'path to the SQLite database file',
    DEFAULT_DATABASE_PATH,
  )
  .option(
    '-f, --file <path>',
    'path to the genres CSV file',
    DEFAULT_GENRES_PATH,
  )
  .action(({ path, file }: { path: string; file: string }) => {
    addGenres(path, file);
  });

program
  .command('clean-genres')
  .description('Remove genres that are not used by any movie')
  .option(
    '-p, --path <path>',
    'path to the SQLite database file',
    DEFAULT_DATABASE_PATH,
  )
  .action(({ path }: { path: string }) => {
    cleanGenres(path);
  });

program
  .command('add-movies <csv-file>')
  .description('Import and update movies from a CSV file')
  .option(
    '-p, --path <path>',
    'path to the SQLite database file',
    DEFAULT_DATABASE_PATH,
  )
  .action((csvFile: string, { path }: { path: string }) => {
    addMovies(path, csvFile);
  });

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await program.parseAsync();
}
