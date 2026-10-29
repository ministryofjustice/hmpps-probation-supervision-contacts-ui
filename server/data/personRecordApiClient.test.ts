import nock from 'nock'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import PersonRecordApiClient from './personRecordApiClient'

describe('PersonRecordApiClient', () => {
  let personRecordApiClient: PersonRecordApiClient
  let mockAuthenticationClient: jest.Mocked<AuthenticationClient>

  beforeEach(() => {
    mockAuthenticationClient = {
      getToken: jest.fn().mockResolvedValue('test-system-token'),
    } as unknown as jest.Mocked<AuthenticationClient>

    personRecordApiClient = new PersonRecordApiClient(mockAuthenticationClient)
  })

  afterEach(() => {
    nock.cleanAll()
    jest.resetAllMocks()
  })

  describe('getImageData', () => {
    it('returns the image data stream for a given noms number', async () => {
      nock(config.apis.personRecordApi.url)
        .get('/person/prison/A1234BC/image')
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, 'image-data', { 'Content-Type': 'image/jpeg' })

      const result = await personRecordApiClient.getImageData('A1234BC', 'test-user')

      const chunks: Buffer[] = []
      for await (const chunk of result) chunks.push(Buffer.from(chunk))
      expect(Buffer.concat(chunks).toString()).toEqual('image-data')
    })

    it('returns null when there is no image', async () => {
      nock(config.apis.personRecordApi.url).get('/person/prison/A1234BC/image').reply(404)

      const result = await personRecordApiClient.getImageData('A1234BC', 'test-user')

      expect(result).toBeNull()
    })

    it('throws when the prison api fails', async () => {
      nock(config.apis.personRecordApi.url).persist().get('/person/prison/A1234BC/image').reply(500)

      await expect(personRecordApiClient.getImageData('A1234BC', 'test-user')).rejects.toBeDefined()
    })
  })
})
