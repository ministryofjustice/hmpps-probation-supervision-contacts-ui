import type { Request, Response } from 'express'
import MasApiClient from '../data/masApiClient'
import { CaseAccess } from '../models/caseAccess'
import { limitedAccess } from './limitedAccessMiddleware'

const mockAccess = ({
  crn = 'X000001',
  userExcluded = false,
  userRestricted = false,
  exclusionMessage = '',
  restrictionMessage = '',
}: Partial<CaseAccess>): CaseAccess => ({
  crn,
  userExcluded,
  userRestricted,
  exclusionMessage,
  restrictionMessage,
})

describe('limitedAccess', () => {
  let next: jest.Mock
  let mockMasApiClient: jest.Mocked<Pick<MasApiClient, 'getUserAccess'>>

  beforeEach(() => {
    jest.resetAllMocks()
    next = jest.fn()
    mockMasApiClient = {
      getUserAccess: jest.fn().mockResolvedValue(mockAccess({})),
    }
  })

  function createReqRes(crn = 'X000001', username = 'test-user'): { req: Request; res: Response } {
    const req = { params: { crn }, query: { backUrl: '/back/link' } } as unknown as Request
    const res = { locals: { user: { username } }, render: jest.fn() } as unknown as Response
    return { req, res }
  }

  it('calls next with a 404 error when the crn is invalid', async () => {
    const { req, res } = createReqRes('INVALID')

    await limitedAccess(mockMasApiClient as unknown as MasApiClient)(req, res, next)

    expect(mockMasApiClient.getUserAccess).not.toHaveBeenCalled()
    expect(res.render).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 404 }))
  })

  it('renders the lao auth error page with the exclusion message when the user is excluded', async () => {
    mockMasApiClient.getUserAccess.mockResolvedValue(
      mockAccess({ userExcluded: true, exclusionMessage: 'user is excluded' }),
    )
    const { req, res } = createReqRes()

    await limitedAccess(mockMasApiClient as unknown as MasApiClient)(req, res, next)

    expect(mockMasApiClient.getUserAccess).toHaveBeenCalledWith('test-user', 'X000001')
    expect(res.render).toHaveBeenCalledWith('autherror-lao', { message: 'user is excluded', backLink: '/back/link' })
    expect(next).not.toHaveBeenCalled()
  })

  it('renders the lao auth error page with the restriction message when the user is restricted', async () => {
    mockMasApiClient.getUserAccess.mockResolvedValue(
      mockAccess({ userRestricted: true, restrictionMessage: 'user is restricted' }),
    )
    const { req, res } = createReqRes()

    await limitedAccess(mockMasApiClient as unknown as MasApiClient)(req, res, next)

    expect(mockMasApiClient.getUserAccess).toHaveBeenCalledWith('test-user', 'X000001')
    expect(res.render).toHaveBeenCalledWith('autherror-lao', { message: 'user is restricted', backLink: '/back/link' })
    expect(next).not.toHaveBeenCalled()
  })

  it('renders the lao auth error page with a default message when the user is excluded without a message', async () => {
    mockMasApiClient.getUserAccess.mockResolvedValue(mockAccess({ userExcluded: true }))
    const { req, res } = createReqRes()

    await limitedAccess(mockMasApiClient as unknown as MasApiClient)(req, res, next)

    expect(res.render).toHaveBeenCalledWith('autherror-lao', {
      message: 'You are not authorised to view this case.',
      backLink: '/back/link',
    })
    expect(next).not.toHaveBeenCalled()
  })

  it('calls next when the user is not excluded or restricted', async () => {
    const { req, res } = createReqRes()

    await limitedAccess(mockMasApiClient as unknown as MasApiClient)(req, res, next)

    expect(mockMasApiClient.getUserAccess).toHaveBeenCalledWith('test-user', 'X000001')
    expect(res.render).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledWith()
  })
})
