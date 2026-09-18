import { Router } from 'express'
import type { Services } from '../services'
import { isResponsibleOfficerMiddleware } from '../middleware/isResponsibleOfficer'
import { getSentences } from '../middleware/getSentences'
import { getPersonalDetails } from '../middleware/getPersonalDetails'
import { multerErrorHandler } from '../middleware/validation/multerErrorHandler'
import controllers from '../controllers'
import validateCrnParam from '../middleware/validateCrnParam'
import { getExistingContact } from '../middleware/getContact'
import updateContact from '../middleware/validation/updateContact'
import { getTierDetails } from '../middleware/getTierDetailsV3'

export default function addUpdateContactRoutes(
  router: Router,
  { masApiClient, tierApiClient, arnsComponents, mpopComponents, hmppsAuthClient }: Services,
): void {
  router.param('crn', validateCrnParam)
  const loadPersonalDetails = getPersonalDetails(masApiClient, tierApiClient, arnsComponents)
  const loadTierDetails = getTierDetails(hmppsAuthClient, mpopComponents)

  const loadEditContactDeps = [
    loadPersonalDetails,
    loadTierDetails,
    isResponsibleOfficerMiddleware(masApiClient),
    getSentences(masApiClient),
    getExistingContact(masApiClient),
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
