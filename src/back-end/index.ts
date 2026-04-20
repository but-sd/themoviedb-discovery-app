import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { type Item, type MovieDetails, type TvShowDetails } from "../front-end/Types"

const app = express()
const port = process.env.PORT || 3001

export type ItemsResponse = {
  results?: Item[]
}

function getSingleQueryParam(value: unknown, fallback: string): string {
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

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.get('/api/tv/popular', async (req, res) => {
  const apiKey = process.env.TMDB_API_KEY || process.env.VITE_TMDB_API_KEY

  if (!apiKey) {
    res.status(500).json({ error: 'Missing TMDB_API_KEY in environment' })
    return
  }

  const language = getSingleQueryParam(req.query.language, 'fr-FR')
  const region = getSingleQueryParam(req.query.region, 'FR')
  const page = getSingleQueryParam(req.query.page, '1')
  
  const tmdbUrl = `https://api.themoviedb.org/3/tv/popular?` +
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

    const data = await tmdbResponse.json() as ItemsResponse
    res.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server error'
    res.status(500).json({ error: message })
  }
})

app.get('/api/tv/:id', async (req, res) => {
  const apiKey = process.env.TMDB_API_KEY || process.env.VITE_TMDB_API_KEY

  if (!apiKey) {
    res.status(500).json({ error: 'Missing TMDB_API_KEY in environment' })
    return
  }

  const tvId = req.params.id
  const language = getSingleQueryParam(req.query.language, 'fr-FR')

  const tmdbUrl =
    `https://api.themoviedb.org/3/tv/${encodeURIComponent(tvId)}?` +
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

    const data = await tmdbResponse.json() as TvShowDetails
    res.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server error'
    res.status(500).json({ error: message })
  }
})

app.get('/api/movies/popular', async (req, res) => {
  const apiKey = process.env.TMDB_API_KEY || process.env.VITE_TMDB_API_KEY

  if (!apiKey) {
    res.status(500).json({ error: 'Missing TMDB_API_KEY in environment' })
    return
  }

  const language = getSingleQueryParam(req.query.language, 'fr-FR')
  const region = getSingleQueryParam(req.query.region, 'FR')
  const page = getSingleQueryParam(req.query.page, '1')

  const tmdbUrl =
    `https://api.themoviedb.org/3/movie/popular?` +
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

    const data = await tmdbResponse.json() as ItemsResponse
    res.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server error'
    res.status(500).json({ error: message })
  }
})

/**
 * Endpoint to fetch detailed information about a specific movie by its ID. The movie ID is provided as a URL parameter. The endpoint constructs a request to the TMDB API using the provided movie ID and returns the movie details in JSON format. If the TMDB request fails or if there is an error during the fetch operation, it responds with an appropriate error message and status code.
 * @route GET /api/movies/:id
 * @param {string} id - The ID of the movie to fetch details for.
 * @returns {object} Movie details in JSON format or an error message.
 */
app.get('/api/movies/:id', async (req, res) => {
  const apiKey = process.env.TMDB_API_KEY || process.env.VITE_TMDB_API_KEY

  if (!apiKey) {
    res.status(500).json({ error: 'Missing TMDB_API_KEY in environment' })
    return
  }

  const movieId = req.params.id
  const language = getSingleQueryParam(req.query.language, 'fr-FR')

  const tmdbUrl =
    `https://api.themoviedb.org/3/movie/${encodeURIComponent(movieId)}?` +
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

    const data = await tmdbResponse.json() as MovieDetails
    res.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server error'
    res.status(500).json({ error: message })
  }
})

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`)
})
