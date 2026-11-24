import type { RequestHandler } from 'express'
import createError from 'http-errors'
import MasApiClient from '../data/masApiClient'
import { isValidCrn } from '../utils/isValidCrn'
import { sanitiseBackUrl } from '../utils/backLink'

export const limitedAccess = (masApiClient: MasApiClient): RequestHandler => {
  return async (req, res, next) => {
    const crn = req.params?.crn as string
    if (!isValidCrn(crn)) {
      return next(createError(404, 'Not found'))
    }
    const { backUrl } = req.query
    const access = await masApiClient.getUserAccess(res.locals.user.username, crn)
    if (access.userExcluded || access.userRestricted) {
      const message =
        access.exclusionMessage || access.restrictionMessage || 'You are not authorised to view this case.'
      const backLink = sanitiseBackUrl(backUrl, crn)

      return res.render('autherror-lao', { message, backLink })
    }
    return next()
  }
}
