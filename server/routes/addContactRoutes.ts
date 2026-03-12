import { Router } from 'express'
import type { Services } from '../services'
import { populateContactTypes } from '../middleware/populateContactTypes'
import { isResponsibleOfficerMiddleware } from '../middleware/isResponsibleOfficer'
import { getSentences } from '../middleware/getSentences'
import { getPersonalDetails } from '../middleware/getPersonalDetails'
import addContactType from '../middleware/validation/addContactType'
import { multerErrorHandler } from '../middleware/validation/multerErrorHandler'
import addFrequentlyUsedContact from '../middleware/validation/addFrequentlyUsedContact'
import controllers from '../controllers'

export default function addContactRoutes(
  router: Router,
  { masApiClient, arnsApiClient, tierApiClient }: Services,
): void {
  const populate = populateContactTypes(masApiClient)
  const loadPersonalDetails = getPersonalDetails(masApiClient, arnsApiClient, tierApiClient)
  const loadContactFormDeps = [
    loadPersonalDetails,
    isResponsibleOfficerMiddleware(masApiClient),
    getSentences(masApiClient),
  ]

  router.get(
    '/case/:crn/add-frequently-used-contact',
    loadPersonalDetails,
    populate,
    controllers.addContact.getFrequentlyUsedContact(masApiClient),
  )

  router.post(
    '/case/:crn/add-frequently-used-contact',
    loadPersonalDetails,
    populate,
    addFrequentlyUsedContact,
    controllers.addContact.postFrequentlyUsedContact(masApiClient),
  )

  router.get(
    '/case/:crn/contacts/add-:contactType',
    ...loadContactFormDeps,
    controllers.addContact.getAddContactType(masApiClient),
  )

  router.post(
    '/case/:crn/contacts/add-:contactType',
    multerErrorHandler('fileUpload'),
    ...loadContactFormDeps,
    addContactType,
    controllers.addContact.postAddContactType(masApiClient),
  )
}
