import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchMovieDetails, fetchPopularMovies, fetchPopularMoviesPages } from './movies-service'

describe('movies-service', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('fetchPopularMovies uses default query params and returns results', async () => {
    const results: Array<{ id: number; title: string }> = [{ id: 1, title: 'Avatar' }]
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ results }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const data = await fetchPopularMovies()

    expect(fetchMock).toHaveBeenCalledWith('/api/movies/popular?language=fr-FR&region=FR&page=1')
    expect(data).toEqual(results)
  })

  it('fetchPopularMovies returns empty array when API payload has no results', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      }),
    )

    const data = await fetchPopularMovies({ language: 'en-US', region: 'US', page: 3 })

    expect(data).toEqual([])
  })

  it('fetchPopularMovies throws response text when request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: vi.fn().mockResolvedValue('API unavailable'),
      }),
    )

    await expect(fetchPopularMovies()).rejects.toThrow('API unavailable')
  })

  it('fetchPopularMovies throws status fallback when error text is empty', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        text: vi.fn().mockResolvedValue(''),
      }),
    )

    await expect(fetchPopularMovies()).rejects.toThrow('Request failed with status 503')
  })

  it('fetchPopularMoviesPages requests multiple pages and de-duplicates results', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ results: [{ id: 1, title: 'Avatar' }] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ results: [{ id: 1, title: 'Avatar' }, { id: 2, title: 'Titanic' }] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ results: [{ id: 3, title: 'Alien' }] }),
      })
    vi.stubGlobal('fetch', fetchMock)

    const data = await fetchPopularMoviesPages({ language: 'fr-FR', region: 'FR', pages: 3 })

    expect(fetchMock).toHaveBeenNthCalledWith(1, '/api/movies/popular?language=fr-FR&region=FR&page=1')
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/movies/popular?language=fr-FR&region=FR&page=2')
    expect(fetchMock).toHaveBeenNthCalledWith(3, '/api/movies/popular?language=fr-FR&region=FR&page=3')
    expect(data).toEqual([
      { id: 1, title: 'Avatar' },
      { id: 2, title: 'Titanic' },
      { id: 3, title: 'Alien' },
    ])
  })

  it('fetchMovieDetails calls encoded endpoint and returns payload', async () => {
    const payload = { id: 12, title: 'Interstellar' }
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(payload),
    })
    vi.stubGlobal('fetch', fetchMock)

    const data = await fetchMovieDetails('abc/12', { language: 'en-US' })

    expect(fetchMock).toHaveBeenCalledWith('/api/movies/abc%2F12?language=en-US')
    expect(data).toEqual(payload)
  })

  it('fetchMovieDetails throws status fallback when error text is empty', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        text: vi.fn().mockResolvedValue(''),
      }),
    )

    await expect(fetchMovieDetails(999)).rejects.toThrow('Request failed with status 404')
  })
})
