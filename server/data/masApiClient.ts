import { RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import { PersonalDetails } from './model/personalDetails'
import { Overview } from './model/overview'
import {
  ContactType,
  CreateContactRequest,
  CreateContactResponse,
  Sentence,
  UserProviders,
  PersonContact,
  UpdateContactWithNoOutcome,
} from './model/contacts'
import { HmppsUser } from '../interfaces/hmppsUser'
import { mapPersonAppointmentWithApprovedContactDisplayNames } from '../utils/contactDisplayNames'

interface UserAlerts {
  content: unknown[]
  totalResults: number
  totalPages: number
  page: number
  size: number
}

export interface ProbationPractitioner {
  code: string
  name: { forename: string; middleName?: string; surname: string }
  provider: { code: string; name: string }
  team: { description: string; code: string }
  unallocated: boolean
  username: string
}

export default class MasApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Manage a Supervision API', config.apis.masApi, logger, authenticationClient)
  }

  async getUserAlertsCount(username: string): Promise<number> {
    const response = await this.get<UserAlerts>({ path: `/alerts` }, asSystem(username))
    return response.totalResults
  }

  async getFrequentContactTypes(username: string): Promise<ContactType[]> {
    return this.get({ path: `/contact/types` }, asSystem(username))
  }

  async getContactType(code: string, username: string): Promise<ContactType> {
    return this.get({ path: `/contact/types/${code}` }, asSystem(username))
  }

  async getUserProviders(username: string, regionCode?: string, teamCode?: string): Promise<UserProviders> {
    const teamQueryParam = teamCode ? `&team=${teamCode}` : ''
    const queryParameters = regionCode ? `?region=${regionCode}${teamQueryParam}` : ''
    return this.get({ path: `/user/${username}/providers${queryParameters}` }, asSystem(username))
  }

  async getSentences(crn: string, username: string, number = '', includeRarRequirements = true): Promise<Sentence[]> {
    let queryParameters = number || !includeRarRequirements ? '?' : ''
    if (queryParameters) {
      if (number) queryParameters = `${queryParameters}number=${number}`
      if (!includeRarRequirements) {
        if (number) queryParameters = `${queryParameters}&`
        queryParameters = `${queryParameters}includeRarRequirements=false`
      }
    }
    const result = await this.get<{ sentences: Sentence[] }>(
      { path: `/sentences/${crn}${queryParameters}` },
      asSystem(username),
    )
    return result.sentences
  }

  async getProbationPractitioner(crn: string, username: string): Promise<ProbationPractitioner> {
    return this.get({ path: `/case/${crn}/probation-practitioner` }, asSystem(username))
  }

  async isResponsibleOfficer(username: string, crn: string): Promise<boolean> {
    const result = await this.get<{ isResponsibleOfficer: boolean } | null>(
      {
        path: `/case/${crn}/officer-status/${username}`,
        errorHandler: (_path, _method, error) => {
          if (error.responseStatus === 404) return null
          throw error
        },
      },
      asSystem(username),
    )
    return result?.isResponsibleOfficer ?? false
  }

  async createContact(crn: string, payload: CreateContactRequest, username: string): Promise<CreateContactResponse> {
    return this.post(
      { path: `/contact/${crn}`, data: payload as unknown as Record<string, unknown> },
      asSystem(username),
    )
  }

  async updateContactWithNoOutcome(
    contactId: string,
    payload: UpdateContactWithNoOutcome,
    username: string,
  ): Promise<void> {
    return this.patch(
      { path: `/contact/${contactId}`, data: payload as unknown as Record<string, unknown> },
      asSystem(username),
    )
  }

  async patchDocuments(crn: string, contactId: string, file: Express.Multer.File, username: string): Promise<void> {
    await this.patch(
      {
        path: `/documents/${crn}/update/contact/${contactId}`,
        files: { file: { buffer: file.buffer, originalname: file.originalname } },
      } as Parameters<typeof this.patch>[0],
      asSystem(username),
    )
  }

  async getOverview(crn: string, username: string): Promise<Overview | null> {
    return this.get<Overview | null>(
      {
        path: `/overview/${crn}`,
        errorHandler: (_path, _method, error) => {
          if (error.responseStatus === 404) return null
          throw error
        },
      },
      asSystem(username),
    )
  }

  async getPersonalDetails(crn: string, username: string): Promise<PersonalDetails | null> {
    return this.get<PersonalDetails | null>(
      {
        path: `/personal-details/${crn}`,
        errorHandler: (_path, _method, error) => {
          if (error.responseStatus === 404) return null
          throw error
        },
      },
      asSystem(username),
    )
  }

  async getUserDetails(username: string): Promise<HmppsUser | null> {
    return this.get<HmppsUser | null>(
      {
        path: `/user/${username}`,
        errorHandler: (_path, _method, error) => {
          if (error.responseStatus === 404) return null
          throw error
        },
      },
      asSystem(username),
    )
  }

  async getPersonContact(crn: string, appointmentId: string, username: string): Promise<PersonContact | null> {
    const personContact = (await this.get(
      {
        path: `/schedule/${crn}/appointment/${appointmentId}`,
      },
      asSystem(username),
    )) as PersonContact | null

    return personContact ? mapPersonAppointmentWithApprovedContactDisplayNames(personContact) : personContact
  }
}
