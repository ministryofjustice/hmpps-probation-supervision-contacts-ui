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

export default function addUpdateContactRoutes(
  router: Router,
  { masApiClient, arnsApiClient, tierApiClient, arnsComponents }: Services,
): void {
  router.param('crn', validateCrnParam)
  const loadPersonalDetails = getPersonalDetails(masApiClient, arnsApiClient, tierApiClient, arnsComponents)
  const loadEditContactDeps = [
    loadPersonalDetails,
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
