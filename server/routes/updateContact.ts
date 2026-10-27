import { Router } from 'express'
import type { Services } from '../services'
import { isResponsibleOfficerMiddleware } from '../middleware/isResponsibleOfficer'
import { getSentences } from '../middleware/getSentences'
import { getPersonalDetails } from '../middleware/getPersonalDetails'
import { multerErrorHandler } from '../middleware/validation/multerErrorHandler'
import { getPersonRiskFlags } from '../middleware/getPersonRiskFlags'
import controllers from '../controllers'
import validateCrnParam from '../middleware/validateCrnParam'
import { getExistingContact } from '../middleware/getContact'
import updateContact from '../middleware/validation/updateContact'
import { getTierDetails } from '../middleware/getTierDetailsV3'
import { getSupervisionPackage } from '../middleware/getSupervisionPackage'
import { setCollapsibleRiskFlags } from '../middleware/setCollapsibleRiskFlags'

export default function addUpdateContactRoutes(
  router: Router,
  { masApiClient, tierApiClient, prisonApiClient, arnsComponents, mpopComponents, hmppsAuthClient }: Services,
): void {
  router.param('crn', validateCrnParam)
  const loadPersonalDetails = getPersonalDetails(
    masApiClient,
    tierApiClient,
    arnsComponents,
    prisonApiClient,
    hmppsAuthClient,
  )
  const loadTierDetails = getTierDetails(hmppsAuthClient, mpopComponents)
  const loadSupervisionPackage = getSupervisionPackage(hmppsAuthClient, mpopComponents)

  const loadEditContactDeps = [
    loadSupervisionPackage,
    loadPersonalDetails,
    loadTierDetails,
    isResponsibleOfficerMiddleware(masApiClient),
    getPersonRiskFlags(masApiClient),
    getSentences(masApiClient),
    getExistingContact(masApiClient),
    setCollapsibleRiskFlags,
  ]

  router.get(
    '/case/:crn/:contactId/update-contact',
    ...loadEditContactDeps,
    controllers.updateContact.getUpdateContact(masApiClient),
  )
  router.post(
    '/case/:crn/:contactId/update-contact',
    multerErrorHandler('fileUpload'),
    ...loadEditContactDeps,
    updateContact,
    controllers.updateContact.postupdateContact(masApiClient),
  )
}
