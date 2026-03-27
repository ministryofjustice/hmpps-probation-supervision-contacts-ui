import type { RequestHandler } from 'express'
import { validateWithSpec } from '../../utils/validationUtils'
import { addContactValidation } from '../../properties/validation/addContactType'

const addContactType: RequestHandler = (req, res, next) => {
  const { crn } = req.params
  const { responsibleOfficer, isVisor, responsibleOfficerSurname, responsibleOfficerForename } = req.body
  const slug = req.params.contactType as string
  const contactTypeName = slug
    .replace(/^add-/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
  const errorMessages = validateWithSpec(req.body, addContactValidation({ responsibleOfficer, isVisor }))

  if (Object.keys(errorMessages).length) {
    res.locals.errorMessages = errorMessages
    return res.render('pages/contacts/add-contact-type', {
      errorMessages,
      crn,
      formValues: req.body,
      isVisor,
      responsibleOfficer,
      responsibleOfficerForename,
      responsibleOfficerSurname,
      contactTypeName,
    })
  }
  return next()
}

export default addContactType
