import type { RequestHandler } from 'express'
import { FrequentlyUsedContactTypeOptions } from '../data/model/contactTypes'
import { ContactTypeFullDetail } from '../data/model/contactInfo'

export const populateFrequentContactTypes = (): RequestHandler => {
  return async (req, res, next) => {
    try {
      if (res.locals.flags?.enableCheckOutcomes20261124Squad3 && res.locals.contactTypes) {
        const frequentTypes = res.locals.contactTypes.filter((entry: ContactTypeFullDetail) => entry.isFrequentlyUsed)
        res.locals.frequentContactTypes = frequentTypes
      } else {
        res.locals.contactTypes = FrequentlyUsedContactTypeOptions(res.locals.flags)
      }
      next()
    } catch (error) {
      next(error)
    }
  }
}
