import type { RequestHandler } from 'express'
import { NoOutcomeContactTypeDetails } from '../data/model/noOutcomeContactTypes'
import { OutcomeContactTypeDetails } from '../data/model/outcomeContactTypes'
import { toIsoDateTime } from '../utils/toDateandTime'
import { UpdateContactWithNoOutcome, UpdateContactWithOutcome } from '../data/model/contacts'
import MasApiClient from '../data/masApiClient'
import config from '../config'
import ContactService from '../services/contactService'
import { buildUpdateContactViewModelWithOutcome, updateContactOutcomeCode } from '../services/updateContactViewModel'
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

      const displayName = contact.appointment?.displayName ?? contact.appointment?.type

      const isOutcome = OutcomeContactTypeDetails.some(item => item.description === displayName)
      const isNoOutcome = NoOutcomeContactTypeDetails.some(item => item.description === displayName)
      let outcomeSection

      if (isOutcome) {
        outcomeSection = buildUpdateContactViewModelWithOutcome({
          displayName,
          contact,
        })
      } else if (!isNoOutcome) {
        return res.redirect(`${config.manageProbationUrl}/case/${crn}/activity/${contactId}`)
      }

      return res.render('pages/contacts/update-contact', {
        crn,
        displayName,
        contactId,
        contact,
        isOutcome,
        csrfToken: res.locals.csrfToken,
        outcomeSection,
        responsibleOfficer: true,
        responsibleOfficerForename: getStringValue(res.locals.responsibleOfficerForename),
        responsibleOfficerSurname: getStringValue(res.locals.responsibleOfficerSurname),
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
      const alertResponsibleOfficer = getStringValue(req.body?.alertResponsibleOfficer)
      const sensitivity = res.locals.contact.appointment?.isSensitive || getStringValue(req.body?.sensitivity) === 'Yes'

      const { contact } = res.locals

      const displayName = contact.appointment?.displayName ?? contact.appointment?.type

      const existingNotes = res.locals.contact.appointment?.appointmentNotes[0]?.note
      const normaliseText = (value: string) => value.replace(/\r\n/g, '\n').trim()

      if (normaliseText(existingNotes) === normaliseText(notes)) {
        notes = ''
      }

      const isOutcome = OutcomeContactTypeDetails.some(item => item.description === displayName)

      const isNoOutcome = NoOutcomeContactTypeDetails.some(item => item.description === displayName)

      if (!isOutcome && !isNoOutcome) {
        return res.redirect(`${config.manageProbationUrl}/case/${crn}/activity/${contactId}`)
      }
      const contactService = new ContactService(masApiClient)

      const formattedDateandTime = toIsoDateTime(date, time)

      if (isOutcome) {
        const outcomeCode = updateContactOutcomeCode(displayName, req.body?.outcomeCode)

        const payload: UpdateContactWithOutcome = {
          date: convertDateToIso(date),
          time,
          notes: notes || '',
          sensitive: sensitivity,
          outcomeCode,
          enforcementActionCode: null,
          alert: alertResponsibleOfficer === 'Yes',
        }
        await contactService.updateContactWithOutcome(contactId, payload, username)
      } else {
        const payload: UpdateContactWithNoOutcome = {
          dateTime: formattedDateandTime,
          notes: notes || null,
          sensitiveFlag: sensitivity,
        }

        await contactService.updateContactWithNoOutcome(contactId, payload, username)
      }

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

      return res.redirect(`${config.manageProbationUrl}/case/${crn}/activity/${contactId}?showSuccessBanner=true`)
    }
  },
}

export default updateContactController
