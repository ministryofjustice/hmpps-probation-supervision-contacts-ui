import type { RequestHandler } from 'express'
import httpMocks from 'node-mocks-http'
import MasApiClient from '../data/masApiClient'
import { getExistingContact } from './getContact'

describe('getExistingContact', () => {
  let next: jest.Mock
  let mockMasApiClient: jest.Mocked<Pick<MasApiClient, 'getPersonContact'>>

  const mockContact = { id: 'ABC123', type: 'TEST_CONTACT' }

  beforeEach(() => {
    jest.resetAllMocks()
    next = jest.fn()
    mockMasApiClient = {
      getPersonContact: jest.fn().mockResolvedValue(mockContact),
    }
  })

  it('fetches contact from API and sets res.locals.contact', async () => {
    const req = httpMocks.createRequest({
      params: { crn: 'X123456', contactId: 'ABC123' },
    })

    const res = httpMocks.createResponse()
    res.locals.user = { username: 'test-user' } as any

    await getExistingContact(mockMasApiClient as unknown as MasApiClient)(req, res, next)

    expect(mockMasApiClient.getPersonContact).toHaveBeenCalledWith('X123456', 'ABC123', 'test-user')

    expect(res.locals.contact).toEqual(mockContact)

    expect(next).toHaveBeenCalledWith()
  })

  it('calls next with error if API throws', async () => {
    const error = new Error('API error')

    mockMasApiClient.getPersonContact.mockRejectedValue(error)

    const req = httpMocks.createRequest({
      params: { crn: 'X123456', contactId: 'ABC123' },
    })

    const res = httpMocks.createResponse()
    res.locals.user = { username: 'test-user' } as any

    await getExistingContact(mockMasApiClient as unknown as MasApiClient)(req, res, next)

    expect(next).toHaveBeenCalledWith(error)
  })
})
