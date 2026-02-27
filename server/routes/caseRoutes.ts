import { Router } from 'express'
import type { Services } from '../services'
import { getPersonalDetails } from '../middleware/getPersonalDetails'

export default function caseRoutes({ hmppsAuthClient }: Services): Router {
  const router = Router()

  router.get('/case/:crn', getPersonalDetails(hmppsAuthClient), async (req, res) => {
    return res.render('pages/case', {
      pageTitle: `${res.locals.headerPersonName?.forename} ${res.locals.headerPersonName?.surname} - Contacts`,
    })
  })

  return router
}
