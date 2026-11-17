import nock from 'nock'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import PrisonApiClient from './prisonApiClient'

describe('PrisonApiClient', () => {
  let prisonApiClient: PrisonApiClient
  let mockAuthenticationClient: jest.Mocked<AuthenticationClient>

  beforeEach(() => {
    mockAuthenticationClient = {
      getToken: jest.fn().mockResolvedValue('test-system-token'),
    } as unknown as jest.Mocked<AuthenticationClient>

    prisonApiClient = new PrisonApiClient(mockAuthenticationClient)
  })

  afterEach(() => {
    nock.cleanAll()
    jest.resetAllMocks()
  })

  describe('getImageData', () => {
    it('returns the image data stream for a given noms number', async () => {
      nock(config.apis.prisonApi.url)
        .get('/api/bookings/offenderNo/A1234BC/image/data')
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, 'image-data', { 'Content-Type': 'image/jpeg' })

      const result = await prisonApiClient.getImageData('A1234BC', 'test-user')

      const chunks: Buffer[] = []
      for await (const chunk of result) chunks.push(Buffer.from(chunk))
      expect(Buffer.concat(chunks).toString()).toEqual('image-data')
    })

    it('returns null when there is no image', async () => {
      nock(config.apis.prisonApi.url).get('/api/bookings/offenderNo/A1234BC/image/data').reply(404)

      const result = await prisonApiClient.getImageData('A1234BC', 'test-user')

      expect(result).toBeNull()
    })

    it('throws when the prison api fails', async () => {
      nock(config.apis.prisonApi.url).persist().get('/api/bookings/offenderNo/A1234BC/image/data').reply(500)

      await expect(prisonApiClient.getImageData('A1234BC', 'test-user')).rejects.toBeDefined()
    })
  })
})
