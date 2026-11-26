import { Readable } from 'stream'
import { asSystem } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import BaseRestClient from './restClient'
import config from '../config'
import logger from '../../logger'

export default class PrisonApiClient extends BaseRestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Prison API', config.apis.prisonApi, logger, authenticationClient)
  }

  async getImageData(nomsNumber: string, username: string): Promise<Readable | null> {
    return this.stream(
      { path: `/api/bookings/offenderNo/${encodeURIComponent(nomsNumber)}/image/data` },
      asSystem(username),
    ).catch((error): null => {
      if (error.responseStatus === 404) return null
      throw error
    })
  }
}
