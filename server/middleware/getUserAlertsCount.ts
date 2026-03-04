import type { RequestHandler } from 'express'
import MasApiClient from '../data/masApiClient'

export const getUserAlertsCount = (masApiClient: MasApiClient): RequestHandler => {
  return async (req, res, next) => {
    const response: number = await masApiClient.getUserAlertsCount(res.locals.user.username)
    res.locals.alertsCount = response < 100 ? response.toString() : '99+'
    return next()
  }
}
