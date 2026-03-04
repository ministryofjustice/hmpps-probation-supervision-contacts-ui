import nock from 'nock'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import MasApiClient from './masApiClient'

describe('MasApiClient', () => {
  let masApiClient: MasApiClient
  let mockAuthenticationClient: jest.Mocked<AuthenticationClient>

  beforeEach(() => {
    mockAuthenticationClient = {
      getToken: jest.fn().mockResolvedValue('test-system-token'),
    } as unknown as jest.Mocked<AuthenticationClient>

    masApiClient = new MasApiClient(mockAuthenticationClient)
  })

  afterEach(() => {
    nock.cleanAll()
    jest.resetAllMocks()
  })

  describe('getUserAlertsCount', () => {
    it('returns the totalResults from the alerts endpoint', async () => {
      nock(config.apis.masApi.url)
        .get('/alerts')
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, { content: [], totalResults: 5, totalPages: 1, page: 0, size: 10 })

      const result = await masApiClient.getUserAlertsCount('test-user')

      expect(result).toEqual(5)
    })
  })
})
