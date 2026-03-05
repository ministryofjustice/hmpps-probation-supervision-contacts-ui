import type { RequestHandler } from 'express'
import MasApiClient from '../data/masApiClient'
import ArnsApiClient from '../data/arnsApiClient'
import TierApiClient, { TierCalculation } from '../data/tierApiClient'
import { tierLink } from '../utils/tierLink'
import { toPredictors } from '../utils/toPredictors'
import { toRoshWidget } from '../utils/toRoshWidget'
import { PersonalDetails } from '../data/model/personalDetails'
import { RiskScoresDto, RiskSummary } from '../data/model/risk'
import { ErrorSummary } from '../data/model/common'

export const getPersonalDetails = (
  masApiClient: MasApiClient,
  arnsApiClient: ArnsApiClient,
  tierApiClient: TierApiClient,
): RequestHandler => {
  return async (req, res, next) => {
    const crn = req.params.crn as string
    const { username } = res.locals.user
    let overview: PersonalDetails
    let risks: RiskSummary | ErrorSummary | null
    let tierCalculation: TierCalculation | ErrorSummary | null
    let predictors: ErrorSummary | RiskScoresDto[] | null
    const sessionData = (req.session as any).data
    if (!sessionData?.personalDetails?.[crn] || process.env.NODE_ENV === 'development') {
      ;[overview, risks, tierCalculation, predictors] = await Promise.all([
        masApiClient.getPersonalDetails(crn, username),
        arnsApiClient.getRisks(crn, username),
        tierApiClient.getCalculationDetails(crn, username),
        arnsApiClient.getPredictorsAll(crn, username),
      ])
      ;(req.session as any).data = {
        ...(sessionData ?? {}),
        personalDetails: {
          ...(sessionData?.personalDetails ?? {}),
          [crn]: {
            overview,
            risks,
            tierCalculation,
            predictors,
          },
        },
      }
    } else {
      ;({ overview, risks, tierCalculation, predictors } = sessionData.personalDetails[crn])
    }
    res.locals.case = overview
    res.locals.risksWidget = toRoshWidget(risks)
    res.locals.tierCalculation = tierCalculation
    res.locals.predictorScores = toPredictors(predictors)
    res.locals.headerPersonName = { forename: overview.name.forename, surname: overview.name.surname }
    res.locals.headerCRN = crn
    res.locals.headerDob = overview.dateOfBirth
    if (res.locals?.flags?.enableTierLink) {
      res.locals.headerTierLink = tierLink(crn)
    }
    if (overview?.dateOfDeath) {
      res.locals.dateOfDeath = overview.dateOfDeath
    }
    return next()
  }
}
