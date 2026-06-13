import type { Express } from 'express'
import type { HealthResponse } from './api-schemas'

/**
 * Registers the health check endpoint for the Express application.
 * @param app - The Express application instance.
 * 
 * This function sets up a GET endpoint at '/api/health' that responds with a JSON object indicating the health status of the service.
 * The response will always be { status: 'ok' }, indicating that the service is operational.
 */
export function registerHealthApi(app: Express): void {

  /**
   * Endpoint: GET /api/health
   * Description: Health check endpoint to verify that the service is operational.
   * Response: JSON object containing the health status of the service.
   * Example Response: { "status": "ok" }
   * 
   * This endpoint is useful for monitoring and ensuring that the service is running correctly. It can be used by load balancers, monitoring tools, or other services to check the health of this application.
   * The response is always a simple JSON object with a single property 'status' set to 'ok', indicating that the service is healthy. 
   */
  app.get('/api/health', (_req, res) => {
    const response: HealthResponse = { status: 'ok' }
    res.json(response)
  })
}
