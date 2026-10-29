import { Readable } from 'stream'
import { RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'

export default class PersonRecordApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('PersonRecordClient', config.apis.personRecordApi, logger, authenticationClient)
  }

  async getImageData(nomsNumber: string, username: string): Promise<Readable | null> {
    return this.stream({ path: `/person/prison/${encodeURIComponent(nomsNumber)}/image` }, asSystem(username)).catch(
      (error): null => {
        if (error.responseStatus === 404) return null
        throw error
      },
    )
  }
}
