import httpMocks from 'node-mocks-http'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { MPoPComponents } from '@ministryofjustice/hmpps-mpop-frontend-components-lib'
import { getTierDetails } from './getTierDetailsV3'
import { TierV3Response } from '../data/tierV3'
import { tierUrlV3 } from '../utils/tierLink'
import logger from '../../logger'

jest.mock('../../logger', () => ({
  __esModule: true,
  default: { error: jest.fn() },
}))

describe('getTierDetails', () => {
  let next: jest.Mock
  let mockHmppsAuthClient: jest.Mocked<Pick<AuthenticationClient, 'getToken'>>
  let mockMpopComponents: jest.Mocked<Pick<MPoPComponents, 'getTierDetails'>>

  const tierData: TierV3Response = {
    calculation: {
      tierScore: 'A1',
      calculationId: '123',
      calculationDate: '2023-01-01',
      changeReason: 'ANNUAL_RECALCULATION',
      provisional: false,
      tag: { text: null, color: null },
    },
    httpStatus: 200,
  }

  beforeEach(() => {
    jest.resetAllMocks()
    next = jest.fn()
    mockHmppsAuthClient = { getToken: jest.fn().mockResolvedValue('test-token') }
    mockMpopComponents = { getTierDetails: jest.fn().mockResolvedValue(tierData) }
  })

  it('fetches tier details and populates res.locals', async () => {
    const req = httpMocks.createRequest({ params: { crn: 'X123456' } })
    const res = httpMocks.createResponse()
    res.locals.user = { username: 'test-user' } as any
    res.locals.flags = { enableSupervisionPackagePoPHeader: true } as any

    await getTierDetails(
      mockHmppsAuthClient as unknown as AuthenticationClient,
      mockMpopComponents as unknown as MPoPComponents,
    )(req, res, next)

    expect(mockHmppsAuthClient.getToken).toHaveBeenCalledWith('test-user')
    expect(mockMpopComponents.getTierDetails).toHaveBeenCalledWith('test-token', 'X123456')
    expect(res.locals.tierDetails).toEqual(tierData)
    expect(res.locals.tierUrlV3).toEqual(tierUrlV3('X123456'))
    expect(next).toHaveBeenCalledWith()
  })

  it('logs an error and continues when API returns a non-200 status', async () => {
    const errorTierData: TierV3Response = { calculation: null, httpStatus: 500 }
    mockMpopComponents.getTierDetails.mockResolvedValue(errorTierData)

    const req = httpMocks.createRequest({ params: { crn: 'X123456' } })
    const res = httpMocks.createResponse()
    res.locals.user = { username: 'test-user' } as any
    res.locals.flags = { enableSupervisionPackagePoPHeader: true } as any

    await getTierDetails(
      mockHmppsAuthClient as unknown as AuthenticationClient,
      mockMpopComponents as unknown as MPoPComponents,
    )(req, res, next)

    expect(logger.error).toHaveBeenCalled()
    expect(res.locals.tierDetails).toEqual(errorTierData)
    expect(next).toHaveBeenCalledWith()
  })

  it('logs an error and continues when the API call throws', async () => {
    mockMpopComponents.getTierDetails.mockRejectedValue(new Error('network error'))

    const req = httpMocks.createRequest({ params: { crn: 'X123456' } })
    const res = httpMocks.createResponse()
    res.locals.user = { username: 'test-user' } as any
    res.locals.flags = { enableSupervisionPackagePoPHeader: true } as any

    await getTierDetails(
      mockHmppsAuthClient as unknown as AuthenticationClient,
      mockMpopComponents as unknown as MPoPComponents,
    )(req, res, next)

    expect(logger.error).toHaveBeenCalled()
    expect(res.locals.tierDetails).toBeUndefined()
    expect(next).toHaveBeenCalledWith()
  })

  it('skips fetching tier details when the feature flag is disabled', async () => {
    const req = httpMocks.createRequest({ params: { crn: 'X123456' } })
    const res = httpMocks.createResponse()
    res.locals.user = { username: 'test-user' } as any
    res.locals.flags = { enableSupervisionPackagePoPHeader: false } as any

    await getTierDetails(
      mockHmppsAuthClient as unknown as AuthenticationClient,
      mockMpopComponents as unknown as MPoPComponents,
    )(req, res, next)

    expect(mockHmppsAuthClient.getToken).not.toHaveBeenCalled()
    expect(mockMpopComponents.getTierDetails).not.toHaveBeenCalled()
    expect(res.locals.tierDetails).toBeUndefined()
    expect(next).toHaveBeenCalledWith()
  })

  it('logs an error and continues when hmppsAuthClient.getToken rejects', async () => {
    mockHmppsAuthClient.getToken.mockRejectedValue(new Error('auth error'))

    const req = httpMocks.createRequest({ params: { crn: 'X123456' } })
    const res = httpMocks.createResponse()
    res.locals.user = { username: 'test-user' } as any
    res.locals.flags = { enableSupervisionPackagePoPHeader: true } as any

    await getTierDetails(
      mockHmppsAuthClient as unknown as AuthenticationClient,
      mockMpopComponents as unknown as MPoPComponents,
    )(req, res, next)

    expect(logger.error).toHaveBeenCalled()
    expect(mockMpopComponents.getTierDetails).not.toHaveBeenCalled()
    expect(res.locals.tierDetails).toBeUndefined()
    expect(next).toHaveBeenCalledWith()
  })
})
