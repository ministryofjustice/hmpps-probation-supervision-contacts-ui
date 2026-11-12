import { RequestHandler } from 'express'
import MasApiClient from '../data/masApiClient'
import { ContactTypeOptions } from '../data/model/contactTypes'
import { slugify } from '../utils/slugify'
import { getStringValue } from '../controllers/addContact'

export const getTemplates = (masApiClient: MasApiClient): RequestHandler => {
  return async (req, res, next) => {
    const { username } = res.locals.user
    const contactType = getStringValue(req.params?.contactType ?? slugify(res.locals?.contact.appointment?.displayName))
    const contactTypes = ContactTypeOptions(res.locals.flags)
    const selectedContactType = contactTypes.find(c => slugify(c.description) === contactType)
    res.locals.contactCode = selectedContactType?.code
    const documentTemplates =
      res.locals.flags?.enableEarlyTermination20261103Squad3 && res.locals.contactCode
        ? await masApiClient.getDocumentTemplates(selectedContactType?.code, username)
        : undefined
    res.locals.documentTemplates = documentTemplates?.templates
    return next()
  }
}
