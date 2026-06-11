import type { RequestHandler } from 'express'
import { validateWithSpec } from '../../utils/validationUtils'
import { updateContactValidation } from '../../properties/validation/updateContact'
import { OutcomeContactTypeDetails } from '../../data/model/outcomeContactTypes'
import { NoOutcomeContactTypeDetails } from '../../data/model/noOutcomeContactTypes'
import { buildUpdateContactViewModelWithOutcome } from '../../services/updateContactViewModel'

const getStringValue = (value: unknown): string => {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : ''
  }

  return typeof value === 'string' ? value : ''
}

const getFormValues = (body: Record<string, unknown>): Record<string, string> =>
  Object.entries(body).reduce<Record<string, string>>((accumulator, [key, value]) => {
    accumulator[key] = getStringValue(value)
    return accumulator
  }, {})

const updateContact: RequestHandler = (req, res, next) => {
  const body = (req.body || {}) as Record<string, string | boolean>
  const { crn, contactId } = req.params as Record<string, string>
  const formValues = getFormValues(body)

  body.date = formValues.date
  body.time = formValues.time
  body.sensitivity = formValues.sensitivity
  const { contact } = res.locals

  let displayName = res.locals?.contact.appointment?.displayName

  if (!displayName) {
    displayName = res.locals?.contact?.appointment?.type
  }

  const contactDetails = OutcomeContactTypeDetails.find(item => item.description === displayName)

  const outcomeRequired = contactDetails?.outcomes?.length > 1

  const errorMessages = validateWithSpec(body, updateContactValidation(outcomeRequired))

  const detailsValue = getStringValue(body.details)

  const isOutcome = OutcomeContactTypeDetails.some(item => item.description === displayName)
  const isNoOutcome = NoOutcomeContactTypeDetails.some(item => item.description === displayName)
  let outcomeSection

  if (isOutcome) {
    outcomeSection = buildUpdateContactViewModelWithOutcome({
      displayName,
      contact,
    })
  } else if (!isNoOutcome) {
    return next(new Error(`Unknown contact type: ${displayName}`))
  }

  if (detailsValue.length > 12000) {
    const excess = detailsValue.length - 12000
    errorMessages.details = `You have entered ${excess} characters too many`
  }

  if (Object.keys(errorMessages).length) {
    res.locals.errorMessages = errorMessages
    return res.render('pages/contacts/update-contact', {
      ...res.locals,
      errorMessages,
      formValues,
      crn,
      displayName,
      contactId,
      isOutcome,
      csrfToken: res.locals.csrfToken,
      outcomeSection,
      responsibleOfficer: true,
      responsibleOfficerForename: getStringValue(res.locals.responsibleOfficerForename),
      responsibleOfficerSurname: getStringValue(res.locals.responsibleOfficerSurname),
    })
  }

  return next()
}

export default updateContact
