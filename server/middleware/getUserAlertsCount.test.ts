import type { Request, Response } from 'express'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import MasApiClient from '../data/masApiClient'
import { getUserAlertsCount } from './getUserAlertsCount'

jest.mock('../data/masApiClient')
const MockMasApiClient = jest.mocked(MasApiClient)

describe('getUserAlertsCount', () => {
  let next: jest.Mock
  let hmppsAuthClient: jest.Mocked<AuthenticationClient>

  beforeEach(() => {
    jest.resetAllMocks()
    next = jest.fn()
    hmppsAuthClient = {
      getToken: jest.fn().mockResolvedValue('test-system-token'),
    } as unknown as jest.Mocked<AuthenticationClient>
    MockMasApiClient.mockImplementation(
      () => ({ getUserAlertsCount: jest.fn().mockResolvedValue(5) }) as unknown as MasApiClient,
    )
  })

  function createReqRes(username = 'test-user'): { req: Request; res: Response } {
    const req = {} as Request
    const res = { locals: { user: { username } } } as unknown as Response
    return { req, res }
  }

  it('sets alertsCount from the API response and calls next', async () => {
    const { req, res } = createReqRes()

    await getUserAlertsCount(hmppsAuthClient)(req, res, next)

    expect(hmppsAuthClient.getToken).toHaveBeenCalledWith('test-user')
    expect(res.locals.alertsCount).toEqual('5')
    expect(next).toHaveBeenCalled()
  })

  it('sets alertsCount to "99+" when response is 100 or more', async () => {
    MockMasApiClient.mockImplementation(
      () => ({ getUserAlertsCount: jest.fn().mockResolvedValue(100) }) as unknown as MasApiClient,
    )
    const { req, res } = createReqRes()

    await getUserAlertsCount(hmppsAuthClient)(req, res, next)

    expect(res.locals.alertsCount).toEqual('99+')
    expect(next).toHaveBeenCalled()
  })
})
