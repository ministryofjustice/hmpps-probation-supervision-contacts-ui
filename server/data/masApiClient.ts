import { RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import { PersonalDetails } from './model/personalDetails'

interface UserAlerts {
  content: unknown[]
  totalResults: number
  totalPages: number
  page: number
  size: number
}

export default class MasApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Manage a Supervision API', config.apis.masApi, logger, authenticationClient)
  }

  async getUserAlertsCount(username: string): Promise<number> {
    const response = await this.get<UserAlerts>({ path: `/alerts` }, asSystem(username))
    return response.totalResults
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
}
