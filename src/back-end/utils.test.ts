import type { Response } from 'express'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TMDB_API_BASE_URL, getRequiredTmdbApiKey, getSingleQueryParam } from './utils'

function createMockResponse() {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  }

  res.status.mockReturnValue(res)

  return res as unknown as Response & {
    status: ReturnType<typeof vi.fn>
    json: ReturnType<typeof vi.fn>
  }
}

describe('utils', () => {
  afterEach(() => {
    delete process.env.TMDB_API_KEY
    delete process.env.VITE_TMDB_API_KEY
    vi.restoreAllMocks()
  })

  describe('TMDB_API_BASE_URL', () => {
    it('exports the TMDB base URL', () => {
      expect(TMDB_API_BASE_URL).toBe('https://api.themoviedb.org')
    })
  })

  describe('getSingleQueryParam', () => {
    it('returns the string value when valid', () => {
      expect(getSingleQueryParam('fr-FR', 'en-US')).toBe('fr-FR')
    })

    it('returns the fallback when the string is empty', () => {
      expect(getSingleQueryParam('', 'en-US')).toBe('en-US')
    })

    it('returns the first valid string from an array', () => {
      expect(getSingleQueryParam([1, 'fr-FR', 'en-US'], 'en-US')).toBe('fr-FR')
    })

    it('returns the fallback when the array has no valid string', () => {
      expect(getSingleQueryParam([1, true, null], 'en-US')).toBe('en-US')
    })

    it('returns the fallback for undefined', () => {
      expect(getSingleQueryParam(undefined, 'en-US')).toBe('en-US')
    })
  })

  describe('getRequiredTmdbApiKey', () => {
    it('returns TMDB_API_KEY when present', () => {
      process.env.TMDB_API_KEY = 'tmdb-key'
      const res = createMockResponse()

      const result = getRequiredTmdbApiKey(res)

      expect(result).toBe('tmdb-key')
      expect(res.status).not.toHaveBeenCalled()
      expect(res.json).not.toHaveBeenCalled()
    })

    it('returns VITE_TMDB_API_KEY when TMDB_API_KEY is missing', () => {
      process.env.VITE_TMDB_API_KEY = 'vite-key'
      const res = createMockResponse()

      const result = getRequiredTmdbApiKey(res)

      expect(result).toBe('vite-key')
      expect(res.status).not.toHaveBeenCalled()
      expect(res.json).not.toHaveBeenCalled()
    })

    it('prefers TMDB_API_KEY over VITE_TMDB_API_KEY', () => {
      process.env.TMDB_API_KEY = 'tmdb-key'
      process.env.VITE_TMDB_API_KEY = 'vite-key'
      const res = createMockResponse()

      const result = getRequiredTmdbApiKey(res)

      expect(result).toBe('tmdb-key')
    })

    it('returns null and sends a 500 response when no API key is set', () => {
      const res = createMockResponse()

      const result = getRequiredTmdbApiKey(res)

      expect(result).toBeNull()
      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Missing TMDB_API_KEY in environment',
      })
    })
  })
})