import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { registerMoviesApi } from './movies-api'
import { registerTvApi } from './tv-api'

// Initialize Express app
const app = express()
const port = process.env.PORT || 3001

// Middleware, e.g., CORS and JSON body parsing
app.use(cors())
app.use(express.json())

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

// Register API routes from dedicated modules
registerTvApi(app)
registerMoviesApi(app)

// Start the server
app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`)
})
