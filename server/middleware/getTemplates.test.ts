import type { Request, Response } from 'express'
import MasApiClient from '../data/masApiClient'
import { getTemplates } from './getTemplates'

describe('getTemplates', () => {
  let next: jest.Mock
  let mockMasApiClient: jest.Mocked<Pick<MasApiClient, 'getDocumentTemplates'>>

  const mockTemplates = {
    templates: [{ name: 'template' }],
  }

  beforeEach(() => {
    jest.resetAllMocks()
    next = jest.fn()
    mockMasApiClient = {
      getDocumentTemplates: jest.fn().mockResolvedValue(mockTemplates),
    }
  })

  function createReqRes(username = 'test-user'): { req: Request; res: Response } {
    const req = { params: { contactType: 'police-liaison' } } as unknown as Request
    const res = { locals: { user: { username } } } as unknown as Response
    return { req, res }
  }

  it('sets contactCode based on type options', async () => {
    const { req, res } = createReqRes()

    await getTemplates(mockMasApiClient as unknown as MasApiClient)(req, res, next)

    expect(res.locals.contactCode).toEqual('C204')
    expect(next).toHaveBeenCalled()
  })

  it('sets templates if early termination flag is set and contactCode can be found', async () => {
    const { req, res } = createReqRes()
    res.locals.flags = { enableEarlyTermination20261103Squad3: true, earlyTerminationTemplatesAPI20261112Squad3: true }

    await getTemplates(mockMasApiClient as unknown as MasApiClient)(req, res, next)

    expect(mockMasApiClient.getDocumentTemplates).toHaveBeenCalledWith('C204', 'test-user')
    expect(res.locals.documentTemplates).toEqual(mockTemplates.templates)
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

  it('does not set templates if econtactCode cannot be found', async () => {
    const { req, res } = createReqRes()
    req.params.contactType = 'invalid'
    res.locals.flags = { enableEarlyTermination20261103Squad3: false }

    await getTemplates(mockMasApiClient as unknown as MasApiClient)(req, res, next)

    expect(mockMasApiClient.getDocumentTemplates).not.toHaveBeenCalled()
    expect(res.locals.documentTemplates).toEqual(undefined)
    expect(next).toHaveBeenCalled()
  })
})
