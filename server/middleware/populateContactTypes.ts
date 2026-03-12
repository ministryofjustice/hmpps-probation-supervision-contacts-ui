import type { RequestHandler } from 'express'
import MasApiClient from '../data/masApiClient'
import { getFrequentContactTypes } from './getFrequentlyUsedContactTypes'

export const populateContactTypes = (masApiClient: MasApiClient): RequestHandler => {
  return async (req, res, next) => {
    try {
      const contactTypes = await getFrequentContactTypes(req, masApiClient, res.locals.user.username)

      const radioItems: any[] = [
        {
          value: 'APPOINTMENT',
          text: 'An appointment',
          checked: req.body?.contactType === 'APPOINTMENT',
        },
      ]

      radioItems.push(
        ...contactTypes.map((contact: any) => ({
          value: contact.code,
          text: contact.description,
          checked: req.body?.contactType === contact.code,
        })),
      )

      radioItems.push({ divider: 'or' })

      radioItems.push({
        value: 'NDELIUS',
        text: 'I want to add a different contact (opens NDelius in a new tab)',
        checked: req.body?.contactType === 'NDELIUS',
      })

      res.locals.contactTypes = contactTypes
      res.locals.radioItems = radioItems

      next()
    } catch (error) {
      next(error)
    }
  }
}
