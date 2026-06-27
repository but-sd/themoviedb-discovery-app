import type { Express } from 'express'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('./utils', () => ({
  TMDB_API_BASE_URL: 'https://api.themoviedb.org',
  getRequiredTmdbAuthHeaders: vi.fn(),
  getSingleQueryParam: vi.fn((value: unknown, fallback: string) =>
    typeof value === 'string' && value.length > 0 ? value : fallback,
  ),
}))

import { registerTvApi } from './tv-api'
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

describe('registerTvApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('registers tv endpoints', () => {
    const { app, get } = createMockApp()
    registerTvApi(app)

    expect(get).toHaveBeenCalledWith('/api/tv/popular', expect.any(Function))
    expect(get).toHaveBeenCalledWith('/api/tv/:id', expect.any(Function))
  })

  it('returns early when TMDB headers are missing', async () => {
    const { app, routes } = createMockApp()
    registerTvApi(app)
    vi.mocked(getRequiredTmdbAuthHeaders).mockReturnValue(null)

    const handler = routes.get('/api/tv/popular')
    const res = createMockResponse()

    await handler?.({ query: {}, params: { id: '' } }, res)

    expect(getRequiredTmdbAuthHeaders).toHaveBeenCalledWith(res)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('calls TMDB popular endpoint with bearer headers', async () => {
    const { app, routes } = createMockApp()
    registerTvApi(app)

    vi.mocked(getRequiredTmdbAuthHeaders).mockReturnValue(tmdbHeaders)
    vi.mocked(getSingleQueryParam)
      .mockReturnValueOnce('fr FR')
      .mockReturnValueOnce('FR')
      .mockReturnValueOnce('2')

    const tmdbPayload = { page: 2, results: [{ id: 1, name: 'Show' }] }
    fetchMock.mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(tmdbPayload) })

    const handler = routes.get('/api/tv/popular')
    const res = createMockResponse()

    await handler?.({ query: { language: 'x', region: 'y', page: 'z' }, params: { id: '' } }, res)

    const expectedUrl =
      `${TMDB_API_BASE_URL}/3/tv/popular?` +
      `language=${encodeURIComponent('fr FR')}` +
      `&region=${encodeURIComponent('FR')}` +
      `&page=${encodeURIComponent('2')}`

    expect(fetch).toHaveBeenCalledWith(expectedUrl, { headers: tmdbHeaders })
    expect(res.json).toHaveBeenCalledWith(tmdbPayload)
  })

  it('returns TMDB error details for tv popular', async () => {
    const { app, routes } = createMockApp()
    registerTvApi(app)

    vi.mocked(getRequiredTmdbAuthHeaders).mockReturnValue(tmdbHeaders)
    fetchMock.mockResolvedValue({ ok: false, status: 401, text: vi.fn().mockResolvedValue('Unauthorized') })

    const handler = routes.get('/api/tv/popular')
    const res = createMockResponse()

    await handler?.({ query: {}, params: { id: '' } }, res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({
      error: 'TMDB request failed with status 401',
      details: 'Unauthorized',
    })
  })

  it('calls TMDB details endpoint with bearer headers', async () => {
    const { app, routes } = createMockApp()
    registerTvApi(app)

    vi.mocked(getRequiredTmdbAuthHeaders).mockReturnValue(tmdbHeaders)
    vi.mocked(getSingleQueryParam).mockReturnValueOnce('fr FR')

    const tmdbPayload = { id: 1399, name: 'Game of Thrones' }
    fetchMock.mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(tmdbPayload) })

    const handler = routes.get('/api/tv/:id')
    const res = createMockResponse()

    await handler?.({ params: { id: '1399/abc' }, query: { language: 'x' } }, res)

    const expectedUrl =
      `${TMDB_API_BASE_URL}/3/tv/${encodeURIComponent('1399/abc')}?` +
      `language=${encodeURIComponent('fr FR')}`

    expect(fetch).toHaveBeenCalledWith(expectedUrl, { headers: tmdbHeaders })
    expect(res.json).toHaveBeenCalledWith(tmdbPayload)
  })
})
