import type { Express } from 'express'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('./utils', () => ({
    TMDB_API_BASE_URL: 'https://api.themoviedb.org',
    getRequiredTmdbApiKey: vi.fn(),
    getSingleQueryParam: vi.fn((value: unknown, fallback: string) =>
        typeof value === 'string' && value.length > 0 ? value : fallback,
    ),
}))

import { registerMoviesApi } from './movies-api'
import { TMDB_API_BASE_URL, getRequiredTmdbApiKey, getSingleQueryParam } from './utils'

type MockRequest = {
    query: Record<string, unknown>
    params: {
        id: string
    }
}

type MockResponse = {
    status: ReturnType<typeof vi.fn>
    json: ReturnType<typeof vi.fn>
}

type RouteHandler = (req: MockRequest, res: MockResponse) => Promise<void> | void

let fetchMock: ReturnType<typeof vi.fn>

function createMockResponse() {
    const res: MockResponse = {
        status: vi.fn(),
        json: vi.fn(),
    }
    res.status.mockReturnValue(res)
    return res
}

function createMockApp() {
    const routes = new Map<string, RouteHandler>()
    const get = vi.fn((path: string, handler: RouteHandler) => {
        routes.set(path, handler)
    })
    const app = {
        get,
    } as unknown as Express

    return { app, routes, get }
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

    it('registers popular and movie-details endpoints', () => {
        const { app, get } = createMockApp()

        registerMoviesApi(app)

        expect(get).toHaveBeenCalledTimes(2)
        expect(get).toHaveBeenCalledWith('/api/movies/popular', expect.any(Function))
        expect(get).toHaveBeenCalledWith('/api/movies/:id', expect.any(Function))
    })

    describe('GET /api/movies/popular', () => {
        it('returns early when API key is missing', async () => {
            const { app, routes } = createMockApp()
            registerMoviesApi(app)

            vi.mocked(getRequiredTmdbApiKey).mockReturnValue(null)

            const handler = routes.get('/api/movies/popular')
            const res = createMockResponse()

            await handler?.({ query: {}, params: { id: '' } }, res)

            expect(getRequiredTmdbApiKey).toHaveBeenCalledWith(res)
            expect(fetch).not.toHaveBeenCalled()
        })

        it('builds TMDB URL, fetches, and returns JSON on success', async () => {
            const { app, routes } = createMockApp()
            registerMoviesApi(app)

            vi.mocked(getRequiredTmdbApiKey).mockReturnValue('api key')
            vi.mocked(getSingleQueryParam)
                .mockReturnValueOnce('fr FR')
                .mockReturnValueOnce('FR')
                .mockReturnValueOnce('2')

            const tmdbPayload = { page: 2, results: [{ id: 1, title: 'Movie' }] }
            fetchMock.mockResolvedValue({
                ok: true,
                json: vi.fn().mockResolvedValue(tmdbPayload),
            })

            const handler = routes.get('/api/movies/popular')
            const req = { query: { language: 'x', region: 'y', page: 'z' }, params: { id: '' } }
            const res = createMockResponse()

            await handler?.(req, res)

            const expectedUrl =
                `${TMDB_API_BASE_URL}/3/movie/popular?` +
                `api_key=${encodeURIComponent('api key')}` +
                `&language=${encodeURIComponent('fr FR')}` +
                `&region=${encodeURIComponent('FR')}` +
                `&page=${encodeURIComponent('2')}`

            expect(fetch).toHaveBeenCalledWith(expectedUrl)
            expect(res.json).toHaveBeenCalledWith(tmdbPayload)
            expect(res.status).not.toHaveBeenCalled()
        })

        it('returns TMDB status and details when TMDB responds non-ok', async () => {
            const { app, routes } = createMockApp()
            registerMoviesApi(app)

            vi.mocked(getRequiredTmdbApiKey).mockReturnValue('tmdb-key')
            vi.mocked(getSingleQueryParam)
                .mockReturnValueOnce('fr-FR')
                .mockReturnValueOnce('FR')
                .mockReturnValueOnce('1')

            fetchMock.mockResolvedValue({
                ok: false,
                status: 401,
                text: vi.fn().mockResolvedValue('Unauthorized'),
            })

            const handler = routes.get('/api/movies/popular')
            const res = createMockResponse()

            await handler?.({ query: {}, params: { id: '' } }, res)

            expect(res.status).toHaveBeenCalledWith(401)
            expect(res.json).toHaveBeenCalledWith({
                error: 'TMDB request failed with status 401',
                details: 'Unauthorized',
            })
        })

        it('returns 500 when fetch throws', async () => {
            const { app, routes } = createMockApp()
            registerMoviesApi(app)

            vi.mocked(getRequiredTmdbApiKey).mockReturnValue('tmdb-key')
            vi.mocked(getSingleQueryParam)
                .mockReturnValueOnce('fr-FR')
                .mockReturnValueOnce('FR')
                .mockReturnValueOnce('1')

            fetchMock.mockRejectedValue(new Error('Network down'))

            const handler = routes.get('/api/movies/popular')
            const res = createMockResponse()

            await handler?.({ query: {}, params: { id: '' } }, res)

            expect(res.status).toHaveBeenCalledWith(500)
            expect(res.json).toHaveBeenCalledWith({ error: 'Network down' })
        })

        it('returns 500 with generic message when fetch throws non-Error', async () => {
            const { app, routes } = createMockApp()
            registerMoviesApi(app)

            vi.mocked(getRequiredTmdbApiKey).mockReturnValue('tmdb-key')
            vi.mocked(getSingleQueryParam)
                .mockReturnValueOnce('fr-FR')
                .mockReturnValueOnce('FR')
                .mockReturnValueOnce('1')

            fetchMock.mockRejectedValue('Unexpected string error')

            const handler = routes.get('/api/movies/popular')
            const res = createMockResponse()

            await handler?.({ query: {}, params: { id: '' } }, res)

            expect(res.status).toHaveBeenCalledWith(500)
            expect(res.json).toHaveBeenCalledWith({ error: 'Unknown server error' })
        })
    })

    describe('GET /api/movies/:id', () => {
        it('returns early when API key is missing', async () => {
            const { app, routes } = createMockApp()
            registerMoviesApi(app)

            vi.mocked(getRequiredTmdbApiKey).mockReturnValue(null)

            const handler = routes.get('/api/movies/:id')
            const res = createMockResponse()

            await handler?.({ query: {}, params: { id: '550' } }, res)

            expect(getRequiredTmdbApiKey).toHaveBeenCalledWith(res)
            expect(fetch).not.toHaveBeenCalled()
        })
        
        it('builds details URL, fetches, and returns JSON on success', async () => {
            const { app, routes } = createMockApp()
            registerMoviesApi(app)

            vi.mocked(getRequiredTmdbApiKey).mockReturnValue('api key')
            vi.mocked(getSingleQueryParam).mockReturnValueOnce('fr FR')

            const tmdbPayload = { id: 550, title: 'Fight Club' }
            fetchMock.mockResolvedValue({
                ok: true,
                json: vi.fn().mockResolvedValue(tmdbPayload),
            })

            const handler = routes.get('/api/movies/:id')
            const req = { params: { id: '550/abc' }, query: { language: 'x' } }
            const res = createMockResponse()

            await handler?.(req, res)

            const expectedUrl =
                `${TMDB_API_BASE_URL}/3/movie/${encodeURIComponent('550/abc')}?` +
                `api_key=${encodeURIComponent('api key')}` +
                `&language=${encodeURIComponent('fr FR')}`

            expect(fetch).toHaveBeenCalledWith(expectedUrl)
            expect(res.json).toHaveBeenCalledWith(tmdbPayload)
            expect(res.status).not.toHaveBeenCalled()
        })

        it('returns TMDB status and details for non-ok details response', async () => {
            const { app, routes } = createMockApp()
            registerMoviesApi(app)

            vi.mocked(getRequiredTmdbApiKey).mockReturnValue('tmdb-key')
            vi.mocked(getSingleQueryParam).mockReturnValueOnce('fr-FR')

            fetchMock.mockResolvedValue({
                ok: false,
                status: 404,
                text: vi.fn().mockResolvedValue('Not Found'),
            })

            const handler = routes.get('/api/movies/:id')
            const res = createMockResponse()

            await handler?.({ params: { id: '999' }, query: {} }, res)

            expect(res.status).toHaveBeenCalledWith(404)
            expect(res.json).toHaveBeenCalledWith({
                error: 'TMDB request failed with status 404',
                details: 'Not Found',
            })
        })
    })

    it('returns 500 when details fetch throws', async () => {
        const { app, routes } = createMockApp()
        registerMoviesApi(app)

        vi.mocked(getRequiredTmdbApiKey).mockReturnValue('tmdb-key')
        vi.mocked(getSingleQueryParam).mockReturnValueOnce('fr-FR')

        fetchMock.mockRejectedValue(new Error('Network down'))

        const handler = routes.get('/api/movies/:id')
        const res = createMockResponse()

        await handler?.({ params: { id: '550' }, query: {} }, res)

        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({ error: 'Network down' })
    })

    it('returns 500 with generic message when details fetch throws non-Error', async () => {
        const { app, routes } = createMockApp()
        registerMoviesApi(app)

        vi.mocked(getRequiredTmdbApiKey).mockReturnValue('tmdb-key')
        vi.mocked(getSingleQueryParam).mockReturnValueOnce('fr-FR')

        fetchMock.mockRejectedValue('Unexpected string error')

        const handler = routes.get('/api/movies/:id')
        const res = createMockResponse()

        await handler?.({ params: { id: '550' }, query: {} }, res)

        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({ error: 'Unknown server error' })
    })

})
