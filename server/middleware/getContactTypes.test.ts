import type { Request, Response } from 'express'
import MasApiClient from '../data/masApiClient'
import { getContactTypes } from './getContactTypes'

describe('getContactTypes', () => {
  let next: jest.Mock
  let mockMasApiClient: jest.Mocked<Pick<MasApiClient, 'getAllContactTypes'>>

  beforeEach(() => {
    jest.resetAllMocks()
    next = jest.fn()
    mockMasApiClient = {
      getAllContactTypes: jest.fn().mockResolvedValue({ contactTypes: [{ code: 'ETRP' }] }),
    }
  })

  function createReqRes(username = 'test-user'): { req: Request; res: Response } {
    const req = {} as Request
    const res = {
      locals: {
        user: { username },
        flags: { enableEarlyTermination20261103Squad3: true, enableCheckOutcomes20261124Squad3: true },
      },
    } as unknown as Response
    return { req, res }
  }

  it('sets contactTypes from the API response and calls next', async () => {
    const { req, res } = createReqRes()

    await getContactTypes(mockMasApiClient as unknown as MasApiClient)(req, res, next)

    expect(mockMasApiClient.getAllContactTypes).toHaveBeenCalledWith('test-user')
    expect(res.locals.contactTypes).toEqual([
      {
        categories: { 'Sentence management': '' },
        code: 'ETRP',
        description: 'Early termination request',
        isFrequentlyUsed: true,
        mandatoryOutcome: true,
        outcomes: {
          ET01: { label: 'Checklist in progress', systemLabel: 'Checklist in progress', value: 'ET01' },
          ET02: { label: 'Referred to panel', systemLabel: 'Referred to panel', value: 'ET02' },
          ET07: { label: 'Deferred by Practitioner', systemLabel: 'Deferred by Practitioner', value: 'ET07' },
        },
        relatesTo: ['Pre-CJA Events', 'CJA/ORA Events'],
        sensitive: false,
      },
    ])
    expect(next).toHaveBeenCalled()
  })

  it('does not set contactOutcomes if flag off', async () => {
    const { req, res } = createReqRes()

    res.locals.flags = { enableCheckOutcomes20261124Squad3: false }

    await getContactTypes(mockMasApiClient as unknown as MasApiClient)(req, res, next)

    expect(mockMasApiClient.getAllContactTypes).not.toHaveBeenCalled()
    expect(res.locals.contactTypes).toEqual(undefined)
    expect(next).toHaveBeenCalled()
  })
})
