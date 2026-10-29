import { Router } from 'express'
import type { Services } from '../services'
import controllers from '../controllers'

export default function addPersonHeaderRoutes(router: Router, { personRecordApiClient }: Services): void {
  router.get('/search/prisoner-image/:prisonerId', controllers.personHeader.getPhoto(personRecordApiClient))
}
