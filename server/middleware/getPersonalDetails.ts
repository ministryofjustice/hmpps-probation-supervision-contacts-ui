import type { RequestHandler } from 'express'
import createError from 'http-errors'
import { ArnsComponents } from '@ministryofjustice/hmpps-arns-frontend-components-lib'
import { asUser } from '@ministryofjustice/hmpps-rest-client'
import MasApiClient from '../data/masApiClient'
import ArnsApiClient from '../data/arnsApiClient'
import TierApiClient from '../data/tierApiClient'
import { tierLink } from '../utils/tierLink'
import { toPredictors } from '../utils/toPredictors'
import { toRoshWidget } from '../utils/toRoshWidget'
import type { PersonalDetailsCache } from '../@types/express'
import logger from '../../logger'

export const getPersonalDetails = (
  masApiClient: MasApiClient,
  arnsApiClient: ArnsApiClient,
  tierApiClient: TierApiClient,
  arnsComponents: ArnsComponents,
): RequestHandler => {
  return async (req, res, next) => {
    const crn = req.params.crn as string
    const { username } = res.locals.user

    const sessionData = req.session.data
    const personalDetails = sessionData?.personalDetails?.[crn]

    let data: PersonalDetailsCache

    logger.debug(
      {
        cache: personalDetails ? 'hit' : 'miss',
      },
      'Personal details cache',
    )

    const authOptions = asUser(res.locals.user.token)

    if (personalDetails) {
      data = personalDetails
    } else {
      const [overview, risks, tierCalculation, predictors, riskData] = await Promise.all([
        masApiClient.getPersonalDetails(crn, username),
        arnsApiClient.getRisks(crn, username),
        tierApiClient.getCalculationDetails(crn, username),
        arnsApiClient.getPredictorsAll(crn, username),
        arnsComponents.getRiskData(authOptions, 'crn', crn),
      ])

      if (!overview) {
        return next(createError(404, 'Not found'))
      }

      data = {
        overview,
        risks,
        tierCalculation,
        predictors,
        riskData,
      }

      req.session.data = {
        ...(sessionData ?? {}),
        personalDetails: {
          ...(sessionData?.personalDetails ?? {}),
          [crn]: data,
        },
      }
    }

    res.locals.case = data.overview
    res.locals.risksWidget = toRoshWidget(data.risks)
    res.locals.riskData = data.riskData
    res.locals.tierCalculation = data.tierCalculation
    res.locals.predictorScores = toPredictors(data.predictors)
    res.locals.headerPersonName = {
      forename: data.overview.name.forename,
      surname: data.overview.name.surname,
    }
    res.locals.headerCRN = crn
    res.locals.headerDob = data.overview.dateOfBirth
    res.locals.headerTierLink = tierLink(crn)

    if (data.overview.dateOfDeath) {
      res.locals.dateOfDeath = data.overview.dateOfDeath
    }

    return next()
  }
}
