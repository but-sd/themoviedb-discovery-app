import type { Express } from 'express'
import { describe, expect, it, vi } from 'vitest'

vi.mock('swagger-ui-express', () => {
  const setup = vi.fn(() => 'docs-middleware-token')

  return {
    default: {
      serve: 'serve-middleware-token',
      setup,
    },
  }
})

import swaggerUi from 'swagger-ui-express'
import { OPENAPI_SPEC, registerApiSpec } from './api-spec'

type MockResponse = {
  json: ReturnType<typeof vi.fn>
}

type RouteHandler = (req: unknown, res: MockResponse) => void

function createMockApp() {
  const routes = new Map<string, RouteHandler>()
  const get = vi.fn((path: string, handler: RouteHandler) => {
    routes.set(path, handler)
  })
  const use = vi.fn()

  return {
    app: { get, use } as unknown as Express,
    routes,
    get,
    use,
  }
}

describe('registerApiSpec', () => {
  it('registers /openapi.json and docs middleware', () => {
    const { app, get, use } = createMockApp()

    registerApiSpec(app)

    expect(get).toHaveBeenCalledTimes(1)
    expect(get).toHaveBeenCalledWith('/openapi.json', expect.any(Function))

    expect(swaggerUi.setup).toHaveBeenCalledTimes(1)
    expect(swaggerUi.setup).toHaveBeenCalledWith(OPENAPI_SPEC)
    expect(use).toHaveBeenCalledWith(
      '/api/docs',
      swaggerUi.serve,
      'docs-middleware-token',
    )
  })

  it('returns the OpenAPI document from /openapi.json handler', () => {
    const { app, routes } = createMockApp()
    registerApiSpec(app)

    const handler = routes.get('/openapi.json')
    const res = {
      json: vi.fn(),
    }

    handler?.({}, res)

    expect(res.json).toHaveBeenCalledWith(OPENAPI_SPEC)
    expect(OPENAPI_SPEC.openapi).toBe('3.1.0')
    expect(OPENAPI_SPEC.paths['/']).toBeDefined()
    expect(OPENAPI_SPEC.paths['/api/movies/popular']).toBeDefined()
    expect(OPENAPI_SPEC.paths['/api/tv/{id}']).toBeDefined()
    expect(OPENAPI_SPEC.components.schemas.ServiceInfoResponse).toBeDefined()
  })
})
