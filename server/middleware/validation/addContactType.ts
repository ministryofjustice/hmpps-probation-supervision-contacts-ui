import type { RequestHandler } from 'express'
import { validateWithSpec } from '../../utils/validationUtils'
import { addContactValidation } from '../../properties/validation/addContactType'
import { ContactTypeOptions } from '../../data/model/contactTypes'
import { slugify } from '../../utils/slugify'

const addContactType: RequestHandler = (req, res, next) => {
  const { crn } = req.params
  const { responsibleOfficer, isVisor, responsibleOfficerSurname, responsibleOfficerForename } = req.body
  const rawSlug = req.params.contactType as string
  const slug = rawSlug.replace(/^add-/, '')

  const matched = ContactTypeOptions.find(c => slugify(c.description) === slug)

  const contactTypeName = matched?.description || 'Contact'
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
