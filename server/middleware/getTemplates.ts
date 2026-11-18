import { RequestHandler } from 'express'
import MasApiClient from '../data/masApiClient'
import { ContactTypeOptions } from '../data/model/contactTypes'
import { slugify } from '../utils/slugify'
import { getStringValue } from '../controllers/addContact'

export const getTemplates = (masApiClient: MasApiClient): RequestHandler => {
  return async (req, res, next) => {
    const { username } = res.locals.user
    const contact = res.locals.contact?.appointment
    const contactType = getStringValue(req.params?.contactType ?? slugify(contact?.displayName ?? contact?.type ?? ''))
    const contactTypes = ContactTypeOptions(res.locals.flags)
    const selectedContactType = contactTypes.find(c => slugify(c.description) === contactType)
    res.locals.contactCode = selectedContactType?.code
    res.locals.documentTemplates =
      res.locals.flags?.enableEarlyTermination20261103Squad3 &&
      res.locals.contactCode &&
      res.locals.flags?.earlyTerminationTemplatesAPI20261112Squad3
        ? await masApiClient.getDocumentTemplates(selectedContactType?.code, username)
        : undefined
    return next()
  }
}
