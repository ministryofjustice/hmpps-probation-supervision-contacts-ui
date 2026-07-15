import promClient from 'prom-client'
import { buildAppInsightsClient } from './utils/azureAppInsights'
import applicationInfoSupplier from './applicationInfo'

import { createMetricsApp } from './monitoring/metricsApp'
import createApp from './app'
import { services } from './services'

const applicationInfo = applicationInfoSupplier()
buildAppInsightsClient(applicationInfo)

promClient.collectDefaultMetrics()
const app = createApp(services())
const metricsApp = createMetricsApp()

export { app, metricsApp }
