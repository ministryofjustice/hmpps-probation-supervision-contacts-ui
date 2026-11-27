import { RequestHandler } from 'express'
import { ContactTypeOption, ContactTypeOptions } from '../data/model/contactTypes'
import { slugify } from '../utils/slugify'
import { getStringValue } from '../controllers/addContact'
import { ContactTypeFullDetail } from '../data/model/contactInfo'

export const getContactCode: RequestHandler = (req, res, next) => {
  const contact = res.locals.contact?.appointment
  const contactType = getStringValue(req.params?.contactType ?? slugify(contact?.displayName ?? contact?.type ?? ''))
  const contactTypes: ContactTypeOption[] | ContactTypeFullDetail[] = res.locals.flags
    ?.enableCheckOutcomes20261124Squad3
    ? res.locals.contactTypes
    : ContactTypeOptions(res.locals.flags)
  const selectedContactType = contactTypes.find(c => slugify(c.description) === contactType)
  res.locals.contactCode = selectedContactType?.code
  return next()
}
