import type { RequestHandler } from 'express'
import { validateWithSpec } from '../../utils/validationUtils'
import { addFrequentlyUsedContactValidation } from '../../properties/validation/addFrequentlyUsedContact'
import { deliusDeepLinkUrl } from '../../utils/deliusDeepLinkUrl'
import { slugify } from '../../utils/slugify'
import config from '../../config'

const addFrequentlyUsedContact: RequestHandler = (req, res, next) => {
  const { crn } = req.params
  const errorMessages = validateWithSpec(req.body, addFrequentlyUsedContactValidation())

  if (Object.keys(errorMessages).length) {
    const contactTypes = Array.isArray(res.locals.contactTypes) ? res.locals.contactTypes : []
    const frequentlyUsedContacts = contactTypes
      .slice()
      .sort((first: any, second: any) => first.description.localeCompare(second.description))
      .map((contact: any) => ({
        text: contact.description,
        href: `/case/${crn}/contacts/add-${slugify(contact.description)}`,
      }))
    res.locals.errorMessages = errorMessages
    return res.render('pages/contacts/add-frequently-used-contact', {
      errorMessages,
      crn,
      formValues: req.body,
      radioItems: res.locals.radioItems,
      frequentlyUsedContacts,
      ndeliusDeepLinkUrl: deliusDeepLinkUrl('ContactList', crn as string),
      contactLogUrl: `${config.manageProbationUrl}/case/${crn}/activity-log`,
    })
  }
  return next()
}

export default addFrequentlyUsedContact
