import type { Express, Request, RequestHandler, Response } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tmdbAccessToken } from '../utils/config';
import {
  DEFAULT_LANGUAGE,
  DEFAULT_PAGE,
  DEFAULT_REGION,
} from '../utils/constants';
import type { TmdbMoviesRawResponse } from '../types/MoviesTypes';
import { registerDiscoverApi } from './discover-api';

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

function getHandler(path: string): RouteHandler {
  const handler = handlers.get(path);
  if (!handler) throw new Error(`No handler registered for ${path}`);
  return handler as RouteHandler;
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

  it('discovers a page of movies for the year with default query options', async () => {
    // Arrange: Configure TMDB to return a movie and capture the route response.
    const rawMovie = { id: 1, adult: true, video: true };
    const rawData = {
      page: 1,
      results: [rawMovie],
      total_pages: 4,
      total_results: 40,
    } as unknown as TmdbMoviesRawResponse;
    const supportedMovie = { id: 1, title: 'Movie' };
    const fetchMock = vi.fn().mockResolvedValueOnce(tmdbResponse(rawData));
    vi.stubGlobal('fetch', fetchMock);
    toSupportedMovieMock.mockReturnValue(supportedMovie);
    const response = createResponse();

    // Act: Request a single page for the required release year.
    await getHandler('/api/discover/movies')(
      { query: { year: '2020' } } as unknown as Request,
      response,
      vi.fn(),
    );

    // Assert: TMDB receives the year filter, defaults, and server-side token.
    expect(fetchMock).toHaveBeenCalledWith(
      `https://api.themoviedb.org/3/discover/movie?primary_release_year=2020&language=${DEFAULT_LANGUAGE}&page=${DEFAULT_PAGE}&region=${DEFAULT_REGION}`,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Bearer ${tmdbAccessToken}`,
        }),
      }),
    );
    expect(toSupportedMovieMock).toHaveBeenCalledWith(rawMovie);
    expect(response.json).toHaveBeenCalledWith({
      page: 1,
      results: [supportedMovie],
      total_pages: 4,
      total_results: 40,
    });
  });

  it('forwards custom options and preserves empty-result pagination', async () => {
    // Arrange: Return an empty page with TMDB's pagination metadata.
    const rawData = {
      page: 2,
      results: [],
      total_pages: 3,
      total_results: 25,
    } as unknown as TmdbMoviesRawResponse;
    const fetchMock = vi.fn().mockResolvedValueOnce(tmdbResponse(rawData));
    vi.stubGlobal('fetch', fetchMock);
    const response = createResponse();

    // Act: Request the second English-language page for the US region.
    await getHandler('/api/discover/movies')(
      {
        query: {
          year: '2020',
          language: 'en-US',
          page: '2',
          region: 'US',
        },
      } as unknown as Request,
      response,
      vi.fn(),
    );

    // Assert: Custom options are forwarded and the empty results retain metadata.
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.themoviedb.org/3/discover/movie?primary_release_year=2020&language=en-US&page=2&region=US',
      expect.any(Object),
    );
    expect(response.json).toHaveBeenCalledWith({
      page: 2,
      results: [],
      total_pages: 3,
      total_results: 25,
    });
  });

  it('rejects missing, invalid, repeated, and structured years without calling TMDB', async () => {
    // Arrange: Include malformed strings, out-of-range values, and non-string query values.
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const invalidQueries = [
      {},
      { year: '' },
      { year: '20' },
      { year: '20a0' },
      { year: '0999' },
      { year: '10000' },
      { year: ['2020', '2021'] },
      { year: { nested: '2020' } },
    ];

    // Act: Invoke the route for every malformed query value.
    const responses = invalidQueries.map(createResponse);
    for (const [index, query] of invalidQueries.entries()) {
      await getHandler('/api/discover/movies')(
        { query } as unknown as Request,
        responses[index],
        vi.fn(),
      );
    }

    // Assert: Invalid requests receive an explicit 400 and never call TMDB.
    for (const response of responses) {
      expect(response.status).toHaveBeenCalledWith(400);
      expect(response.json).toHaveBeenCalledWith({
        error:
          'Invalid or missing year. Expected a four-digit year between 1000 and 9999.',
      });
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('uses defaults for empty or non-string optional query values', async () => {
    // Arrange: Provide empty and structured values for optional parameters.
    const rawData = {
      page: 1,
      results: [],
      total_pages: 0,
      total_results: 0,
    } as unknown as TmdbMoviesRawResponse;
    const fetchMock = vi.fn().mockResolvedValueOnce(tmdbResponse(rawData));
    vi.stubGlobal('fetch', fetchMock);
    const response = createResponse();

    // Act: Request the year with unusable optional values.
    await getHandler('/api/discover/movies')(
      {
        query: {
          year: '2020',
          language: '',
          page: ['2'],
          region: { nested: 'US' },
        },
      } as unknown as Request,
      response,
      vi.fn(),
    );

    // Assert: Each unusable optional value falls back to its documented default.
    expect(fetchMock).toHaveBeenCalledWith(
      `https://api.themoviedb.org/3/discover/movie?primary_release_year=2020&language=${DEFAULT_LANGUAGE}&page=${DEFAULT_PAGE}&region=${DEFAULT_REGION}`,
      expect.any(Object),
    );
  });

  it('logs TMDB, network, and JSON errors and returns HTTP 500', async () => {
    // Arrange: Simulate an unsuccessful response, a network rejection, and JSON parsing failure.
    const jsonFailure = tmdbResponse({});
    vi.mocked(jsonFailure.json).mockRejectedValueOnce(
      new Error('Invalid JSON'),
    );
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(tmdbResponse({}, false, 503))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(jsonFailure);
    vi.stubGlobal('fetch', fetchMock);
    const responses = [createResponse(), createResponse(), createResponse()];
    const errorLog = vi.spyOn(console, 'error');

    // Act: Make requests that trigger each failure mode.
    for (const response of responses) {
      await getHandler('/api/discover/movies')(
        { query: { year: '2020' } } as unknown as Request,
        response,
        vi.fn(),
      );
    }

    // Assert: All failures are logged and use the exact API error response.
    for (const response of responses) {
      expect(response.status).toHaveBeenCalledWith(500);
      expect(response.json).toHaveBeenCalledWith({
        error: 'Failed to discover movies',
      });
    }
    expect(errorLog).toHaveBeenCalledTimes(3);
  });
});
