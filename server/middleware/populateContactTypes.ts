import type { RequestHandler } from 'express'
import { FrequentlyUsedContactTypeOptions } from '../data/model/contactTypes'

export const populateContactTypes = (): RequestHandler => {
  return async (req, res, next) => {
    try {
      res.locals.contactTypes = FrequentlyUsedContactTypeOptions(res.locals.flags)

      next()
    } catch (error) {
      next(error)
    }
  }
}
