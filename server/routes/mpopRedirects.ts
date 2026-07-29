import { Router } from 'express'
import config from '../config'

export default function addMpopRedirectRoutes(router: Router): void {
  router.get('/case/:crn', (req, res) => {
    const { crn } = req.params
    return res.redirect(`${config.manageProbationUrl}/case/${crn}`)
  })

  router.get('/case', (_req, res) => {
    return res.redirect(`${config.manageProbationUrl}/case`)
  })
}
