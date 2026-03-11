import type { RequestHandler } from 'express'
import { validateWithSpec } from '../../utils/validationUtils'
import { addFrequentlyUsedContactValidation } from '../../properties/validation/addFrequentlyUsedContact'

const addFrequentlyUsedContact: RequestHandler = (req, res, next) => {
  const { crn } = req.params
  const errorMessages = validateWithSpec(req.body, addFrequentlyUsedContactValidation())

  if (Object.keys(errorMessages).length) {
    res.locals.errorMessages = errorMessages
    return res.render('pages/contacts/add-frequently-used-contact', {
      errorMessages,
      crn,
      formValues: req.body,
      radioItems: res.locals.radioItems,
      ndeliusDeepLinkUrl: '#', // TODO: deliusDeepLinkUrl when NDelius config available
      contactLogUrl: `/case/${crn}/activity-log/`,
    })
  }
  return next()
}

export default addFrequentlyUsedContact
