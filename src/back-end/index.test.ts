import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

type AppMock = {
  use: ReturnType<typeof vi.fn>
  get: ReturnType<typeof vi.fn>
  listen: ReturnType<typeof vi.fn>
}

type ExpressMockModule = {
  default: ReturnType<typeof vi.fn> & { json: ReturnType<typeof vi.fn> }
  __appMock: AppMock
  __jsonMock: ReturnType<typeof vi.fn>
}

type CorsMockModule = {
  default: ReturnType<typeof vi.fn>
}

type TvApiMockModule = {
  registerTvApi: ReturnType<typeof vi.fn>
}

type MoviesApiMockModule = {
  registerMoviesApi: ReturnType<typeof vi.fn>
}

vi.mock('express', () => {
  const appMock: AppMock = {
    use: vi.fn(),
    get: vi.fn(),
    listen: vi.fn((_port: number | string, onListen?: () => void) => {
      if (onListen) {
        onListen()
      }
    }),
  }

  const expressFactory = vi.fn(() => appMock)
  const jsonMock = vi.fn(() => 'json-middleware-token')

  return {
    default: Object.assign(expressFactory, { json: jsonMock }),
    __appMock: appMock,
    __jsonMock: jsonMock,
  }
})

vi.mock('cors', () => ({
  default: vi.fn(() => 'cors-middleware-token'),
}))

vi.mock('./tv-api', () => ({
  registerTvApi: vi.fn(),
}))

vi.mock('./movies-api', () => ({
  registerMoviesApi: vi.fn(),
}))

describe('back-end index bootstrap', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    delete process.env.PORT
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('wires middleware, health route, APIs, and listens on env PORT', async () => {
    process.env.PORT = '4321'

    await import('./index')

    const expressModule = (await import('express')) as unknown as ExpressMockModule
    const corsModule = (await import('cors')) as unknown as CorsMockModule
    const tvApiModule = (await import('./tv-api')) as unknown as TvApiMockModule
    const moviesApiModule = (await import('./movies-api')) as unknown as MoviesApiMockModule

    const app = expressModule.__appMock
    const corsMw = corsModule.default.mock.results[0]?.value
    const jsonMw = expressModule.__jsonMock.mock.results[0]?.value

    expect(corsModule.default).toHaveBeenCalledTimes(1)
    expect(expressModule.__jsonMock).toHaveBeenCalledTimes(1)
    expect(app.use).toHaveBeenNthCalledWith(1, corsMw)
    expect(app.use).toHaveBeenNthCalledWith(2, jsonMw)

    expect(app.get).toHaveBeenCalledWith('/api/health', expect.any(Function))

    expect(tvApiModule.registerTvApi).toHaveBeenCalledTimes(1)
    expect(tvApiModule.registerTvApi).toHaveBeenCalledWith(app)

    expect(moviesApiModule.registerMoviesApi).toHaveBeenCalledTimes(1)
    expect(moviesApiModule.registerMoviesApi).toHaveBeenCalledWith(app)

    expect(app.listen).toHaveBeenCalledWith('4321', expect.any(Function))
    expect(console.log).toHaveBeenCalledWith('Backend listening on http://localhost:4321')
  })

  it('listens on default port 3001 when PORT is not set', async () => {
    await import('./index')

    const expressModule = (await import('express')) as unknown as ExpressMockModule
    const app = expressModule.__appMock

    expect(app.listen).toHaveBeenCalledWith(3001, expect.any(Function))
    expect(console.log).toHaveBeenCalledWith('Backend listening on http://localhost:3001')
  })

  it('health route handler returns { status: "ok" }', async () => {
    await import('./index')

    const expressModule = (await import('express')) as unknown as ExpressMockModule
    const app = expressModule.__appMock

    const healthCall = app.get.mock.calls.find(
      (call: unknown[]) => call[0] === '/api/health',
    )
    expect(healthCall).toBeDefined()

    if (!healthCall) {
      return
    }

    const healthHandler = healthCall[1] as (
      req: unknown,
      res: { json: ReturnType<typeof vi.fn> },
    ) => void

    const res = {
      json: vi.fn(),
    }

    healthHandler({}, res)

    expect(res.json).toHaveBeenCalledWith({ status: 'ok' })
  })
})