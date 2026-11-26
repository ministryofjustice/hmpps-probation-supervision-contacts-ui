import nock from 'nock'
import * as Sentry from '@sentry/node'
import { asSystem } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import BaseRestClient from './restClient'

jest.mock('@sentry/node')

describe('BaseRestClient error handling', () => {
  const client = new BaseRestClient('Test API', config.apis.masApi, logger, {
    getToken: jest.fn().mockResolvedValue('token'),
  } as unknown as AuthenticationClient)
  const { url } = config.apis.masApi

  beforeEach(() => {
    jest.mocked(Sentry.getClient).mockReturnValue({} as ReturnType<typeof Sentry.getClient>)
  })

  afterEach(() => {
    nock.cleanAll()
    jest.resetAllMocks()
  })

  it('returns null for a handled 404', async () => {
    nock(url).get('/x').reply(404)
    expect(await client.get({ path: '/x', handle404: true }, asSystem('u'))).toBeNull()
  })

  it('returns the error message for a handled 500', async () => {
    nock(url).get('/x').times(3).reply(500)
    expect(await client.get({ path: '/x', handle500: true, errorMessage: 'Oops' }, asSystem('u'))).toEqual({
      errors: [{ text: 'Oops' }],
    })
  })

  it('handles any 5xx with handle5xxRange', async () => {
    nock(url).post('/x').reply(503)
    expect(await client.post({ path: '/x', handle5xxRange: true, errorMessage: 'Down' }, asSystem('u'))).toEqual({
      errors: [{ text: 'Down' }],
    })
  })

  it('throws for statuses that are not handled', async () => {
    nock(url).get('/x').reply(403)
    await expect(client.get({ path: '/x', handle404: true }, asSystem('u'))).rejects.toMatchObject({
      responseStatus: 403,
    })
  })

  it('falls back to a custom errorHandler for unhandled statuses', async () => {
    nock(url).get('/x').reply(418)
    const result = await client.get({ path: '/x', handle404: true, errorHandler: () => 'custom' }, asSystem('u'))
    expect(result).toEqual('custom')
  })

  describe('Sentry reporting', () => {
    it('reports a handled 403 and returns null', async () => {
      nock(url).get('/x').reply(403)
      expect(await client.get({ path: '/x', handle403: true }, asSystem('u'))).toBeNull()
      expect(Sentry.captureException).toHaveBeenCalledWith(expect.objectContaining({ responseStatus: 403 }), {
        tags: { 'error.kind': '403', 'request.path': '/x', 'api.name': 'Test API' },
      })
    })

    it('reports a handled timeout and returns timeoutError', async () => {
      nock(url).get('/x').times(3).delay(200).reply(200)
      const result = await client.get(
        { path: '/x', handleTimeout: true, timeout: { response: 50, deadline: 50 } },
        asSystem('u'),
      )
      expect(result).toEqual({ timeoutError: [{ text: 'Some information on this page is currently unavailable.' }] })
      expect(Sentry.captureException).toHaveBeenCalledWith(expect.anything(), {
        tags: { 'error.kind': 'timeout', 'request.path': '/x', 'api.name': 'Test API' },
      })
    })

    it('does not report when no Sentry client is configured', async () => {
      jest.mocked(Sentry.getClient).mockReturnValue(undefined)
      nock(url).get('/x').reply(403)
      await client.get({ path: '/x', handle403: true }, asSystem('u'))
      expect(Sentry.captureException).not.toHaveBeenCalled()
    })

    it('does not report handled 404s', async () => {
      nock(url).get('/x').reply(404)
      await client.get({ path: '/x', handle404: true }, asSystem('u'))
      expect(Sentry.captureException).not.toHaveBeenCalled()
    })
  })
})
