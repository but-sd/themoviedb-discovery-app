import type { Express } from 'express'
import { describe, expect, it, vi } from 'vitest'
import { registerHealthApi } from './health-api'

type MockResponse = {
  json: ReturnType<typeof vi.fn>
}

type RouteHandler = (req: unknown, res: MockResponse) => void

function createMockApp() {
  const routes = new Map<string, RouteHandler>()
  const get = vi.fn((path: string, handler: RouteHandler) => {
    routes.set(path, handler)
  })
  const app = { get } as unknown as Express

  return { app, routes, get }
}

describe('registerHealthApi', () => {
  it('registers /api/health endpoint', () => {
    const { app, get } = createMockApp()

    registerHealthApi(app)

    expect(get).toHaveBeenCalledTimes(1)
    expect(get).toHaveBeenCalledWith('/api/health', expect.any(Function))
  })

  it('returns { status: "ok" } from /api/health handler', () => {
    const { app, routes } = createMockApp()

    registerHealthApi(app)

    const handler = routes.get('/api/health')
    const res = {
      json: vi.fn(),
    }

    handler?.({}, res)

    expect(res.json).toHaveBeenCalledWith({ status: 'ok' })
  })
})
