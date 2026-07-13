import type { RequestHandler } from 'express'
import { FrequentlyUsedContactTypeOptions } from '../data/model/contactTypes'

export const populateContactTypes = (): RequestHandler => {
  return async (req, res, next) => {
    try {
      res.locals.contactTypes = FrequentlyUsedContactTypeOptions

      next()
    } catch (error) {
      next(error)
    }
  }
}
