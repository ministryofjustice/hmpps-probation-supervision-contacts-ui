import { Router } from 'express'
import { PERSON_PHOTO_PATH } from '@ministryofjustice/hmpps-mpop-frontend-components-lib'
import type { Services } from '../services'
import { getPersonPhoto } from '../middleware/getPersonPhoto'

export default function addPersonHeaderRoutes(router: Router, { hmppsAuthClient, mpopComponents }: Services): void {
  router.get(PERSON_PHOTO_PATH, getPersonPhoto(hmppsAuthClient, mpopComponents))
}
