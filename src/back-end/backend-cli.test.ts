import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const DEFAULT_DATABASE_PATH = '/tmp/movies-default.sqlite';

const {
  closeMock,
  databaseMock,
  getDatabaseMock,
  readFileSyncMock,
  saveCountriesMock,
  deleteUnreferencedCountriesMock,
  saveGenresMock,
  deleteUnusedGenresMock,
  saveMoviesMock,
} = vi.hoisted(() => {
  const closeMock = vi.fn();
  const databaseMock = { close: closeMock };
  return {
    closeMock,
    databaseMock,
    getDatabaseMock: vi.fn(() => databaseMock),
    readFileSyncMock: vi.fn(() => 'id,name\n18,Drama\n35,Comedy\n'),
    saveCountriesMock: vi.fn(),
    deleteUnreferencedCountriesMock: vi.fn(),
    saveGenresMock: vi.fn(),
    deleteUnusedGenresMock: vi.fn(),
    saveMoviesMock: vi.fn(),
  };
});

vi.mock('./database/schema.ts', () => ({
  DEFAULT_DATABASE_PATH,
  getDatabase: getDatabaseMock,
}));

vi.mock('node:fs', async (importOriginal) => ({
  ...(await importOriginal()),
  readFileSync: readFileSyncMock,
}));

vi.mock('./database/country-repository.ts', () => ({
  deleteUnreferencedCountries: deleteUnreferencedCountriesMock,
  saveCountries: saveCountriesMock,
}));

vi.mock('./database/genre-repository.ts', () => ({
  deleteUnusedGenres: deleteUnusedGenresMock,
  saveGenres: saveGenresMock,
}));

vi.mock('./database/movie-repository.ts', () => ({
  saveMovies: saveMoviesMock,
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

async function loadCountriesParser(): Promise<
  (content: string) => { code: string; name: string }[]
> {
  const module = await import('./backend-cli.ts');
  return module.parseCountriesCsv;
}

async function loadMoviesParser(): Promise<
  (content: string) => Array<{ id: number; title: string }>
> {
  const module = await import('./backend-cli.ts');
  return module.parseMoviesCsv as (content: string) => Array<{
    id: number;
    title: string;
  }>;
}

describe('backend-cli.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
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

  describe('parseCountriesCsv', () => {
    it('parses BOM, CRLF, reordered headers, empty lines, and quoted values', async () => {
      const parseCountriesCsv = await loadCountriesParser();

      expect(
        parseCountriesCsv(
          '\ufeff name , code\r\n"Congo, Republic of the", CG\r\n\r\n"United States ""of"" America", US\r\n',
        ),
      ).toEqual([
        { code: 'CG', name: 'Congo, Republic of the' },
        { code: 'US', name: 'United States "of" America' },
      ]);
    });

    it('rejects invalid headers', async () => {
      const parseCountriesCsv = await loadCountriesParser();

      expect(() => parseCountriesCsv('country,name\nFR,France')).toThrow(
        'Invalid countries CSV headers',
      );
    });

    it('validates all row-level errors', async () => {
      const parseCountriesCsv = await loadCountriesParser();

      expect(() => parseCountriesCsv('country,name\nFR,France')).toThrow(
        'Invalid countries CSV headers',
      );
      expect(() => parseCountriesCsv('code,name\nFR')).toThrow(
        'Invalid countries CSV row',
      );
      expect(() => parseCountriesCsv('code,name\nfr,France')).toThrow(
        'Invalid country code',
      );
      expect(() => parseCountriesCsv('code,name\nFR,')).toThrow(
        'Invalid country name',
      );
      expect(() => parseCountriesCsv('code,name\nFR')).toThrow(
        'Invalid countries CSV row',
      );
      expect(() => parseCountriesCsv('code,name\nFR,"France')).toThrow(
        'Invalid countries CSV syntax',
      );
    });

    it('reports parser failures that are not Error instances', async () => {
      vi.doMock('csv-parse/sync', () => ({
        parse: () => {
          throw 'parser failure';
        },
      }));
      vi.resetModules();

      const { parseCountriesCsv } = await import('./backend-cli.ts');

      expect(() => parseCountriesCsv('code,name\nFR,France')).toThrow(
        'Invalid countries CSV syntax: parser failure',
      );
      vi.doUnmock('csv-parse/sync');
    });
  });

  describe('country commands', () => {
    it('imports validated countries, uses the database path, and closes the connection', async () => {
      const directory = mkdtempSync(`${tmpdir()}/countries-cli-`);
      const csvPath = resolve(directory, 'countries.csv');
      const databasePath = './data/custom-movies.sqlite';
      writeFileSync(csvPath, 'code,name\nFR,France\n');
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      readFileSyncMock.mockReturnValueOnce('code,name\nFR,France\n');

      try {
        await runCliWithArgs([
          'add-countries',
          csvPath,
          '--path',
          databasePath,
        ]);

        expect(getDatabaseMock).toHaveBeenCalledWith(databasePath);
        expect(saveCountriesMock).toHaveBeenCalledWith(databaseMock, [
          { code: 'FR', name: 'France' },
        ]);
        expect(closeMock).toHaveBeenCalledOnce();
        expect(logSpy).toHaveBeenCalledWith(
          `1 countries imported/updated in ${resolve(databasePath)}`,
        );
      } finally {
        logSpy.mockRestore();
        rmSync(directory, { recursive: true, force: true });
      }
    });

    it('cleans unreferenced countries and closes the connection', async () => {
      const customDatabasePath = './data/custom-movies.sqlite';
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      deleteUnreferencedCountriesMock.mockReturnValue(3);

      try {
        await runCliWithArgs(['clean-countries', '--path', customDatabasePath]);

        expect(getDatabaseMock).toHaveBeenCalledWith(customDatabasePath);
        expect(deleteUnreferencedCountriesMock).toHaveBeenCalledWith(
          databaseMock,
        );
        expect(closeMock).toHaveBeenCalledOnce();
        expect(logSpy).toHaveBeenCalledWith(
          `3 countries deleted from ${resolve(customDatabasePath)}`,
        );
      } finally {
        logSpy.mockRestore();
      }
    });
  });

  describe('add-genres', () => {
    it('imports genres from the CSV file passed in --file', async () => {
      const databasePath = './data/test.sqlite';
      const csvPath = './data/test-genres.csv';
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      try {
        await runCliWithArgs([
          'add-genres',
          '--path',
          databasePath,
          '--file',
          csvPath,
        ]);

        expect(getDatabaseMock).toHaveBeenCalledWith(databasePath);
        expect(readFileSyncMock).toHaveBeenCalledWith(csvPath, 'utf8');
        expect(saveGenresMock).toHaveBeenCalledWith(databaseMock, [
          { id: 18, name: 'Drama' },
          { id: 35, name: 'Comedy' },
        ]);
        expect(closeMock).toHaveBeenCalledOnce();
      } finally {
        logSpy.mockRestore();
      }
    });

    it('rejects a CSV with an invalid header', async () => {
      readFileSyncMock.mockReturnValueOnce('genre_id,name\n18,Drama\n');

      await expect(
        runCliWithArgs(['add-genres', '--file', './data/test-genres.csv']),
      ).rejects.toThrow('The genres CSV must start with the "id,name" header');
      expect(saveGenresMock).not.toHaveBeenCalled();
      expect(closeMock).toHaveBeenCalledOnce();
    });

    it('rejects a CSV with an invalid genre row', async () => {
      readFileSyncMock.mockReturnValueOnce('id,name\ninvalid,Drama\n');

      await expect(
        runCliWithArgs(['add-genres', '--file', './data/test-genres.csv']),
      ).rejects.toThrow('Invalid genre on CSV line 2');
      expect(saveGenresMock).not.toHaveBeenCalled();
      expect(closeMock).toHaveBeenCalledOnce();
    });
  });

  describe('clean-genres', () => {
    it('removes genres that are not used by any movie', async () => {
      const databasePath = './data/test.sqlite';
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      try {
        await runCliWithArgs(['clean-genres', '--path', databasePath]);

        expect(getDatabaseMock).toHaveBeenCalledWith(databasePath);
        expect(deleteUnusedGenresMock).toHaveBeenCalledWith(databaseMock);
        expect(closeMock).toHaveBeenCalledOnce();
      } finally {
        logSpy.mockRestore();
      }
    });

    describe('add-movies', () => {
      it('imports movies and their relations from a CSV file', async () => {
        const csvPath = './data/test-movies.csv';
        readFileSyncMock.mockReturnValueOnce(
          'id,title,original_title,original_language,overview,release_date,popularity,vote_average,vote_count,poster_path,backdrop_path,runtime,budget,revenue,genres,production_countries\n' +
            '1,Movie,Movie,en,Overview,2020-01-01,10,7.5,20,/poster,/backdrop,120,100,200,"[18]","[{""iso_3166_1"":""FR""}]"\n',
        );
        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        try {
          await runCliWithArgs([
            'add-movies',
            csvPath,
            '--path',
            './data/test.sqlite',
          ]);

          expect(saveMoviesMock).toHaveBeenCalledWith(databaseMock, [
            expect.objectContaining({
              id: 1,
              title: 'Movie',
              genre_ids: [18],
              production_country_codes: ['FR'],
            }),
          ]);
          expect(closeMock).toHaveBeenCalledOnce();
        } finally {
          logSpy.mockRestore();
        }
      });

      it('rejects invalid movie CSV headers', async () => {
        readFileSyncMock.mockReturnValueOnce('wrong,headers\n1,Movie\n');

        await expect(
          runCliWithArgs(['add-movies', './data/test-movies.csv']),
        ).rejects.toThrow('Invalid movies CSV headers');
        expect(saveMoviesMock).not.toHaveBeenCalled();
        expect(closeMock).toHaveBeenCalledOnce();
      });

      it('rejects invalid rows, JSON and relations', async () => {
        const parseMoviesCsv = await loadMoviesParser();
        const base =
          'id,title,original_title,original_language,overview,release_date,popularity,vote_average,vote_count,poster_path,backdrop_path,runtime,budget,revenue,genres,production_countries\n';
        expect(() => parseMoviesCsv(`${base}1,Movie`)).toThrow(
          'Invalid movie CSV row',
        );
        expect(() => parseMoviesCsv(`${base}1,"Movie`)).toThrow(
          'Invalid movies CSV syntax',
        );
        expect(() =>
          parseMoviesCsv(
            `${base}${[
              'invalid',
              'Movie',
              'Movie',
              'en',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '[18]',
              '[]',
            ].join(',')}`,
          ),
        ).toThrow('Invalid movie on CSV line 2');
        expect(() =>
          parseMoviesCsv(`${base}1,Movie,Movie,en,,,,,,,,,,,,bad`),
        ).toThrow('Invalid movie JSON');
        expect(() =>
          parseMoviesCsv(
            `${base}${[
              '1',
              'Movie',
              'Movie',
              'en',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
              '[18]',
              '"[{""iso_3166_1"":""""}]"',
            ].join(',')}`,
          ),
        ).toThrow('Invalid movie relations');
      });

      it('parses optional and numeric movie fields', async () => {
        const parseMoviesCsv = await loadMoviesParser();
        const headers =
          'id,title,original_title,original_language,overview,release_date,popularity,vote_average,vote_count,poster_path,backdrop_path,runtime,budget,revenue,genres,production_countries\n';

        expect(
          parseMoviesCsv(
            `${headers}1,Movie,Movie,en,Overview,2020-01-01,10,7,5,/poster,/backdrop,100,200,300,"[18]","[{""iso_3166_1"":""FR""}]"\n` +
              [
                '2',
                'Movie 2',
                'Movie 2',
                'en',
                'Overview',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '[]',
                '[]',
              ].join(','),
          ),
        ).toHaveLength(2);
      });

      it('formats non-Error CSV parser failures', async () => {
        vi.doMock('csv-parse/sync', () => ({
          parse: () => {
            throw 'parser failure';
          },
        }));
        vi.resetModules();

        try {
          const module = await import('./backend-cli.ts');
          expect(() => module.parseMoviesCsv('invalid')).toThrow(
            'Invalid movies CSV syntax: parser failure',
          );
        } finally {
          vi.doUnmock('csv-parse/sync');
        }
      });
    });
  });
});
