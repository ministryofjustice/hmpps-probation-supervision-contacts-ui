import type { RequestHandler } from 'express'
import { AuthenticationClient } from '../data'
import MasApiClient from '../data/masApiClient'

export const getUserAlertsCount = (hmppsAuthClient: AuthenticationClient): RequestHandler => {
  return async (req, res, next) => {
    const token = await hmppsAuthClient.getToken(res.locals.user.username)
    const masClient = new MasApiClient(token)
    const response: number = await masClient.getUserAlertsCount()
    res.locals.alertsCount = response < 100 ? response.toString() : '99+'
    return next()
  }
}
