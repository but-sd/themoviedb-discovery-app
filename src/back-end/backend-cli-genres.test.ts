import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const closeMock = vi.fn();
  const database = { close: closeMock };

  return {
    closeMock,
    database,
    deleteUnusedGenresMock: vi.fn(() => 2),
    getDatabaseMock: vi.fn(() => database),
    parseGenresCsvMock: vi.fn(() => [{ id: 18, name: 'Drama' }]),
    readFileSyncMock: vi.fn(() => 'id,name\n18,Drama'),
  };
});

vi.mock('node:fs', () => ({ readFileSync: mocks.readFileSyncMock }));
vi.mock('./database/genre-csv.ts', () => ({
  parseGenresCsv: mocks.parseGenresCsvMock,
}));
vi.mock('./database/genre-repository.ts', () => ({
  deleteUnusedGenres: mocks.deleteUnusedGenresMock,
  upsertGenres: vi.fn(),
}));
vi.mock('./database/schema.ts', () => ({
  DEFAULT_DATABASE_PATH: '/tmp/movies-default.sqlite',
  getDatabase: mocks.getDatabaseMock,
}));

async function runCliWithArgs(args: string[]): Promise<void> {
  const originalArgv = process.argv;
  process.argv = ['node', 'src/back-end/backend-cli.ts', ...args];
  try {
    await import('./backend-cli.ts');
  } finally {
    process.argv = originalArgv;
  }
}

describe('backend-cli genre commands', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('validates the CSV before opening the selected database and imports genres', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    try {
      await runCliWithArgs([
        'add-genres',
        './data/genres.csv',
        '--path',
        './data/custom.sqlite',
      ]);

      expect(mocks.readFileSyncMock).toHaveBeenCalledWith(
        './data/genres.csv',
        'utf8',
      );
      expect(mocks.parseGenresCsvMock).toHaveBeenCalledWith(
        'id,name\n18,Drama',
      );
      expect(mocks.getDatabaseMock).toHaveBeenCalledWith(
        './data/custom.sqlite',
      );
      expect(mocks.closeMock).toHaveBeenCalledOnce();
      expect(logSpy).toHaveBeenCalledWith(
        '1 genres imported into ' + `${process.cwd()}/data/custom.sqlite`,
      );
    } finally {
      logSpy.mockRestore();
    }
  });

  it('does not open the database when CSV validation fails', async () => {
    mocks.parseGenresCsvMock.mockImplementation(() => {
      throw new Error('Invalid genres CSV');
    });

    await expect(
      runCliWithArgs(['add-genres', './data/invalid.csv']),
    ).rejects.toThrow('Invalid genres CSV');
    expect(mocks.getDatabaseMock).not.toHaveBeenCalled();
  });

  it('cleans unused genres and closes the selected database', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    try {
      await runCliWithArgs(['clean-genres', '--path', './data/custom.sqlite']);

      expect(mocks.getDatabaseMock).toHaveBeenCalledWith(
        './data/custom.sqlite',
      );
      expect(mocks.deleteUnusedGenresMock).toHaveBeenCalledOnce();
      expect(mocks.closeMock).toHaveBeenCalledOnce();
      expect(logSpy).toHaveBeenCalledWith(
        '2 genres removed from ' + `${process.cwd()}/data/custom.sqlite`,
      );
    } finally {
      logSpy.mockRestore();
    }
  });
});
