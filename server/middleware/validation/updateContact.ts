import type { RequestHandler } from 'express'
import { validateWithSpec } from '../../utils/validationUtils'
import { updateContactValidation } from '../../properties/validation/updateContact'

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

  const formValues = getFormValues(body)

  body.date = formValues.date
  body.time = formValues.time
  body.sensitivity = formValues.sensitivity

  const errorMessages = validateWithSpec(body, updateContactValidation())

  const detailsValue = getStringValue(body.details)

  if (detailsValue.length > 12000) {
    const excess = detailsValue.length - 12000
    errorMessages.details = `You have entered ${excess} characters too many`
  }

  if (Object.keys(errorMessages).length) {
    res.locals.errorMessages = errorMessages
    console.log(errorMessages)
    return res.render('pages/contacts/update-contact', {
      ...res.locals,
      errorMessages,
      formValues,
    })
  }

  return next()
}

export default updateContact
