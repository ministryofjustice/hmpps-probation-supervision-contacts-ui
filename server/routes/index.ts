import { Router } from 'express'

import type { Services } from '../services'
import { Page } from '../services/auditService'

export default function routes({ auditService }: Services): Router {
  const router = Router()

  router.get('/', async (req, res, next) => {
    await auditService.logPageView(Page.EXAMPLE_PAGE, { who: res.locals.user.username, correlationId: req.id })

    const currentTime = new Date().toLocaleTimeString('en-GB', {
      hour12: false,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    return res.render('pages/index', { currentTime })
  })

  return router
}
