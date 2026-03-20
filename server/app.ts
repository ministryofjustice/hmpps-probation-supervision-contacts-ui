import express, { Router } from 'express'

import createError from 'http-errors'

import nunjucksSetup from './utils/nunjucksSetup'
import errorHandler from './errorHandler'
import { appInsightsMiddleware } from './utils/azureAppInsights'
import authorisationMiddleware from './middleware/authorisationMiddleware'

import setUpAuthentication from './middleware/setUpAuthentication'
import setUpCsrf from './middleware/setUpCsrf'
import setUpCurrentUser from './middleware/setUpCurrentUser'
import setUpHealthChecks from './middleware/setUpHealthChecks'
import setUpStaticResources from './middleware/setUpStaticResources'
import setUpWebRequestParsing from './middleware/setupRequestParsing'
import setUpWebSecurity from './middleware/setUpWebSecurity'
import setUpWebSession from './middleware/setUpWebSession'
import getFrontendComponents from './middleware/probationFEComponentsMiddleware'
import baseController from './baseController'
import { getUserAlertsCount } from './middleware/getUserAlertsCount'
import setUpFlags from './middleware/setUpFlags'

import addContactRoutes from './routes/addContact'
import type { Services } from './services'

export default function createApp(services: Services): express.Application {
  const app = express()

  app.set('json spaces', 2)
  app.set('trust proxy', true)
  app.set('port', process.env.PORT || 3000)

  app.use(appInsightsMiddleware())
  app.use(setUpHealthChecks(services.applicationInfo))
  app.use(setUpWebSecurity())
  app.use(setUpWebSession())
  app.use(setUpWebRequestParsing())
  app.use(setUpStaticResources())
  app.use(baseController())
  nunjucksSetup(app)
  app.use(setUpAuthentication())
  app.use(authorisationMiddleware())
  app.use(setUpCurrentUser())
  app.use(setUpFlags(services))
  app.use(getFrontendComponents(services.probationComponentsService))
  app.use(authorisationMiddleware(['ROLE_MANAGE_SUPERVISIONS']))
  app.use(getUserAlertsCount(services.masApiClient))

  // Routes that use multer for multipart upload must be registered before csrf executes
  const router = Router()
  addContactRoutes(router, services)
  app.use(router)

  app.use(setUpCsrf())

  app.use((req, res, next) => next(createError(404, 'Not found')))
  app.use(errorHandler(process.env.NODE_ENV === 'production'))

  return app
}
