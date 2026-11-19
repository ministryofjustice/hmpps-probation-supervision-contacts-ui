import type { RequestHandler } from 'express'
import MasApiClient from '../data/masApiClient'

export const getContactOutcomes = (masApiClient: MasApiClient): RequestHandler => {
  return async (req, res, next) => {
    const response =
      res.locals.flags?.enableEarlyTermination20261103Squad3 &&
      res.locals.contactCode &&
      res.locals.flags?.enableETAdditionalOutcomes20261117Squad3
        ? await masApiClient.getContactTypeOutcomes(res.locals.contactCode, res.locals.user.username)
        : undefined
    res.locals.outcomeCodes = response?.outcomes.map(outcome => outcome.code)
    return next()
  }
}
