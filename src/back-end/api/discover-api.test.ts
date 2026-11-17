import type { Express, Request, RequestHandler, Response } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tmdbAccessToken } from '../utils/config';
import {
  DEFAULT_LANGUAGE,
  DEFAULT_PAGE,
  DEFAULT_REGION,
} from '../utils/constants';
import { registerDiscoverApi } from './discover-api';
import type { TmdbMovie, TmdbMoviesRawResponse } from '../types/MoviesTypes';

const { toSupportedMovieMock } = vi.hoisted(() => ({
  toSupportedMovieMock: vi.fn(),
}));

vi.mock('../utils/converter', () => ({
  toSupportedMovie: toSupportedMovieMock,
}));

vi.mock('../utils/config', () => ({
  tmdbAccessToken: 'test-access-token',
}));

type RouteHandler = (
  req: Request,
  res: Response,
  next: (error?: unknown) => void,
) => void | Promise<void>;

const handlers = new Map<string, RequestHandler>();
const app = {
  get: (path: string, handler: RequestHandler) => handlers.set(path, handler),
} as unknown as Express;

function getHandler(): RouteHandler {
  return handlers.get('/api/discover/movies') as RouteHandler;
}

function createResponse() {
  const response = { json: vi.fn(), status: vi.fn() };
  response.status.mockReturnValue(response);
  return response as unknown as Response & {
    json: ReturnType<typeof vi.fn>;
    status: ReturnType<typeof vi.fn>;
  };
}

function tmdbResponse(data: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: vi.fn().mockResolvedValue(data),
  } as unknown as Response;
}

const rawMovie = { id: 1 } as unknown as TmdbMovie;

describe('discover API', () => {
  beforeEach(() => {
    handlers.clear();
    registerDiscoverApi(app);
    toSupportedMovieMock.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('discovers one page with defaults and converts returned movies', async () => {
    const rawData = {
      page: 1,
      results: [rawMovie],
      total_pages: 2,
      total_results: 1,
    } as unknown as TmdbMoviesRawResponse;
    const supportedMovie = { id: 1, title: 'Movie' };
    const fetchMock = vi.fn().mockResolvedValue(tmdbResponse(rawData));
    vi.stubGlobal('fetch', fetchMock);
    toSupportedMovieMock.mockReturnValue(supportedMovie);
    const response = createResponse();

    await getHandler()(
      { query: { year: '2020' } } as Request,
      response,
      vi.fn(),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      `https://api.themoviedb.org/3/discover/movie?primary_release_year=2020&language=${DEFAULT_LANGUAGE}&page=${DEFAULT_PAGE}&region=${DEFAULT_REGION}`,
      expect.objectContaining({
        headers: {
          Authorization: `Bearer ${tmdbAccessToken}`,
          'Content-Type': 'application/json;charset=utf-8',
        },
      }),
    );
    expect(toSupportedMovieMock).toHaveBeenCalledWith(rawMovie);
    expect(response.json).toHaveBeenCalledWith({
      page: 1,
      results: [supportedMovie],
      total_pages: 2,
      total_results: 1,
    });
  });

  it('forwards custom string options and returns an empty page', async () => {
    const rawData = { page: 2, results: [], total_pages: 2, total_results: 0 };
    const fetchMock = vi.fn().mockResolvedValue(tmdbResponse(rawData));
    vi.stubGlobal('fetch', fetchMock);
    const response = createResponse();

    await getHandler()(
      {
        query: { year: '2020', language: 'en-US', page: '2', region: 'US' },
      } as unknown as Request,
      response,
      vi.fn(),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.themoviedb.org/3/discover/movie?primary_release_year=2020&language=en-US&page=2&region=US',
      expect.anything(),
    );
    expect(response.json).toHaveBeenCalledWith(rawData);
  });

  it('rejects missing, invalid, repeated, and structured years without calling TMDB', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const invalidQueries = [
      {},
      { year: '' },
      { year: '20' },
      { year: '2020a' },
      { year: ['2020', '2021'] },
      { year: { value: '2020' } },
    ];

    for (const query of invalidQueries) {
      const response = createResponse();
      await getHandler()({ query } as unknown as Request, response, vi.fn());
      expect(response.status).toHaveBeenCalledWith(400);
      expect(response.json).toHaveBeenCalledWith({
        error: 'The year query parameter must be a four-digit year',
      });
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('uses defaults for non-string optional values', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      tmdbResponse({
        page: 1,
        results: [],
        total_pages: 1,
        total_results: 0,
      }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const response = createResponse();

    await getHandler()(
      {
        query: {
          year: '2020',
          language: '',
          page: ['2'],
          region: { code: 'US' },
        },
      } as unknown as Request,
      response,
      vi.fn(),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      `https://api.themoviedb.org/3/discover/movie?primary_release_year=2020&language=${DEFAULT_LANGUAGE}&page=${DEFAULT_PAGE}&region=${DEFAULT_REGION}`,
      expect.anything(),
    );
  });

  it('returns a 500 and logs HTTP, network, and JSON errors', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(tmdbResponse({}, false, 503))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
      });
    vi.stubGlobal('fetch', fetchMock);

    for (let index = 0; index < 3; index += 1) {
      const response = createResponse();
      await getHandler()(
        { query: { year: '2020' } } as Request,
        response,
        vi.fn(),
      );
      expect(response.status).toHaveBeenCalledWith(500);
      expect(response.json).toHaveBeenCalledWith({
        error: 'Failed to discover movies',
      });
    }
    expect(console.error).toHaveBeenCalledTimes(3);
  });
});
