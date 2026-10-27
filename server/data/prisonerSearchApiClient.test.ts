import nock from 'nock'
import config from '../config'
import PrisonerSearchApiClient, { Prisoner } from './prisonerSearchApiClient'

const token = { access_token: 'token-1', expires_in: 300 }

describe('prisonerSearchApiClient', () => {
  let fakePrisonerSearchApiClient: nock.Scope
  let prisonerSearchApiClient: PrisonerSearchApiClient

  beforeEach(() => {
    jest.clearAllMocks()
    fakePrisonerSearchApiClient = nock(config.apis.prisonerSearchApi.url)
    prisonerSearchApiClient = new PrisonerSearchApiClient(token.access_token)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
    nock.restore()
    nock.activate()
  })

  describe('getPrisonerDetails', () => {
    it('should return prisoner details from api', async () => {
      const nomsNumber = 'A1234BC'

      const response: Prisoner = {
        prisonerNumber: nomsNumber,
        firstName: 'Andrew',
        middleNames: 'John',
        lastName: 'Langley',
        status: 'ACTIVE',
        legalStatus: 'SENTENCED',
        lastMovementTypeCode: 'ADM',
        lastMovementReasonCode: 'UAL',
        lastMovementDate: '2026-09-25',
        inOutStatus: 'IN',
        prisonId: 'LEI',
        prisonName: 'Leicester',
        lastPrisonId: 'LEI',
        recall: false,
        releaseDate: '2027-09-25',
      }

      fakePrisonerSearchApiClient
        .get(`/prisoner/${nomsNumber}`)
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, response)

      const output = await prisonerSearchApiClient.getPrisonerDetails(nomsNumber)

      expect(output).toEqual(response)
    })

    it('should return null when the prisoner is not found', async () => {
      fakePrisonerSearchApiClient.get('/prisoner/A1234BC').reply(404)

      const output = await prisonerSearchApiClient.getPrisonerDetails('A1234BC')

      expect(output).toBeNull()
    })

    it('should return null when the api returns a 500', async () => {
      fakePrisonerSearchApiClient.persist().get('/prisoner/A1234BC').reply(500)

      const output = await prisonerSearchApiClient.getPrisonerDetails('A1234BC')

      expect(output).toBeNull()
    })

    it('should throw for any other error', async () => {
      fakePrisonerSearchApiClient.persist().get('/prisoner/A1234BC').reply(503)

      await expect(prisonerSearchApiClient.getPrisonerDetails('A1234BC')).rejects.toMatchObject({ responseStatus: 503 })
    })
  })
})
