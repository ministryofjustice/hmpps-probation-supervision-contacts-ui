import { RestClient, asUser } from '@ministryofjustice/hmpps-rest-client'
import config from '../config'
import logger from '../../logger'

export interface Prisoner {
  prisonerNumber?: string
  firstName?: string
  middleNames?: string
  lastName?: string
  status?: string
  legalStatus?: string
  lastMovementTypeCode?: string
  lastMovementReasonCode?: string
  lastMovementDate?: string
  inOutStatus?: string
  prisonId?: string
  prisonName?: string
  lastPrisonId?: string
  recall?: boolean
  releaseDate?: string
}

export default class PrisonerSearchApiClient extends RestClient {
  constructor(private readonly token: string) {
    super('Prisoner Search API', config.apis.prisonerSearchApi, logger)
  }

  async getPrisonerDetails(nomsNumber: string): Promise<Prisoner> {
    return this.get(
      {
        path: `/prisoner/${nomsNumber}`,
        errorHandler: (_path, _method, error): null => {
          if (error.responseStatus === 404 || error.responseStatus === 500) return null
          throw error
        },
      },
      asUser(this.token),
    )
  }
}
