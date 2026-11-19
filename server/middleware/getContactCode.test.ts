import type { Request, Response } from 'express'
import { getContactCode } from './getContactCode'

describe('getTemplates', () => {
  let next: jest.Mock

  beforeEach(() => {
    jest.resetAllMocks()
    next = jest.fn()
  })

  function createReqRes(username = 'test-user'): { req: Request; res: Response } {
    const req = { params: { contactType: 'police-liaison' } } as unknown as Request
    const res = { locals: { user: { username } } } as unknown as Response
    return { req, res }
  }

  it('sets contactCode based on type options', async () => {
    const { req, res } = createReqRes()

    await getContactCode(req, res, next)

    expect(res.locals.contactCode).toEqual('C204')
    expect(next).toHaveBeenCalled()
  })
})
