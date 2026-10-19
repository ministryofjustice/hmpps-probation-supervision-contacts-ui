import { Router } from 'express'
import config from '../config'

export default function addMpopRedirectRoutes(router: Router): void {
  router.get('/case/:crn', (req, res) => {
    const { crn } = req.params
    return res.redirect(`${config.manageProbationUrl}/case/${crn}`)
  })

  // Links in the person header that go to MPoP
  router.get(
    ['/case/:crn/risk', '/case/:crn/risk/flag/:flagId', '/case/:crn/personal-details/staff-contacts'],
    (req, res) => {
      return res.redirect(`${config.manageProbationUrl}${req.path}`)
    },
  )

  router.get('/case', (_req, res) => {
    return res.redirect(`${config.manageProbationUrl}/case`)
  })
}
