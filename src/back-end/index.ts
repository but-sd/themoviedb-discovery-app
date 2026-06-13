import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { registerApiSpec } from './api-spec'
import { serviceEndpoints, type ServiceInfoResponse } from './api-schemas'
import { registerMoviesApi } from './movies-api'
import { registerTvApi } from './tv-api'

// Initialize Express app
const app = express()
const port = process.env.PORT || 3001

// Middleware, e.g., CORS and JSON body parsing
app.use(cors())
app.use(express.json())

// Service information endpoint
app.get('/', (_req, res) => {
  const response: ServiceInfoResponse = {
    service: 'themoviedb-discovery-backend',
    status: 'ok',
    version: '1.0.0',
    docs: '/api/docs',
    openapi: '/openapi.json',
    endpoints: [...serviceEndpoints],
  }

  res.json(response)
})

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

// Register API routes from dedicated modules
registerApiSpec(app)
registerTvApi(app)
registerMoviesApi(app)

// Start the server
app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`)
})
