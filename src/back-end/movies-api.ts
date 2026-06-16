import type { Express } from 'express'
import type { MovieDetails, MovieGenresResponse, MoviePopularResponse } from './api-schemas'
import { TMDB_API_BASE_URL, getRequiredTmdbApiKey, getSingleQueryParam } from './utils'

const TMDB_MOVIE_API_BASE_URL = `${TMDB_API_BASE_URL}/3/movie`
const TMDB_MOVIE_GENRE_API_BASE_URL = `${TMDB_API_BASE_URL}/3/genre/movie`

/**
 * Registers movie-related API endpoints on the given Express app instance.
 * - GET /api/movies/popular: Fetches popular movies from TMDB with optional query parameters for language, region, and page.
 * - GET /api/movies/top-rated: Fetches top rated movies from TMDB with optional query parameters for language, region, and page.
 * - GET /api/movies/genres: Fetches available movie genres from TMDB, with an optional language query parameter.
 * - GET /api/movies/:id: Fetches detailed information about a specific movie by its ID, with an optional language query parameter.
 */
export function registerMoviesApi(app: Express): void {
  const registerMoviesListEndpoint = (path: string, tmdbPath: 'popular' | 'top_rated') => {
    app.get(path, async (req, res) => {
      const apiKey = getRequiredTmdbApiKey(res)

      if (!apiKey) {
        return
      }

      const language = getSingleQueryParam(req.query.language, 'fr-FR')
      const region = getSingleQueryParam(req.query.region, 'FR')
      const page = getSingleQueryParam(req.query.page, '1')

      const tmdbUrl =
        `${TMDB_MOVIE_API_BASE_URL}/${tmdbPath}?` +
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
  }

  registerMoviesListEndpoint('/api/movies/popular', 'popular')
  registerMoviesListEndpoint('/api/movies/top-rated', 'top_rated')

  app.get('/api/movies/genres', async (req, res) => {
    const apiKey = getRequiredTmdbApiKey(res)

    if (!apiKey) {
      return
    }

    const language = getSingleQueryParam(req.query.language, 'fr-FR')
    const tmdbUrl =
      `${TMDB_MOVIE_GENRE_API_BASE_URL}/list?` +
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

      const data = (await tmdbResponse.json()) as MovieGenresResponse
      res.json(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown server error'
      res.status(500).json({ error: message })
    }
  })

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
