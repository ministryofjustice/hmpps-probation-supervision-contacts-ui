import httpMocks from 'node-mocks-http'
import MasApiClient from '../data/masApiClient'
import { getSentences } from './getSentences'
import { Sentence } from '../data/model/contacts'

const mockSentences: Sentence[] = [{ id: 1, order: { description: 'ORA Community Order', startDate: '2023-01-01' } }]

describe('getSentences', () => {
  let next: jest.Mock
  let mockMasApiClient: jest.Mocked<Pick<MasApiClient, 'getSentences'>>

  beforeEach(() => {
    jest.resetAllMocks()
    next = jest.fn()
    mockMasApiClient = { getSentences: jest.fn().mockResolvedValue(mockSentences) }
  })

  it('fetches sentences from API when not cached in session, stores them, and sets res.locals', async () => {
    const req = httpMocks.createRequest({ params: { crn: 'X123456' }, session: { data: null } as any })
    const res = httpMocks.createResponse()
    res.locals.user = { username: 'test-user' } as any

    await getSentences(mockMasApiClient as unknown as MasApiClient)(req, res, next)

    expect(mockMasApiClient.getSentences).toHaveBeenCalledWith('X123456', 'test-user', '', false)
    expect(res.locals.sentences).toEqual(mockSentences)
    expect((req.session as any).data.sentences.X123456).toEqual(mockSentences)
    expect(next).toHaveBeenCalledWith()
  })

  it('uses cached sentences from session without calling API', async () => {
    const req = httpMocks.createRequest({
      params: { crn: 'X123456' },
      session: { data: { sentences: { X123456: mockSentences } } } as any,
    })
    const res = httpMocks.createResponse()
    res.locals.user = { username: 'test-user' } as any

    await getSentences(mockMasApiClient as unknown as MasApiClient)(req, res, next)

    expect(mockMasApiClient.getSentences).not.toHaveBeenCalled()
    expect(res.locals.sentences).toEqual(mockSentences)
    expect(next).toHaveBeenCalledWith()
  })

  it('passes the number query param to the API', async () => {
    const req = httpMocks.createRequest({
      params: { crn: 'X123456' },
      query: { number: '42' },
      session: { data: null } as any,
    })
    const res = httpMocks.createResponse()
    res.locals.user = { username: 'test-user' } as any

    await getSentences(mockMasApiClient as unknown as MasApiClient)(req, res, next)

    expect(mockMasApiClient.getSentences).toHaveBeenCalledWith('X123456', 'test-user', '42', false)
  })

  it('preserves existing session data when storing sentences', async () => {
    const existing = { personalDetails: { X000001: {} } }
    const req = httpMocks.createRequest({
      params: { crn: 'X123456' },
      session: { data: existing } as any,
    })
    const res = httpMocks.createResponse()
    res.locals.user = { username: 'test-user' } as any

    await getSentences(mockMasApiClient as unknown as MasApiClient)(req, res, next)

    expect((req.session as any).data.personalDetails).toEqual(existing.personalDetails)
    expect((req.session as any).data.sentences.X123456).toEqual(mockSentences)
  })

  it('calls next with error when API throws', async () => {
    const error = new Error('API error')
    mockMasApiClient.getSentences.mockRejectedValue(error)
    const req = httpMocks.createRequest({ params: { crn: 'X123456' }, session: {} as any })
    const res = httpMocks.createResponse()
    res.locals.user = { username: 'test-user' } as any

    await getSentences(mockMasApiClient as unknown as MasApiClient)(req, res, next)

    expect(next).toHaveBeenCalledWith(error)
  })
})
