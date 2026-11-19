import type { Request, Response } from 'express'
import MasApiClient from '../data/masApiClient'
import { getTemplates } from './getTemplates'

describe('getTemplates', () => {
  let next: jest.Mock
  let mockMasApiClient: jest.Mocked<Pick<MasApiClient, 'getDocumentTemplates'>>

  const mockTemplates = [{ name: 'template' }]

  beforeEach(() => {
    jest.resetAllMocks()
    next = jest.fn()
    mockMasApiClient = {
      getDocumentTemplates: jest.fn().mockResolvedValue(mockTemplates),
    }
  })

  function createReqRes(username = 'test-user'): { req: Request; res: Response } {
    const req = { params: { contactType: '' } } as unknown as Request
    const res = { locals: { user: { username }, contactCode: 'C204' } } as unknown as Response
    return { req, res }
  }

  it('sets templates if early termination flag is set and contactCode can be found', async () => {
    const { req, res } = createReqRes()
    res.locals.flags = { enableEarlyTermination20261103Squad3: true, earlyTerminationTemplatesAPI20261112Squad3: true }

    await getTemplates(mockMasApiClient as unknown as MasApiClient)(req, res, next)

    expect(mockMasApiClient.getDocumentTemplates).toHaveBeenCalledWith('C204', 'test-user')
    expect(res.locals.documentTemplates).toEqual(mockTemplates)
    expect(next).toHaveBeenCalled()
  })

  it('does not set templates if early termination flag is not set', async () => {
    const { req, res } = createReqRes()
    res.locals.flags = { enableEarlyTermination20261103Squad3: false }

    await getTemplates(mockMasApiClient as unknown as MasApiClient)(req, res, next)

    expect(mockMasApiClient.getDocumentTemplates).not.toHaveBeenCalled()
    expect(res.locals.documentTemplates).toEqual(undefined)
    expect(next).toHaveBeenCalled()
  })

  it('does not set templates if no contactCode', async () => {
    const { req, res } = createReqRes()
    res.locals.contactCode = undefined
    res.locals.flags = { enableEarlyTermination20261103Squad3: true }

    await getTemplates(mockMasApiClient as unknown as MasApiClient)(req, res, next)

    expect(mockMasApiClient.getDocumentTemplates).not.toHaveBeenCalled()
    expect(res.locals.documentTemplates).toEqual(undefined)
    expect(next).toHaveBeenCalled()
  })
})
