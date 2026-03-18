import type { Request, Response } from 'express'
import MasApiClient from '../data/masApiClient'
import { isResponsibleOfficerMiddleware } from './isResponsibleOfficer'

describe('isResponsibleOfficerMiddleware', () => {
  let next: jest.Mock
  let mockMasApiClient: jest.Mocked<Pick<MasApiClient, 'getProbationPractitioner'>>

  beforeEach(() => {
    jest.resetAllMocks()
    next = jest.fn()
    mockMasApiClient = {
      getProbationPractitioner: jest.fn(),
    }
  })

  function createReqRes(crn: string, username: string): { req: Request; res: Response } {
    const req = { params: { crn } } as unknown as Request
    const res = { locals: { user: { username } } } as unknown as Response
    return { req, res }
  }

  it('sets isResponsibleOfficer to true when usernames match (case-insensitive)', async () => {
    mockMasApiClient.getProbationPractitioner.mockResolvedValue({
      username: 'USER1',
      name: { forename: 'John', surname: 'Smith' },
      code: 'N01A001',
      provider: { code: 'N01', name: 'NPS North West' },
      team: { code: 'N01T01', description: 'Team One' },
      unallocated: false,
    })
    const { req, res } = createReqRes('X123456', 'user1')

    await isResponsibleOfficerMiddleware(mockMasApiClient as unknown as MasApiClient)(req, res, next)

    expect(mockMasApiClient.getProbationPractitioner).toHaveBeenCalledWith('X123456', 'user1')
    expect(res.locals.isResponsibleOfficer).toBe(true)
    expect(res.locals.responsibleOfficerForename).toBe('John')
    expect(res.locals.responsibleOfficerSurname).toBe('Smith')
    expect(next).toHaveBeenCalledWith()
  })

  it('sets isResponsibleOfficer to false when usernames do not match', async () => {
    mockMasApiClient.getProbationPractitioner.mockResolvedValue({
      username: 'OTHER_USER',
      name: { forename: 'Jane', surname: 'Doe' },
      code: 'N01A002',
      provider: { code: 'N01', name: 'NPS North West' },
      team: { code: 'N01T01', description: 'Team One' },
      unallocated: false,
    })
    const { req, res } = createReqRes('X123456', 'user1')

    await isResponsibleOfficerMiddleware(mockMasApiClient as unknown as MasApiClient)(req, res, next)

    expect(res.locals.isResponsibleOfficer).toBe(false)
    expect(next).toHaveBeenCalledWith()
  })

  it('calls next with error when API throws', async () => {
    const error = new Error('API error')
    mockMasApiClient.getProbationPractitioner.mockRejectedValue(error)
    const { req, res } = createReqRes('X123456', 'user1')

    await isResponsibleOfficerMiddleware(mockMasApiClient as unknown as MasApiClient)(req, res, next)

    expect(next).toHaveBeenCalledWith(error)
  })
})
