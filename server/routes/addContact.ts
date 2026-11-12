import { Router } from 'express'
import type { Services } from '../services'
import { populateContactTypes } from '../middleware/populateContactTypes'
import { isResponsibleOfficerMiddleware } from '../middleware/isResponsibleOfficer'
import { getSentences } from '../middleware/getSentences'
import { getPersonalDetails } from '../middleware/getPersonalDetails'
import { getTierDetails } from '../middleware/getTierDetailsV3'
import { getSupervisionPackage } from '../middleware/getSupervisionPackage'
import addContactType from '../middleware/validation/addContactType'
import { multerErrorHandler } from '../middleware/validation/multerErrorHandler'
import controllers from '../controllers'
import validateCrnParam from '../middleware/validateCrnParam'
import { getPersonRiskFlags } from '../middleware/getPersonRiskFlags'
import { setCollapsibleRiskFlags } from '../middleware/setCollapsibleRiskFlags'

export default function addContactRoutes(
  router: Router,
  { masApiClient, tierApiClient, prisonApiClient, arnsComponents, mpopComponents, hmppsAuthClient }: Services,
): void {
  router.param('crn', validateCrnParam)
  const populate = populateContactTypes()
  const loadPersonalDetails = getPersonalDetails(
    masApiClient,
    tierApiClient,
    arnsComponents,
    prisonApiClient,
    hmppsAuthClient,
  )
  const loadTierDetails = getTierDetails(hmppsAuthClient, mpopComponents)
  const loadSupervisionPackage = getSupervisionPackage(hmppsAuthClient, mpopComponents)
  const loadContactFormDeps = [
    loadSupervisionPackage,
    loadPersonalDetails,
    isResponsibleOfficerMiddleware(masApiClient),
    getPersonRiskFlags(masApiClient),
    getSentences(masApiClient),
    loadTierDetails,
    setCollapsibleRiskFlags,
  ]

  router.get(
    '/case/:crn/add-frequently-used-contact',
    loadSupervisionPackage,
    loadPersonalDetails,
    getPersonRiskFlags(masApiClient),
    loadTierDetails,
    setCollapsibleRiskFlags,
    populate,
    controllers.addContact.getFrequentlyUsedContact(),
  )

  router.get(
    '/case/:crn/contacts/find-contact-to-add',
    loadSupervisionPackage,
    loadPersonalDetails,
    getPersonRiskFlags(masApiClient),
    loadTierDetails,
    setCollapsibleRiskFlags,
    populate,
    controllers.addContact.getSearchByCategory(),
  )

  router.get(
    '/case/:crn/contacts/search-keyword',
    loadSupervisionPackage,
    loadPersonalDetails,
    getPersonRiskFlags(masApiClient),
    loadTierDetails,
    setCollapsibleRiskFlags,
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
