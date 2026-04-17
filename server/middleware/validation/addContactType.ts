import type { RequestHandler } from 'express'
import { validateWithSpec } from '../../utils/validationUtils'
import { addContactValidation } from '../../properties/validation/addContactType'
import { buildAddContactViewModel } from '../../services/addContactViewModel'

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

const addContactType: RequestHandler = (req, res, next) => {
  const crn = getStringValue(req.params?.crn)
  const responsibleOfficer = getStringValue(req.body?.responsibleOfficer)
  const isVisor = getStringValue(req.body?.isVisor)
  const responsibleOfficerSurname = getStringValue(req.body?.responsibleOfficerSurname)
  const responsibleOfficerForename = getStringValue(req.body?.responsibleOfficerForename)
  const formValues = getFormValues(req.body as Record<string, unknown>)
  const rawSlug = getStringValue(req.params?.contactType)
  const slug = rawSlug.replace(/^add-/, '')

  const errorMessages = validateWithSpec(req.body, addContactValidation({ responsibleOfficer, isVisor }))

  const detailsValue = typeof req.body?.details === 'string' ? req.body.details : ''
  if (detailsValue.length > 12000) {
    const excess = detailsValue.length - 12000
    errorMessages.details = `You have entered ${excess} characters too many`
  }

  if (Object.keys(errorMessages).length) {
    res.locals.errorMessages = errorMessages
    const headerName = res.locals.headerPersonName
    const personName = `${headerName?.forename || ''} ${headerName?.surname || ''}`.trim()
    const viewModel = buildAddContactViewModel({
      crn,
      slug,
      sentences: res.locals.sentences || [],
      personName,
      formValues,
      isVisor,
      responsibleOfficer,
      responsibleOfficerForename,
      responsibleOfficerSurname,
      csrfToken: getStringValue(res.locals.csrfToken),
    })
    return res.render('pages/contacts/add-contact-type', {
      ...viewModel,
      errorMessages,
    })
  }
  return next()
}

export default addContactType
