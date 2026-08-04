import { HmppsUser } from '../../interfaces/hmppsUser'
import { PersonalDetails } from '../../data/model/personalDetails'
import { TierCalculation } from '../../data/tierApiClient'
import { ErrorSummary } from '../../data/model/common'
import { RiskScoresDto, RiskSummary } from '../../data/model/risk'

export type PersonalDetailsCache = {
  overview: PersonalDetails
  tierCalculation: TierCalculation | ErrorSummary | null
  riskData: RiskData
}

type AppSessionData = {
  personalDetails?: Record<string, PersonalDetailsCache>
}

export declare module 'express-session' {
  interface SessionData {
    returnTo: string
    data?: AppSessionData | null
  }
}

export declare global {
  namespace Express {
    interface User {
      username: string
      token: string
      authSource: string
    }

    interface Request {
      verified?: boolean
      id: string
      logout(done: (err: unknown) => void): void
    }

    interface Locals {
      user: HmppsUser
    }
  }
}
