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
 * getRequiredTmdbAuthHeaders is a utility function that returns the TMDB Bearer token header.
 * It checks for TMDB_API_TOKEN in the environment and returns headers ready to pass to fetch.
 * If the token is missing, it sends a 500 error response and returns null.
 * @param res The Express response object used to send an error response if the token is missing.
 * @returns A header object containing Authorization and Accept, otherwise null.
 */
export function getRequiredTmdbAuthHeaders(res: Response): Record<string, string> | null {
  const apiToken = process.env.TMDB_API_TOKEN

  if (!apiToken) {
    res.status(500).json({ error: 'Missing TMDB_API_TOKEN in environment' })
    return null
  }

  return {
    Authorization: `Bearer ${apiToken}`,
    Accept: 'application/json',
  }
}
