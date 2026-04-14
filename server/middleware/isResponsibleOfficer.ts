import type { RequestHandler } from 'express'
import MasApiClient from '../data/masApiClient'

export const isResponsibleOfficerMiddleware = (masApiClient: MasApiClient): RequestHandler => {
  return async (req, res, next) => {
    try {
      const crn = req.params.crn as string
      const { username } = res.locals.user
      const pp = await masApiClient.getProbationPractitioner(crn, username)
      res.locals.isResponsibleOfficer = pp?.username?.toUpperCase() === username.toUpperCase()
      res.locals.responsibleOfficerUsername = pp?.username
      res.locals.responsibleOfficerForename = pp?.name?.forename
      res.locals.responsibleOfficerSurname = pp?.name?.surname
      next()
    } catch (error) {
      next(error)
    }
  }
}
