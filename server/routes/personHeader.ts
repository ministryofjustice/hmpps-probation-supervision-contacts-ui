import { Router } from 'express'
import type { Services } from '../services'
import { getPersonPhoto } from '../middleware/getPersonPhoto'

export default function addPersonHeaderRoutes(router: Router, { hmppsAuthClient, mpopComponents }: Services): void {
  router.get('/person-photo/:nomsNumber', getPersonPhoto(hmppsAuthClient, mpopComponents))
}
