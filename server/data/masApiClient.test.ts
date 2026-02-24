import nock from 'nock'
import config from '../config'
import MasApiClient from './masApiClient'

describe('MasApiClient', () => {
  let masApiClient: MasApiClient

  beforeEach(() => {
    masApiClient = new MasApiClient('test-token')
  })

  afterEach(() => {
    nock.cleanAll()
    jest.resetAllMocks()
  })

  describe('getUserAlertsCount', () => {
    it('returns the totalResults from the alerts endpoint', async () => {
      nock(config.apis.masApi.url)
        .get('/alerts')
        .matchHeader('authorization', 'Bearer test-token')
        .reply(200, { content: [], totalResults: 5, totalPages: 1, page: 0, size: 10 })

      const result = await masApiClient.getUserAlertsCount()

      expect(result).toEqual(5)
    })
  })
})
