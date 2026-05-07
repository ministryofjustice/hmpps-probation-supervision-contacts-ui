import { Router } from 'express'
import type { Services } from '../services'
import { isResponsibleOfficerMiddleware } from '../middleware/isResponsibleOfficer'
import { getSentences } from '../middleware/getSentences'
import { getPersonalDetails } from '../middleware/getPersonalDetails'
import { multerErrorHandler } from '../middleware/validation/multerErrorHandler'
import controllers from '../controllers'
import validateCrnParam from '../middleware/validateCrnParam'
import { getExistingContact } from '../middleware/getContact'

export default function addUpdateContactRoutes(
  router: Router,
  { masApiClient, arnsApiClient, tierApiClient }: Services,
): void {
  router.param('crn', validateCrnParam)
  const loadPersonalDetails = getPersonalDetails(masApiClient, arnsApiClient, tierApiClient)
  const loadEditContactDeps = [
    loadPersonalDetails,
    isResponsibleOfficerMiddleware(masApiClient),
    getSentences(masApiClient),
    getExistingContact(masApiClient),
  ]

  router.get(
    '/case/:crn/:contactId/update-contact',
    ...loadEditContactDeps,
    controllers.updateContact.getUpdateContact(),
  )
}
