// Shared config so it survives jest.resetModules() when sentry.ts is re-required
const mockConfig: { sentry: { dsn?: string; tracesSampleRate?: number }; env: string } = { env: 'test-env', sentry: {} }
jest.mock('./config', () => ({ __esModule: true, default: mockConfig }))
jest.mock('@sentry/node', () => ({
  init: jest.fn(),
  expressIntegration: jest.fn(options => ({ name: 'Express', options })),
}))

const run = (dsn?: string) => {
  mockConfig.sentry = { dsn, tracesSampleRate: 0.5 }
  jest.resetModules()
  // eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
  const Sentry = require('@sentry/node') as typeof import('@sentry/node')
  // eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
  require('./sentry')
  return Sentry
}

describe('sentry', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('does not initialise Sentry without a DSN', () => {
    const Sentry = run('')

    expect(Sentry.init).not.toHaveBeenCalled()
  })

  it('initialises Sentry with config and privacy settings when a DSN is set', () => {
    const Sentry = run('https://key@sentry.example/1')

    expect(Sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: 'https://key@sentry.example/1',
        environment: 'test-env',
        tracesSampleRate: 0.5,
        integrations: [expect.objectContaining({ name: 'Express' })],
        dataCollection: {
          userInfo: false,
          cookies: false,
          httpHeaders: false,
          httpBodies: [],
          urlQueryParams: false,
          stackFrameVariables: false,
        },
      }),
    )
  })

  describe('beforeSend', () => {
    const getBeforeSend = () => {
      const Sentry = run('https://key@sentry.example/1')
      return (Sentry.init as jest.Mock).mock.calls[0][0].beforeSend
    }

    it('returns the event unchanged when there is no request', () => {
      const event = { message: 'boom' }

      expect(getBeforeSend()(event)).toBe(event)
    })

    it('removes the request body but keeps other request details', () => {
      const event = { request: { url: '/x', method: 'POST', data: { secret: 'value' } } }

      expect(getBeforeSend()(event)).toEqual({ request: { url: '/x', method: 'POST', data: undefined } })
    })
  })

  describe('shouldHandleError', () => {
    const getShouldHandleError = () => {
      const Sentry = run('https://key@sentry.example/1')
      return (Sentry.expressIntegration as jest.Mock).mock.calls[0][0].shouldHandleError
    }

    it.each([
      [{ status: 401 }, true],
      [{ status: 403 }, true],
      [{ status: 500 }, true],
      [{ statusCode: 503 }, true],
      [{}, true],
      [{ status: 400 }, false],
      [{ status: 404 }, false],
    ])('for %j returns %s', (error, expected) => {
      expect(getShouldHandleError()(error)).toBe(expected)
    })
  })
})
