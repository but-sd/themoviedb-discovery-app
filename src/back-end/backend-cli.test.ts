import { mkdtempSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const DEFAULT_DATABASE_PATH = '/tmp/movies-default.sqlite';

const closeMock = vi.fn();
const getDatabaseMock = vi.fn(() => ({ close: closeMock }));
const parseGenresCsvMock = vi.fn();
const upsertGenresMock = vi.fn();
const deleteUnusedGenresMock = vi.fn();

vi.mock('./database/schema.ts', () => ({
  DEFAULT_DATABASE_PATH,
  getDatabase: getDatabaseMock,
}));

vi.mock('./utils/genre-csv.ts', () => ({
  parseGenresCsv: parseGenresCsvMock,
}));

vi.mock('./database/genre-repository.ts', () => ({
  deleteUnusedGenres: deleteUnusedGenresMock,
  upsertGenres: upsertGenresMock,
}));

/**
 * Executes the backend CLI with the specified command-line arguments
 * @param args The command-line arguments to pass to the CLI
 */
async function runCliWithArgs(args: string[]): Promise<void> {
  const originalArgv = process.argv;
  process.argv = ['node', 'src/back-end/backend-cli.ts', ...args];
  try {
    await import('./backend-cli.ts');
  } finally {
    process.argv = originalArgv;
  }
}

describe('backend-cli.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    parseGenresCsvMock.mockReturnValue([]);
    upsertGenresMock.mockReturnValue(0);
    deleteUnusedGenresMock.mockReturnValue(0);
  });

  describe('create-database', () => {
    it('uses the default database path when the subcommand has no path option', async () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      try {
        await runCliWithArgs(['create-database']);

        expect(getDatabaseMock).toHaveBeenCalledWith(DEFAULT_DATABASE_PATH);
        expect(closeMock).toHaveBeenCalledOnce();
        expect(logSpy).toHaveBeenCalledWith(
          `Database available at ${resolve(DEFAULT_DATABASE_PATH)}`,
        );
      } finally {
        logSpy.mockRestore();
      }
    });

    it('uses the path passed in --path', async () => {
      const customDatabasePath = './data/custom-movies.sqlite';
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      try {
        await runCliWithArgs(['create-database', '--path', customDatabasePath]);

        expect(getDatabaseMock).toHaveBeenCalledWith(customDatabasePath);
        expect(closeMock).toHaveBeenCalledOnce();
        expect(logSpy).toHaveBeenCalledWith(
          `Database available at ${resolve(customDatabasePath)}`,
        );
      } finally {
        logSpy.mockRestore();
      }
    });
  });

  describe('add-genres', () => {
    it('validates the CSV before opening the selected database and closes it after importing', async () => {
      // Arrange
      const directory = mkdtempSync(join(tmpdir(), 'genres-cli-'));
      const csvFile = join(directory, 'genres.csv');
      writeFileSync(csvFile, 'id,name\n28,Action\n');
      const customDatabasePath = join(directory, 'movies.sqlite');
      const genres = [{ id: 28, name: 'Action' }];
      parseGenresCsvMock.mockReturnValue(genres);
      upsertGenresMock.mockReturnValue(1);
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Act
      try {
        await runCliWithArgs([
          '--path',
          customDatabasePath,
          'add-genres',
          csvFile,
        ]);

        // Assert
        expect(parseGenresCsvMock).toHaveBeenCalledWith('id,name\n28,Action\n');
        expect(getDatabaseMock).toHaveBeenCalledWith(customDatabasePath);
        expect(upsertGenresMock).toHaveBeenCalledWith(
          { close: closeMock },
          genres,
        );
        expect(closeMock).toHaveBeenCalledOnce();
        expect(logSpy).toHaveBeenCalledWith(
          `Imported 1 genres into ${resolve(customDatabasePath)}`,
        );
      } finally {
        logSpy.mockRestore();
      }
    });

    it('does not open the database when CSV validation fails', async () => {
      // Arrange
      const directory = mkdtempSync(join(tmpdir(), 'genres-cli-'));
      const csvFile = join(directory, 'invalid-genres.csv');
      writeFileSync(csvFile, 'invalid');
      parseGenresCsvMock.mockImplementation(() => {
        throw new Error('Invalid genres CSV');
      });

      // Act and assert
      await expect(runCliWithArgs(['add-genres', csvFile])).rejects.toThrow(
        'Invalid genres CSV',
      );
      expect(getDatabaseMock).not.toHaveBeenCalled();
    });
  });

  describe('clean-genres', () => {
    it('deletes unused genres, closes the database, and reports the count', async () => {
      // Arrange
      const customDatabasePath = './data/custom-movies.sqlite';
      deleteUnusedGenresMock.mockReturnValue(3);
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Act
      try {
        await runCliWithArgs(['--path', customDatabasePath, 'clean-genres']);

        // Assert
        expect(getDatabaseMock).toHaveBeenCalledWith(customDatabasePath);
        expect(deleteUnusedGenresMock).toHaveBeenCalledWith({
          close: closeMock,
        });
        expect(closeMock).toHaveBeenCalledOnce();
        expect(logSpy).toHaveBeenCalledWith(
          `Deleted 3 unused genres from ${resolve(customDatabasePath)}`,
        );
      } finally {
        logSpy.mockRestore();
      }
    });
  });
});
