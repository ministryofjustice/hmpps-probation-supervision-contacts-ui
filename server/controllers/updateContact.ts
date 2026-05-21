import type { RequestHandler } from 'express'
import { NoOutcomeContactTypeDetails } from '../data/model/noOutcomeContactTypes'
import { OutcomeContactTypeDetails } from '../data/model/outcomeContactTypes'
import { toIsoDateTime } from '../utils/toDateandTime'
import { UpdateContactWithNoOutcome } from '../data/model/contacts'
import MasApiClient from '../data/masApiClient'
import config from '../config'
import ContactService from '../services/contactService'
import { buildUpdateContactViewModelWithOutcome } from '../services/updateContactViewModel'
import { convertDateToIso } from '../utils/toDateOnly'

const getStringValue = (value: unknown): string => {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : ''
  }

  return typeof value === 'string' ? value : ''
}

const updateContactController = {
  getUpdateContact: (): RequestHandler => {
    return async (req, res, next) => {
      const { crn, contactId } = req.params as Record<string, string>

      const { contact } = res.locals

      const displayName = contact.appointment?.displayName

      const isOutcome = OutcomeContactTypeDetails.some(item => item.description === displayName)
      const isNoOutcome = NoOutcomeContactTypeDetails.some(item => item.description === displayName)
      let outcomeSection = {}

      if (isOutcome) {
        outcomeSection = buildUpdateContactViewModelWithOutcome({
          crn,
          displayName,
          contact,
        })
      } else if (!isNoOutcome) {
        return next(new Error(`Unknown contact type: ${displayName}`))
      }

      return res.render('pages/contacts/update-contact', {
        crn,
        contactId,
        contact,
        isOutcome,
        csrfToken: res.locals.csrfToken,
        outcomeSection,
      })
    }
  },

  postupdateContact: (masApiClient: MasApiClient): RequestHandler => {
    return async (req, res, next) => {
      const { crn, contactId } = req.params as Record<string, string>
      const { username } = res.locals.user
      const date = getStringValue(req.body?.date)
      const time = getStringValue(req.body?.time)
      let notes = getStringValue(req.body?.details)
      const sensitivity = res.locals.contact.appointment?.isSensitive || getStringValue(req.body?.sensitivity) === 'Yes'
      const contactType = res.locals.contact.appointment?.displayName
      const existingNotes = res.locals.contact.appointment?.appointmentNotes[0]?.note
      const normaliseText = (value: string) => value.replace(/\r\n/g, '\n').trim()

      if (normaliseText(existingNotes) === normaliseText(notes)) {
        notes = ''
      }

      const isOutcome = OutcomeContactTypeDetails.some(item => item.description === contactType)

      const isNoOutcome = NoOutcomeContactTypeDetails.some(item => item.description === contactType)

      if (!isOutcome && !isNoOutcome) {
        throw new Error(`Unknown contact type: ${contactType}`)
      }

      const formattedDateandTime = toIsoDateTime(date, time)

      if (isOutcome) {
        const outcomeContactService = new ContactService(masApiClient)
        const payload = {
          date: convertDateToIso(date),
          time,
          notes: notes || '',
          sensitive: sensitivity,
          outcomeCode: getStringValue(req.body?.outcomeCode),
        }

        await outcomeContactService.updateContactWithOutcome(contactId, payload, username)
      } else {
        const contactService = new ContactService(masApiClient)

        const payload: UpdateContactWithNoOutcome = {
          dateTime: formattedDateandTime,
          notes: notes || '',
          sensitiveFlag: sensitivity,
        }

        await contactService.updateContactWithNoOutcome(contactId, payload, username)

        if (req.file) {
          try {
            await contactService.patchDocuments(crn, contactId.toString(), req.file, username)

            return res.redirect(`${config.manageProbationUrl}/case/${crn}/activity/${contactId}?showSuccessBanner=true`)
          } catch {
            return res.redirect(
              `${config.manageProbationUrl}/case/${crn}/activity/${contactId}?showSuccessBanner=true&uploadFailed=true`,
            )
          }
        }
      }

      return res.redirect(`${config.manageProbationUrl}/case/${crn}/activity/${contactId}?showSuccessBanner=true`)
    }
  },
}

export default updateContactController
