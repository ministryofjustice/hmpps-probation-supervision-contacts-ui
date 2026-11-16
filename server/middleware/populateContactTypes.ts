import type { RequestHandler } from 'express'
import { FrequentlyUsedContactTypeOptions } from '../data/model/contactTypes'

export const populateContactTypes = (): RequestHandler => {
  return async (req, res, next) => {
    try {
      res.locals.contactTypes = FrequentlyUsedContactTypeOptions(
        res.locals.flags,
        res.locals.sentences?.length === 0 && res.locals.flags?.enableContactAccessLimitation20261116Squad3,
      )

      next()
    } catch (error) {
      next(error)
    }
  }
}
