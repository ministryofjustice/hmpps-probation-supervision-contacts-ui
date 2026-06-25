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

  describe('getFrequentContactTypes', () => {
    it('returns the list of contact types', async () => {
      const contactTypes = [{ code: 'POL', description: 'Police Liaison', isPersonLevelContact: false }]
      nock(config.apis.masApi.url)
        .get('/contact/types')
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, contactTypes)

      const result = await masApiClient.getFrequentContactTypes('test-user')

      expect(result).toEqual(contactTypes)
    })
  })

  describe('getContactType', () => {
    it('returns the contact type for a given code', async () => {
      const contactType = { code: 'POL', description: 'Police Liaison', isPersonLevelContact: false }
      nock(config.apis.masApi.url)
        .get('/contact/types/POL')
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, contactType)

      const result = await masApiClient.getContactType('POL', 'test-user')

      expect(result).toEqual(contactType)
    })
  })

  describe('getUserProviders', () => {
    it('returns user providers', async () => {
      const providers = {
        defaultUserDetails: { username: 'test-user', homeArea: 'N01', team: 'N01T01' },
        teams: [{ description: 'Team One', code: 'N01T01' }],
      }
      nock(config.apis.masApi.url)
        .get('/user/test-user/providers')
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, providers)

      const result = await masApiClient.getUserProviders('test-user')

      expect(result).toEqual(providers)
    })

    it('filters by regionCode when provided', async () => {
      const providers = {
        defaultUserDetails: { username: 'test-user', homeArea: 'N01', team: 'N01T01' },
        teams: [{ description: 'Team One', code: 'N01T01' }],
      }
      nock(config.apis.masApi.url)
        .get('/user/test-user/providers?region=N01')
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, providers)

      const result = await masApiClient.getUserProviders('test-user', 'N01')

      expect(result).toEqual(providers)
    })

    it('filters by regionCode and teamCode when both provided', async () => {
      const providers = {
        defaultUserDetails: { username: 'test-user', homeArea: 'N01', team: 'N01T01' },
        teams: [{ description: 'Team One', code: 'N01T01' }],
      }
      nock(config.apis.masApi.url)
        .get('/user/test-user/providers?region=N01&team=N01T01')
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, providers)

      const result = await masApiClient.getUserProviders('test-user', 'N01', 'N01T01')

      expect(result).toEqual(providers)
    })
  })

  describe('getSentences', () => {
    it('returns the sentences array for a CRN', async () => {
      const sentences = [{ id: 1, order: { description: 'ORA Community Order', startDate: '2023-01-01' } }]
      nock(config.apis.masApi.url)
        .get('/sentences/X123456')
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, { sentences })

      const result = await masApiClient.getSentences('X123456', 'test-user')

      expect(result).toEqual(sentences)
    })

    it('filters by number when provided', async () => {
      const sentences = [{ id: 1, order: { description: 'ORA Community Order', startDate: '2023-01-01' } }]
      nock(config.apis.masApi.url)
        .get('/sentences/X123456?number=1')
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, { sentences })

      const result = await masApiClient.getSentences('X123456', 'test-user', '1')

      expect(result).toEqual(sentences)
    })

    it('appends includeRarRequirements=false when set to false', async () => {
      const sentences = [{ id: 1, order: { description: 'ORA Community Order', startDate: '2023-01-01' } }]
      nock(config.apis.masApi.url)
        .get('/sentences/X123456?includeRarRequirements=false')
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, { sentences })

      const result = await masApiClient.getSentences('X123456', 'test-user', '', false)

      expect(result).toEqual(sentences)
    })

    it('combines number and includeRarRequirements=false when both provided', async () => {
      const sentences = [{ id: 1, order: { description: 'ORA Community Order', startDate: '2023-01-01' } }]
      nock(config.apis.masApi.url)
        .get('/sentences/X123456?number=1&includeRarRequirements=false')
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, { sentences })

      const result = await masApiClient.getSentences('X123456', 'test-user', '1', false)

      expect(result).toEqual(sentences)
    })
  })

  describe('getProbationPractitioner', () => {
    it('returns the probation practitioner for a CRN', async () => {
      const practitioner = {
        code: 'ST001',
        name: { forename: 'John', surname: 'Doe' },
        username: 'USER1',
        provider: { code: 'P1', name: 'Provider 1' },
        team: { code: 'T1', description: 'Team 1' },
        unallocated: false,
      }
      nock(config.apis.masApi.url)
        .get('/case/X123456/probation-practitioner')
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, practitioner)

      const result = await masApiClient.getProbationPractitioner('X123456', 'test-user')
      expect(result).toEqual(practitioner)
    })
  })

  describe('isResponsibleOfficer', () => {
    it('returns true when the user is the responsible officer', async () => {
      nock(config.apis.masApi.url)
        .get('/case/X123456/officer-status/test-user')
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, { isResponsibleOfficer: true })

      const result = await masApiClient.isResponsibleOfficer('test-user', 'X123456')

      expect(result).toEqual(true)
    })

    it('returns false when the user is not the responsible officer', async () => {
      nock(config.apis.masApi.url)
        .get('/case/X123456/officer-status/test-user')
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, { isResponsibleOfficer: false })

      const result = await masApiClient.isResponsibleOfficer('test-user', 'X123456')

      expect(result).toEqual(false)
    })

    it('returns false when a 404 is returned', async () => {
      nock(config.apis.masApi.url)
        .get('/case/X123456/officer-status/test-user')
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(404)

      const result = await masApiClient.isResponsibleOfficer('test-user', 'X123456')

      expect(result).toEqual(false)
    })
  })

  describe('getOverview', () => {
    it('returns the overview for a given crn', async () => {
      const overview = { registrations: ['VISOR', 'Restraining Order'] }
      nock(config.apis.masApi.url)
        .get('/overview/X123456')
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, overview)

      const result = await masApiClient.getOverview('X123456', 'test-user')

      expect(result).toEqual(overview)
    })

    it('returns null when the overview is not found', async () => {
      nock(config.apis.masApi.url).get('/overview/X123456').reply(404)

      const result = await masApiClient.getOverview('X123456', 'test-user')

      expect(result).toBeNull()
    })
  })

  describe('createContact', () => {
    it('posts a contact and returns the response', async () => {
      const payload = {
        date: '1/1/2024',
        time: '10:00',
        staffCode: 'N01A001',
        teamCode: 'N01T01',
        type: 'POL',
        alert: false,
        sensitive: false,
        visorReport: false,
      }
      const response = { id: 42 }
      nock(config.apis.masApi.url)
        .post('/contact/X123456', payload)
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, response)

      const result = await masApiClient.createContact('X123456', payload, 'test-user')

      expect(result).toEqual(response)
    })
  })

  describe('getUserDetails', () => {
    it('returns user details when user exists', async () => {
      const user = {
        roles: ['OIBT0002'],
        userId: 1234,
        username: 'USER1',
        firstName: 'Test',
        surname: 'User',
        email: 'user@email.com',
        enabled: true,
        staff: {
          probationDeliveryUnits: [{ code: 'N03CTM', description: 'Test PDU' }],
        },
      }
      nock(config.apis.masApi.url)
        .get('/user/test-user')
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, user)

      const result = await masApiClient.getUserDetails('test-user')

      expect(result).toEqual(user)
    })

    it('returns null when a 404 is returned', async () => {
      nock(config.apis.masApi.url)
        .get('/user/test-user')
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(404)

      const result = await masApiClient.getUserDetails('test-user')

      expect(result).toEqual(null)
    })
  })

  describe('getPersonContact', () => {
    it('returns the contact for a given crn and appointmentId', async () => {
      const contact = { id: 'ABC123', type: 'TEST_CONTACT' }

      nock(config.apis.masApi.url)
        .get('/schedule/X123456/appointment/ABC123')
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, contact)

      const result = await masApiClient.getPersonContact('X123456', 'ABC123', 'test-user')

      expect(result).toEqual(contact)
    })
  })

  describe('getFullContactNotes', () => {
    it('returns the full notes contact for a given crn, contact id and note id', async () => {
      const fullContact = {
        personSummary: {
          crn: 'X123456',
        },
        appointment: {
          id: 2510721443,
          type: 'MAPPA J Form - Job Centre+ Notification',
          displayName: 'MAPPA J Form - Job Centre+ notification',
          appointmentNote: {
            id: 0,
            note: 'FULL NOTE LONGER THAN EXISTING',
            createdBy: 'A User',
            createdByDate: '2026-06-18',
          },
        },
      }

      nock(config.apis.masApi.url)
        .get('/schedule/X123456/appointment/ABC123/note/0')
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, fullContact)

      const result = await masApiClient.getFullContactNote('X123456', 'ABC123', '0', 'test-user')

      expect(result).toEqual(fullContact)
    })
  })
})
