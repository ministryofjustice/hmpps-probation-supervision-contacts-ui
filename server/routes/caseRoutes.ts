import { Router } from 'express'
import type { Services } from '../services'
import { getPersonalDetails } from '../middleware/getPersonalDetails'

export default function caseRoutes({ masApiClient, arnsApiClient, tierApiClient }: Services): Router {
  const router = Router()

  router.get('/case/:crn', (req, res) => {
    const { crn } = req.params
    return res.redirect(`/case/${crn}/add-frequently-used-contact`)
  })

  return router
}
