import type { RequestHandler } from 'express'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { MPoPComponents, toPersonRiskDetails } from '@ministryofjustice/hmpps-mpop-frontend-components-lib'
import { PersonRiskFlags } from '../data/model/risk'
import { setDataValue } from '../utils/setDataValue'

export const getPersonRiskFlags = (
  hmppsAuthClient: AuthenticationClient,
  mpopComponents: MPoPComponents,
): RequestHandler => {
  return async function getPersonRiskFlagsInner(req, res, next) {
    if (!res.locals?.flags?.enableNDeliusRosh && !res.locals?.flags?.enablePersonHeader) {
      return next()
    }
    const { crn } = req.params as Record<string, string>
    let personRiskFlags = req.session?.data?.risks?.[crn]

    if (!personRiskFlags) {
      const token = await hmppsAuthClient.getToken(res.locals.user.username)
      const response = await mpopComponents.getPersonRiskFlags(token, crn)
      if (response.error) {
        throw response.error
      }
      personRiskFlags = response.personRiskFlags as PersonRiskFlags
      setDataValue(req.session.data, ['risks', crn], personRiskFlags)
    }

    const { personRisks, riskBadgeData, riskToStaff, riskToProbationStaff, rosh } = toPersonRiskDetails(personRiskFlags)

    res.locals.riskToProbationStaff = riskToProbationStaff
    res.locals.riskToStaff = riskToStaff
    if (res.locals.flags.enableNDeliusRosh) {
      res.locals.rosh = rosh
    }
    res.locals.personRisks = personRisks as PersonRiskFlags
    res.locals.riskBadgeData = riskBadgeData

    return next()
  }
}
