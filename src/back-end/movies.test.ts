import type { Express } from 'express'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('./utils', () => ({
  TMDB_API_BASE_URL: 'https://api.themoviedb.org',
  getRequiredTmdbAuthHeaders: vi.fn(),
  getSingleQueryParam: vi.fn((value: unknown, fallback: string) =>
    typeof value === 'string' && value.length > 0 ? value : fallback,
  ),
}))

import { registerMoviesApi } from './movies-api'
import { TMDB_API_BASE_URL, getRequiredTmdbAuthHeaders, getSingleQueryParam } from './utils'

type MockRequest = {
  query: Record<string, unknown>
  params: { id: string }
}

type MockResponse = {
  status: ReturnType<typeof vi.fn>
  json: ReturnType<typeof vi.fn>
}

type RouteHandler = (req: MockRequest, res: MockResponse) => Promise<void> | void

const tmdbHeaders = {
  Authorization: 'Bearer tmdb-token',
  Accept: 'application/json',
}

let fetchMock: ReturnType<typeof vi.fn>

function createMockResponse(): MockResponse {
  const res: MockResponse = { status: vi.fn(), json: vi.fn() }
  res.status.mockReturnValue(res)
  return res
}

function createMockApp() {
  const routes = new Map<string, RouteHandler>()
  const get = vi.fn((path: string, handler: RouteHandler) => {
    routes.set(path, handler)
  })
  return { app: { get } as unknown as Express, routes, get }
}

describe('registerMoviesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('registers movie endpoints', () => {
    const { app, get } = createMockApp()
    registerMoviesApi(app)

    expect(get).toHaveBeenCalledWith('/api/movies/popular', expect.any(Function))
    expect(get).toHaveBeenCalledWith('/api/movies/genres', expect.any(Function))
    expect(get).toHaveBeenCalledWith('/api/movies/:id', expect.any(Function))
  })

  it('returns early when TMDB headers are missing', async () => {
    const { app, routes } = createMockApp()
    registerMoviesApi(app)
    vi.mocked(getRequiredTmdbAuthHeaders).mockReturnValue(null)

    const handler = routes.get('/api/movies/popular')
    const res = createMockResponse()

    await handler?.({ query: {}, params: { id: '' } }, res)

    expect(getRequiredTmdbAuthHeaders).toHaveBeenCalledWith(res)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('calls TMDB popular endpoint with bearer headers', async () => {
    const { app, routes } = createMockApp()
    registerMoviesApi(app)

    vi.mocked(getRequiredTmdbAuthHeaders).mockReturnValue(tmdbHeaders)
    vi.mocked(getSingleQueryParam)
      .mockReturnValueOnce('fr FR')
      .mockReturnValueOnce('FR')
      .mockReturnValueOnce('2')

    const tmdbPayload = { page: 2, results: [{ id: 1, title: 'Movie' }] }
    fetchMock.mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(tmdbPayload) })

    const handler = routes.get('/api/movies/popular')
    const res = createMockResponse()

    await handler?.({ query: { language: 'x', region: 'y', page: 'z' }, params: { id: '' } }, res)

    const expectedUrl =
      `${TMDB_API_BASE_URL}/3/movie/popular?` +
      `language=${encodeURIComponent('fr FR')}` +
      `&region=${encodeURIComponent('FR')}` +
      `&page=${encodeURIComponent('2')}`

    expect(fetch).toHaveBeenCalledWith(expectedUrl, { headers: tmdbHeaders })
    expect(res.json).toHaveBeenCalledWith(tmdbPayload)
  })

  it('returns TMDB error details for movies popular', async () => {
    const { app, routes } = createMockApp()
    registerMoviesApi(app)

    vi.mocked(getRequiredTmdbAuthHeaders).mockReturnValue(tmdbHeaders)
    fetchMock.mockResolvedValue({ ok: false, status: 401, text: vi.fn().mockResolvedValue('Unauthorized') })

    const handler = routes.get('/api/movies/popular')
    const res = createMockResponse()

    await handler?.({ query: {}, params: { id: '' } }, res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({
      error: 'TMDB request failed with status 401',
      details: 'Unauthorized',
    })
  })

  it('calls TMDB genres endpoint with bearer headers', async () => {
    const { app, routes } = createMockApp()
    registerMoviesApi(app)

    vi.mocked(getRequiredTmdbAuthHeaders).mockReturnValue(tmdbHeaders)
    vi.mocked(getSingleQueryParam).mockReturnValueOnce('fr FR')

    const tmdbPayload = { genres: [{ id: 28, name: 'Action' }] }
    fetchMock.mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(tmdbPayload) })

    const handler = routes.get('/api/movies/genres')
    const res = createMockResponse()

    await handler?.({ query: { language: 'x' }, params: { id: '' } }, res)

    const expectedUrl =
      `${TMDB_API_BASE_URL}/3/genre/movie/list?` +
      `language=${encodeURIComponent('fr FR')}`

    expect(fetch).toHaveBeenCalledWith(expectedUrl, { headers: tmdbHeaders })
    expect(res.json).toHaveBeenCalledWith(tmdbPayload)
  })

  it('calls TMDB details endpoint with bearer headers', async () => {
    const { app, routes } = createMockApp()
    registerMoviesApi(app)

    vi.mocked(getRequiredTmdbAuthHeaders).mockReturnValue(tmdbHeaders)
    vi.mocked(getSingleQueryParam).mockReturnValueOnce('fr FR')

    const tmdbPayload = { id: 550, title: 'Fight Club' }
    fetchMock.mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(tmdbPayload) })

    const handler = routes.get('/api/movies/:id')
    const res = createMockResponse()

    await handler?.({ params: { id: '550/abc' }, query: { language: 'x' } }, res)

    const expectedUrl =
      `${TMDB_API_BASE_URL}/3/movie/${encodeURIComponent('550/abc')}?` +
      `language=${encodeURIComponent('fr FR')}`

    expect(fetch).toHaveBeenCalledWith(expectedUrl, { headers: tmdbHeaders })
    expect(res.json).toHaveBeenCalledWith(tmdbPayload)
  })
})
