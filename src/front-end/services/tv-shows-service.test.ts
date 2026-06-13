import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchPopularTvShows, fetchTvDetails } from './tv-shows-service'

describe('tv-shows-service', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('fetchPopularTvShows uses default query params and returns results', async () => {
    const results = [{ id: 1, name: 'The Show' }]
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ results }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const data = await fetchPopularTvShows()

    expect(fetchMock).toHaveBeenCalledWith('/api/tv/popular?language=fr-FR&region=FR&page=1')
    expect(data).toEqual(results)
  })

  it('fetchPopularTvShows returns empty array when API payload has no results', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      }),
    )

    const data = await fetchPopularTvShows({ language: 'en-US', region: 'US', page: 3 })

    expect(data).toEqual([])
  })

  it('fetchPopularTvShows throws response text when request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: vi.fn().mockResolvedValue('API unavailable'),
      }),
    )

    await expect(fetchPopularTvShows()).rejects.toThrow('API unavailable')
  })

  it('fetchPopularTvShows throws status fallback when error text is empty', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        text: vi.fn().mockResolvedValue(''),
      }),
    )

    await expect(fetchPopularTvShows()).rejects.toThrow('Request failed with status 503')
  })

  it('fetchTvDetails calls encoded endpoint and returns payload', async () => {
    const payload = { id: 12, name: 'The Last of Us' }
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(payload),
    })
    vi.stubGlobal('fetch', fetchMock)

    const data = await fetchTvDetails('abc/12', { language: 'en-US' })

    expect(fetchMock).toHaveBeenCalledWith('/api/tv/abc%2F12?language=en-US')
    expect(data).toEqual(payload)
  })

  it('fetchTvDetails throws status fallback when error text is empty', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        text: vi.fn().mockResolvedValue(''),
      }),
    )

    await expect(fetchTvDetails(999)).rejects.toThrow('Request failed with status 404')
  })
})
