import { Router } from 'express'
import type { Services } from '../services'
import { populateContactTypes } from '../middleware/populateContactTypes'
import { isResponsibleOfficerMiddleware } from '../middleware/isResponsibleOfficer'
import { getSentences } from '../middleware/getSentences'
import { getPersonalDetails } from '../middleware/getPersonalDetails'
import { getTierDetails } from '../middleware/getTierDetailsV3'
import addContactType from '../middleware/validation/addContactType'
import { multerErrorHandler } from '../middleware/validation/multerErrorHandler'
import controllers from '../controllers'
import validateCrnParam from '../middleware/validateCrnParam'

export default function addContactRoutes(
  router: Router,
  { masApiClient, tierApiClient, arnsComponents, mpopComponents, hmppsAuthClient }: Services,
): void {
  router.param('crn', validateCrnParam)
  const populate = populateContactTypes()
  const loadPersonalDetails = getPersonalDetails(masApiClient, tierApiClient, arnsComponents)
  const loadTierDetails = getTierDetails(hmppsAuthClient, mpopComponents)
  const loadContactFormDeps = [
    loadPersonalDetails,
    isResponsibleOfficerMiddleware(masApiClient),
    getSentences(masApiClient),
    loadTierDetails,
  ]

  router.get(
    '/case/:crn/add-frequently-used-contact',
    loadPersonalDetails,
    loadTierDetails,
    populate,
    controllers.addContact.getFrequentlyUsedContact(),
  )

  router.get(
    '/case/:crn/contacts/find-contact-to-add',
    loadPersonalDetails,
    loadTierDetails,
    populate,
    controllers.addContact.getSearchByCategory(),
  )

  router.get(
    '/case/:crn/contacts/search-keyword',
    loadPersonalDetails,
    loadTierDetails,
    populate,
    controllers.addContact.getSearchByKeyword(),
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
