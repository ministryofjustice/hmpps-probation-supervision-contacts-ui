import type { RequestHandler } from 'express'
import MasApiClient from '../data/masApiClient'
import { PersonContact } from '../data/model/contacts'

export const getExistingContact = (masApiClient: MasApiClient): RequestHandler => {
  return async (req, res, next) => {
    try {
      const crn = req.params.crn as string
      const contactId = req.params.contactId as string
      const { username } = res.locals.user

      const contact: PersonContact | null = await masApiClient.getPersonContact(crn, contactId, username)
      res.locals.contact = contact

      next()
    } catch (error) {
      next(error)
    }
  }
}
