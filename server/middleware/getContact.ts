import type { RequestHandler } from 'express'
import MasApiClient from '../data/masApiClient'
import { PersonContact } from '../data/model/contacts'

export const getExistingContact = (masApiClient: MasApiClient): RequestHandler => {
  return async (req, res, next) => {
    try {
      const { crn, contactId } = req.params
      if (typeof crn !== 'string' || typeof contactId !== 'string') {
        return next(new Error('Invalid CRN or contact ID'))
      }

      const { username } = res.locals.user

      const contact: PersonContact | null = await masApiClient.getPersonContact(crn, contactId, username)
      res.locals.contact = contact

      return next()
    } catch (error) {
      return next(error)
    }
  }
}
