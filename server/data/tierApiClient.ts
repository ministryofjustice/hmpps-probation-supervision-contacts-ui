import { RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import { ErrorSummary } from './model/common'

export default class TierApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Tier API', config.apis.tierApi, logger, authenticationClient)
  }

  async getCalculationDetails(crn: string, username: string): Promise<TierCalculation | ErrorSummary | null> {
    const errorMessage =
      'The tier service is experiencing technical difficulties. It has not been possible to provide tier information'
    return this.get<TierCalculation | ErrorSummary | null>(
      {
        path: `/crn/${crn}/tier/details`,
        errorHandler: (_path, _method, error) => {
          if (error.responseStatus === 404) return null
          if (error.responseStatus === 500) return { errors: [{ text: errorMessage }] }
          throw error
        },
      },
      asSystem(username),
    )
  }
}

export type CalculationRule =
  | 'NO_MANDATE_FOR_CHANGE'
  | 'NO_VALID_ASSESSMENT'
  | 'NEEDS'
  | 'OGRS'
  | 'IOM'
  | 'RSR'
  | 'ROSH'
  | 'MAPPA'
  | 'COMPLEXITY'
  | 'ADDITIONAL_FACTORS_FOR_WOMEN'

export interface TierCalculation {
  tierScore: string
  calculationId: string
  calculationDate: string
  data: {
    protect: TierLevel
    change: TierLevel
    calculationVersion: string
  }
}

export interface TierLevel {
  tier: string
  points: number
  pointsBreakdown: Record<CalculationRule, number>
}
