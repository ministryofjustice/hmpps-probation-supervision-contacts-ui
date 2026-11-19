import { RequestHandler } from 'express'
import MasApiClient from '../data/masApiClient'

export const getTemplates = (masApiClient: MasApiClient): RequestHandler => {
  return async (req, res, next) => {
    const { username } = res.locals.user
    res.locals.documentTemplates =
      res.locals.flags?.enableEarlyTermination20261103Squad3 &&
      res.locals.contactCode &&
      res.locals.flags?.earlyTerminationTemplatesAPI20261112Squad3
        ? await masApiClient.getDocumentTemplates(res.locals.contactCode, username)
        : undefined
    return next()
  }
}
