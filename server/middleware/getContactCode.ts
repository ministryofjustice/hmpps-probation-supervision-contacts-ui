import { RequestHandler } from 'express'
import { ContactTypeOptions } from '../data/model/contactTypes'
import { slugify } from '../utils/slugify'
import { getStringValue } from '../controllers/addContact'

export const getContactCode = (): RequestHandler => {
  return async (req, res, next) => {
    const contactType = getStringValue(req.params?.contactType)
    const contactTypes = ContactTypeOptions(res.locals.flags)
    const selectedContactType = contactTypes.find(c => slugify(c.description) === contactType)
    res.locals.contactCode = selectedContactType?.code
    return next()
  }
}
