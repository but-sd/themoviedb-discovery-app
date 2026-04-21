import type { Response } from 'express'

/**
 * TMDB_API_BASE_URL is a constant that holds the base URL for The Movie Database (TMDB) API.
 * This URL is used as the starting point for constructing API requests to TMDB for fetching movie and TV show data.
 * By centralizing the base URL in a constant, it allows for easier maintenance and updates if the API endpoint changes in the future.
 */
export const TMDB_API_BASE_URL = 'https://api.themoviedb.org'

/**
 * getSingleQueryParam is a utility function that extracts a single string value from a query parameter.
 * It handles both string and array types for the query parameter, returning the first valid string it finds.
 * If the value is not a valid string or is an empty string, it returns a provided fallback value. 
 * @param value The query parameter value which can be a string, an array of strings, or undefined.
 * @param fallback The default string value to return if the provided value is not valid.
 * @returns The extracted string value or the fallback value.
 */
export function getSingleQueryParam(value: unknown, fallback: string): string {
    if (typeof value === 'string' && value.length > 0) {
        return value
    }

    if (Array.isArray(value)) {
        const firstString = value.find((item): item is string => typeof item === 'string')
        if (firstString && firstString.length > 0) {
            return firstString
        }
    }

    return fallback
}

/**
 *  getRequiredTmdbApiKey is a utility function that retrieves the TMDB API key from environment variables.
 * It checks for the presence of TMDB_API_KEY or VITE_TMDB_API_KEY in the environment and returns it if found.
 * If neither variable is set, it sends a 500 error response indicating that the API key is missing and returns null.
 * This function is essential for ensuring that API requests to TMDB can be authenticated properly.
 * @param res The Express response object used to send an error response if the API key is missing.
 * @returns The TMDB API key if found, otherwise null.
 */
export function getRequiredTmdbApiKey(res: Response): string | null {
  const apiKey = process.env.TMDB_API_KEY || process.env.VITE_TMDB_API_KEY

  if (!apiKey) {
    res.status(500).json({ error: 'Missing TMDB_API_KEY in environment' })
    return null
  }

  return apiKey
}
