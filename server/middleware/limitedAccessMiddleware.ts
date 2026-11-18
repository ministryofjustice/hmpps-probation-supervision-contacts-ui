import type { RequestHandler } from 'express'
import createError from 'http-errors'
import MasApiClient from '../data/masApiClient'
import { isValidCrn } from '../utils/isValidCrn'

export const limitedAccess = (masApiClient: MasApiClient): RequestHandler => {
  return async (req, res, next) => {
    if (!isValidCrn(req?.params?.crn as string)) {
      return next(createError(404, 'Not found'))
    }
    const { backUrl: backLink } = req.query
    const access = await masApiClient.getUserAccess(res.locals.user.username, req.params.crn as string)
    if (access.userExcluded || access.userRestricted) {
      const message =
        access.exclusionMessage || access.restrictionMessage || 'You are not authorised to view this case.'

      return res.render('autherror-lao', { message, backLink })
    }
    return next()
  }
}
