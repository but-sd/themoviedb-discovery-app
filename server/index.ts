import 'dotenv/config'
import cors from 'cors'
import express from 'express'

const app = express()
const port = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.get('/api/movies/popular', async (req, res) => {
  const apiKey = process.env.TMDB_API_KEY || process.env.VITE_TMDB_API_KEY

  if (!apiKey) {
    res.status(500).json({ error: 'Missing TMDB_API_KEY in environment' })
    return
  }

  const language = String(req.query.language || 'fr-FR')
  const region = String(req.query.region || 'FR')
  const page = String(req.query.page || '1')

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

    const data = await tmdbResponse.json()
    res.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server error'
    res.status(500).json({ error: message })
  }
})

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`)
})
