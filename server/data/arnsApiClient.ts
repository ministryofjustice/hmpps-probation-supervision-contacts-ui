import { RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import { ErrorSummary } from './model/common'
import { Needs, RiskScoresDto, RiskSummary } from './model/risk'

export default class ArnsApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Assess Risks and Needs API', config.apis.arnsApi, logger, authenticationClient)
  }

  async getRisks(crn: string, username: string): Promise<RiskSummary | ErrorSummary | null> {
    const errorMessage =
      'OASys is experiencing technical difficulties. It has not been possible to provide the Risk information held in OASys'
    return this.get<RiskSummary | ErrorSummary | null>(
      {
        path: `/risks/crn/${crn}`,
        errorHandler: (_path, _method, error) => {
          if (error.responseStatus === 404) return null
          if (error.responseStatus === 500 || error.responseStatus === 401) return { errors: [{ text: errorMessage }] }
          throw error
        },
      },
      asSystem(username),
    )
  }

  async getNeeds(crn: string, username: string): Promise<Needs | ErrorSummary | null> {
    const errorMessage =
      'OASys is experiencing technical difficulties. It has not been possible to provide the Criminogenic needs information held in OASys'
    return this.get<Needs | ErrorSummary | null>(
      {
        path: `/needs/crn/${crn}`,
        errorHandler: (_path, _method, error) => {
          if (error.responseStatus === 404) return null
          if (error.responseStatus === 500 || error.responseStatus === 401) return { errors: [{ text: errorMessage }] }
          throw error
        },
      },
      asSystem(username),
    )
  }

  async getPredictorsAll(crn: string, username: string): Promise<RiskScoresDto[] | ErrorSummary | null> {
    const errorMessage =
      'OASys is experiencing technical difficulties. It has not been possible to provide the predictor score information held in OASys'
    return this.get<RiskScoresDto[] | ErrorSummary | null>(
      {
        path: `/risks/crn/${crn}/predictors/all`,
        errorHandler: (_path, _method, error) => {
          if (error.responseStatus === 404) return null
          if (error.responseStatus === 500 || error.responseStatus === 401) return { errors: [{ text: errorMessage }] }
          throw error
        },
      },
      asSystem(username),
    )
  }
}
