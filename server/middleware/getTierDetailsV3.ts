import { RequestHandler } from 'express'
import { MPoPComponents } from '@ministryofjustice/hmpps-mpop-frontend-components-lib'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { TierV3Response } from '../data/tierV3'
import logger from '../../logger'
import { tierUrlV3 } from '../utils/tierLink'

export const getTierDetails = (
  hmppsAuthClient: AuthenticationClient,
  mpopComponents: MPoPComponents,
): RequestHandler => {
  const fetchTierDetails = async (
    crn: string,
    token: string,
  ): Promise<{
    tierData: TierV3Response
    tierDataIsLoading: boolean
    tierDataError: Error | undefined
  }> => {
    let tierData: TierV3Response
    let tierDataIsLoading: boolean = false
    let tierDataError: Error | undefined

    try {
      tierDataIsLoading = true
      tierData = await mpopComponents.getTierDetails(token, crn)
      if (tierData?.httpStatus !== 200) {
        tierDataError = new Error(`Failed to fetch tier details for CRN ${crn}. HTTP status: ${tierData?.httpStatus}`)
        logger.error(tierDataError, 'Failed to fetch tier details from MPoP Components API.')
      }
    } catch (err) {
      tierDataError =
        typeof err === 'object' && err !== null && 'message' in err ? new Error((err as any).message) : new Error('500')
      logger.error(tierDataError, 'Failed to connect to MPoP Components API.')
    } finally {
      tierDataIsLoading = false
    }
    return {
      tierData,
      tierDataIsLoading,
      tierDataError,
    }
  }

  return async (req, res, next) => {
    if (!res.locals.flags?.enableSupervisionPackagePoPHeader) return next()

    const { crn } = req.params as Record<string, string>
    res.locals.tierUrlV3 = tierUrlV3(crn)

    let token: string
    try {
      token = await hmppsAuthClient.getToken(res.locals.user.username)
    } catch (err) {
      const tokenError =
        typeof err === 'object' && err !== null && 'message' in err ? new Error((err as any).message) : new Error('500')
      logger.error(tokenError, 'Failed to obtain HMPPS Auth token for tier details.')
      res.locals.tierDetails = undefined
      return next()
    }

    const { tierData } = await fetchTierDetails(crn, token)

    res.locals.tierDetails = tierData
    return next()
  }
}
