import type { Express } from 'express'
import type { MoviePopularResponse } from './types'
import { type MovieDetails } from '../front-end/Types'
import { TMDB_API_BASE_URL, getRequiredTmdbApiKey, getSingleQueryParam } from './utils'

/**
 * TMDB_MOVIE_API_BASE_URL is a constant that holds the base URL for movie-related endpoints of The Movie Database (TMDB) API.
 * This URL is used as the starting point for constructing API requests to TMDB specifically for fetching movie data.
 * By centralizing the movie-specific base URL in a constant, it allows for easier maintenance and updates if the API endpoint changes in the future.
 */
const TMDB_MOVIE_API_BASE_URL = `${TMDB_API_BASE_URL}/3/movie`

/**
 * Registers movie-related API endpoints on the given Express app instance.
 * - GET /api/movies/popular: Fetches popular movies from TMDB with optional query parameters for language, region, and page.
 * - GET /api/movies/:id: Fetches detailed information about a specific movie by its ID, with an optional language query parameter.
 *
 * Both endpoints require a valid TMDB API key to be set in the environment variables (TMDB_API_KEY or VITE_TMDB_API_KEY).
 * The endpoints handle errors gracefully, returning appropriate HTTP status codes and error messages in case of failures.  
 */
export function registerMoviesApi(app: Express): void {
  /**
   * Endpoint: GET /api/movies/popular
   * Description: Fetches popular movies from TMDB.
   * Query Parameters:
   * - language (optional): The language for the results (default: 'fr-FR').
   * - region (optional): The region for the results (default: 'FR').
   * - page (optional): The page number for pagination (default: '1').
   *
   * Response: JSON object containing popular movies or an error message.
   */
  app.get('/api/movies/popular', async (req, res) => {
    const apiKey = getRequiredTmdbApiKey(res)

    if (!apiKey) {
      return
    }

    const language = getSingleQueryParam(req.query.language, 'fr-FR')
    const region = getSingleQueryParam(req.query.region, 'FR')
    const page = getSingleQueryParam(req.query.page, '1')

    const tmdbUrl =
      `${TMDB_MOVIE_API_BASE_URL}/popular?` +
      `api_key=${encodeURIComponent(apiKey)}` +
      `&language=${encodeURIComponent(language)}` +
      `&region=${encodeURIComponent(region)}` +
      `&page=${encodeURIComponent(page)}`

    try {
      const tmdbResponse = await fetch(tmdbUrl)

      if (!tmdbResponse.ok) {
        const errorBody = await tmdbResponse.text()
        res.status(tmdbResponse.status).json({
          error: `TMDB request failed with status ${tmdbResponse.status}`,
          details: errorBody,
        })
        return
      }

      const data = (await tmdbResponse.json()) as MoviePopularResponse
      res.json(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown server error'
      res.status(500).json({ error: message })
    }
  })

  /**
   * Endpoint: GET /api/movies/:id
   * Description: Fetches detailed information about a specific movie by its ID.
   * Path Parameters:
   * - id: The ID of the movie to fetch details for.
   * Query Parameters:
   * - language (optional): The language for the results (default: 'fr-FR').
   *
   * Response: JSON object containing movie details or an error message.
   * Note: The movie ID is expected to be a valid TMDB movie ID. If the ID is invalid or the movie is not found, an appropriate error message will be returned.
   */
  app.get('/api/movies/:id', async (req, res) => {
    const apiKey = getRequiredTmdbApiKey(res)

    if (!apiKey) {
      return
    }

    const movieId = req.params.id
    const language = getSingleQueryParam(req.query.language, 'fr-FR')

    const tmdbUrl =
      `${TMDB_MOVIE_API_BASE_URL}/${encodeURIComponent(movieId)}?` +
      `api_key=${encodeURIComponent(apiKey)}` +
      `&language=${encodeURIComponent(language)}`

    try {
      const tmdbResponse = await fetch(tmdbUrl)

      if (!tmdbResponse.ok) {
        const errorBody = await tmdbResponse.text()
        res.status(tmdbResponse.status).json({
          error: `TMDB request failed with status ${tmdbResponse.status}`,
          details: errorBody,
        })
        return
      }

      const data = (await tmdbResponse.json()) as MovieDetails
      res.json(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown server error'
      res.status(500).json({ error: message })
    }
  })
}