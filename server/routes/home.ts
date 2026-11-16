import type { Router } from 'express'

export default function addHomeRoutes(router: Router) {
  router.get('/sentry-test-error', (_req, _res) => {
    throw new Error('Sentry alert test (Express) - ignore')
  })
}
