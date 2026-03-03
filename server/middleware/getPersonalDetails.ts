import type { RequestHandler } from 'express'
import { AuthenticationClient } from '../data'
import MasApiClient from '../data/masApiClient'
import ArnsApiClient from '../data/arnsApiClient'
import TierApiClient, { TierCalculation } from '../data/tierApiClient'
import { tierLink } from '../utils/tierLink'
import { toPredictors } from '../utils/toPredictors'
import { toRoshWidget } from '../utils/toRoshWidget'
import logger from '../../logger'
import { PersonalDetails } from '../data/model/personalDetails'
import { RiskScoresDto, RiskSummary } from '../data/model/risk'
import { ErrorSummary } from '../data/model/common'

export const getPersonalDetails = (hmppsAuthClient: AuthenticationClient): RequestHandler => {
  return async (req, res, next) => {
    const crn = req.params.crn as string
    let overview: PersonalDetails
    let risks: RiskSummary
    let tierCalculation: TierCalculation
    let predictors: ErrorSummary | RiskScoresDto[]
    const sessionData = (req.session as any).data
    if (!sessionData?.personalDetails?.[crn] || process.env.NODE_ENV === 'development') {
      const token = await hmppsAuthClient.getToken(res.locals.user.username)
      const masClient = new MasApiClient(token)
      const arnsClient = new ArnsApiClient(token)
      const tierClient = new TierApiClient(token)
      ;[overview, risks, tierCalculation, predictors] = await Promise.all([
        masClient.getPersonalDetails(crn),
        arnsClient.getRisks(crn),
        tierClient.getCalculationDetails(crn),
        arnsClient.getPredictorsAll(crn),
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
