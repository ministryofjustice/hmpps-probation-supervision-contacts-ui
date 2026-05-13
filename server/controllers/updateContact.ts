import type { RequestHandler } from 'express'
import { NoOutcomeContactTypeDetails } from '../data/model/noOutcomeContactTypes'
import { toIsoDateTime } from '../utils/toDateandTime'

const getStringValue = (value: unknown): string => {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : ''
  }

  return typeof value === 'string' ? value : ''
}

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
      try {
        console.log('hit post controller')

        const { crn } = req.params as Record<string, string>

        const date = getStringValue(req.body?.date)
        const time = getStringValue(req.body?.time)
        const contactType = res.locals.contact.appointment?.displayName
        const formattedDateandTime = toIsoDateTime(date, time)

        return res.sendStatus(200)
      } catch (e) {
        return next(e)
      }
    }
  },
}

export default updateContactController
