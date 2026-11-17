#!/usr/bin/env node
import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  deleteUnusedGenres,
  upsertGenres,
} from './database/genre-repository.ts';
import { DEFAULT_DATABASE_PATH, getDatabase } from './database/schema.ts';
import { parseGenresCsv } from './utils/genre-csv.ts';

/** Command-line interface for movie database operations. */
const program = new Command().description('CLI for movie database operations');

program.option(
  '-p, --path <path>',
  'path to the SQLite database file',
  DEFAULT_DATABASE_PATH,
);

program
  .command('create-database')
  .description('Create and initialize the movies database schema')
  .option('-p, --path <path>', 'path to the SQLite database file')
  .action((_options: unknown, command: Command) => {
    const path = getDatabasePath(command);
    const database = getDatabase(path);
    database.close();
    console.log(`Database available at ${resolve(path)}`);
  });

program
  .command('add-genres')
  .description('Import genres from a CSV file')
  .argument('<csv-file>', 'path to the genres CSV file')
  .action((csvFile: string, _options: unknown, command: Command) => {
    const csv = readFileSync(csvFile, 'utf8');
    const genres = parseGenresCsv(csv);
    const databasePath = getDatabasePath(command);
    const database = getDatabase(databasePath);

    try {
      const importedCount = upsertGenres(database, genres);
      console.log(
        `Imported ${importedCount} genres into ${resolve(databasePath)}`,
      );
    } finally {
      database.close();
    }
  });

program
  .command('clean-genres')
  .description('Remove genres that are not associated with a movie')
  .action((_options: unknown, command: Command) => {
    const databasePath = getDatabasePath(command);
    const database = getDatabase(databasePath);

    try {
      const deletedCount = deleteUnusedGenres(database);
      console.log(
        `Deleted ${deletedCount} unused genres from ${resolve(databasePath)}`,
      );
    } finally {
      database.close();
    }
  });

function getDatabasePath(command: Command): string {
  return command.opts().path ?? command.parent!.opts().path;
}

program.parse();
