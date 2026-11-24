import type { Request, Response } from 'express'
import MasApiClient from '../data/masApiClient'
import { getContactOutcomes } from './getContactOutcomes'

describe('getContactOutcomes', () => {
  let next: jest.Mock
  let mockMasApiClient: jest.Mocked<Pick<MasApiClient, 'getContactTypeOutcomes'>>

  beforeEach(() => {
    jest.resetAllMocks()
    next = jest.fn()
    mockMasApiClient = {
      getContactTypeOutcomes: jest.fn().mockResolvedValue({ outcomes: [{ code: 'ETRP' }] }),
    }
  })

  function createReqRes(username = 'test-user'): { req: Request; res: Response } {
    const req = {} as Request
    const res = {
      locals: {
        user: { username },
        contactCode: 'ETRP',
        flags: { enableEarlyTermination20261103Squad3: true, enableCheckOutcomes20261124Squad3: true },
      },
    } as unknown as Response
    return { req, res }
  }

  it('sets contactOutcomes from the API response and calls next', async () => {
    const { req, res } = createReqRes()

    await getContactOutcomes(mockMasApiClient as unknown as MasApiClient)(req, res, next)

    expect(mockMasApiClient.getContactTypeOutcomes).toHaveBeenCalledWith('ETRP', 'test-user')
    expect(res.locals.outcomeCodes).toEqual(['ETRP'])
    expect(next).toHaveBeenCalled()
  })

  it('does not set contactOutcomes if no contactCode', async () => {
    const { req, res } = createReqRes()

    res.locals.contactCode = undefined
    res.locals.flags = { enableEarlyTermination20261103Squad3: true }

    await getContactOutcomes(mockMasApiClient as unknown as MasApiClient)(req, res, next)

    expect(mockMasApiClient.getContactTypeOutcomes).not.toHaveBeenCalled()
    expect(res.locals.outcomeCodes).toEqual(undefined)
    expect(next).toHaveBeenCalled()
  })

  it('does not set contactOutcomes if flag off', async () => {
    const { req, res } = createReqRes()

    res.locals.flags = { enableEarlyTermination20261103Squad3: false }

    await getContactOutcomes(mockMasApiClient as unknown as MasApiClient)(req, res, next)

    expect(mockMasApiClient.getContactTypeOutcomes).not.toHaveBeenCalled()
    expect(res.locals.outcomeCodes).toEqual(undefined)
    expect(next).toHaveBeenCalled()
  })
})
