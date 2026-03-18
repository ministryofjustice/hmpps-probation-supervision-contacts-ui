import type { Request } from 'express'
import MasApiClient from '../data/masApiClient'
import { getFrequentContactTypes } from './getFrequentlyUsedContactTypes'
import { ContactType } from '../data/model/contacts'

const ALLOWED_FREQUENT_CODES = ['CM3A', 'CM3B', 'CMOA', 'CMOB', 'C326', 'C204', 'CT3A', 'CT3B', 'CTOA', 'CTOB']

const makeContactType = (code: string): ContactType => ({
  code,
  description: `Description for ${code}`,
  isPersonLevelContact: false,
})

describe('getFrequentContactTypes', () => {
  let mockMasApiClient: jest.Mocked<Pick<MasApiClient, 'getFrequentContactTypes'>>
  const req = {} as Request

  beforeEach(() => {
    jest.resetAllMocks()
    mockMasApiClient = { getFrequentContactTypes: jest.fn() }
  })

  it('calls masApiClient.getFrequentContactTypes with the given username', async () => {
    mockMasApiClient.getFrequentContactTypes.mockResolvedValue([])

    await getFrequentContactTypes(req, mockMasApiClient as unknown as MasApiClient, 'test-user')

    expect(mockMasApiClient.getFrequentContactTypes).toHaveBeenCalledWith('test-user')
  })

  it('returns only allowed codes from array response', async () => {
    const allTypes = [...ALLOWED_FREQUENT_CODES, 'UNKNOWN1', 'UNKNOWN2'].map(makeContactType)
    mockMasApiClient.getFrequentContactTypes.mockResolvedValue(allTypes)

    const result = await getFrequentContactTypes(req, mockMasApiClient as unknown as MasApiClient, 'user')

    expect(result.map(c => c.code)).toEqual(ALLOWED_FREQUENT_CODES)
  })

  it('returns results in ALLOWED_FREQUENT_CODES order regardless of API response order', async () => {
    const reversed = [...ALLOWED_FREQUENT_CODES].reverse().map(makeContactType)
    mockMasApiClient.getFrequentContactTypes.mockResolvedValue(reversed)

    const result = await getFrequentContactTypes(req, mockMasApiClient as unknown as MasApiClient, 'user')

    expect(result.map(c => c.code)).toEqual(ALLOWED_FREQUENT_CODES)
  })

  it('handles wrapped contactTypes response object', async () => {
    const wrapped = { contactTypes: ALLOWED_FREQUENT_CODES.slice(0, 3).map(makeContactType) }
    mockMasApiClient.getFrequentContactTypes.mockResolvedValue(wrapped as any)

    const result = await getFrequentContactTypes(req, mockMasApiClient as unknown as MasApiClient, 'user')

    expect(result.map(c => c.code)).toEqual(ALLOWED_FREQUENT_CODES.slice(0, 3))
  })

  it('returns empty array when API returns empty list', async () => {
    mockMasApiClient.getFrequentContactTypes.mockResolvedValue([])

    const result = await getFrequentContactTypes(req, mockMasApiClient as unknown as MasApiClient, 'user')

    expect(result).toEqual([])
  })

  it('excludes codes not in the allowed list', async () => {
    const types = [makeContactType('NOT_ALLOWED'), makeContactType('CM3A')]
    mockMasApiClient.getFrequentContactTypes.mockResolvedValue(types)

    const result = await getFrequentContactTypes(req, mockMasApiClient as unknown as MasApiClient, 'user')

    expect(result).toHaveLength(1)
    expect(result[0].code).toBe('CM3A')
  })
})
