import { RequestHandler } from 'express'
import { ContactTypeOptions } from '../data/model/contactTypes'
import { slugify } from '../utils/slugify'
import { getStringValue } from '../controllers/addContact'

export const getContactCode: RequestHandler = (req, res, next) => {
  const contact = res.locals.contact?.appointment
  const contactType = getStringValue(req.params?.contactType ?? slugify(contact?.displayName ?? contact?.type ?? ''))
  const contactTypes = ContactTypeOptions(res.locals.flags)
  const selectedContactType = contactTypes.find(c => slugify(c.description) === contactType)
  res.locals.contactCode = selectedContactType?.code
  return next()
}
