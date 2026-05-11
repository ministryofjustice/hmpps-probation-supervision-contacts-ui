import type { RequestHandler } from 'express'
import { NoOutcomeContactTypeDetails } from '../data/model/noOutcomeContactTypes'

const updateContactController = {
  getUpdateContact: (): RequestHandler => {
    return async (req, res, next) => {
      try {
        const { crn, contactId } = req.params as Record<string, string>

        const { contact } = res.locals

        const displayName = contact.appointment?.displayName

        const isOutcome = !NoOutcomeContactTypeDetails.some(item => item.description === displayName)

        return res.render('pages/contacts/update-contact', {
          crn,
          contactId,
          contact,
          isOutcome,
          csrfToken: res.locals.csrfToken,
        })
      } catch (error) {
        return next(error)
      }
    }
  },

  postupdateContact: (): RequestHandler => {
    return async (req, res, next) => {
      // Placeholder
    }
  },
}

export default updateContactController
