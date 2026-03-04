import type { Request, Response } from 'express'
import MasApiClient from '../data/masApiClient'
import { getUserAlertsCount } from './getUserAlertsCount'

describe('getUserAlertsCount', () => {
  let next: jest.Mock
  let mockMasApiClient: jest.Mocked<Pick<MasApiClient, 'getUserAlertsCount'>>

  beforeEach(() => {
    jest.resetAllMocks()
    next = jest.fn()
    mockMasApiClient = {
      getUserAlertsCount: jest.fn().mockResolvedValue(5),
    }
  })

  function createReqRes(username = 'test-user'): { req: Request; res: Response } {
    const req = {} as Request
    const res = { locals: { user: { username } } } as unknown as Response
    return { req, res }
  }

  it('sets alertsCount from the API response and calls next', async () => {
    const { req, res } = createReqRes()

    await getUserAlertsCount(mockMasApiClient as unknown as MasApiClient)(req, res, next)

    expect(mockMasApiClient.getUserAlertsCount).toHaveBeenCalledWith('test-user')
    expect(res.locals.alertsCount).toEqual('5')
    expect(next).toHaveBeenCalled()
  })

  it('sets alertsCount to "99+" when response is 100 or more', async () => {
    mockMasApiClient.getUserAlertsCount.mockResolvedValue(100)
    const { req, res } = createReqRes()

    await getUserAlertsCount(mockMasApiClient as unknown as MasApiClient)(req, res, next)

    expect(res.locals.alertsCount).toEqual('99+')
    expect(next).toHaveBeenCalled()
  })
})
