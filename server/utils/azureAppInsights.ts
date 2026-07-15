import {
  defaultClient,
  DistributedTracingModes,
  getCorrelationContext,
  setup,
  type TelemetryClient,
} from 'applicationinsights'
import { RequestHandler } from 'express'
import type { ApplicationInfo } from '../applicationInfo'
import applicationInfo from '../applicationInfo'

const requestPrefixesToIgnore = ['GET /assets/', 'GET /health', 'GET /ping', 'GET /info']
const dependencyPrefixesToIgnore = ['sqs']

let processorsRegistered = false

export function defaultName(): string {
  const { applicationName: name } = applicationInfo()
  return name
}

export function initialiseAppInsights(): void {
  if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
    // eslint-disable-next-line no-console
    console.log('Enabling azure application insights')

    setup().setDistributedTracingMode(DistributedTracingModes.AI_AND_W3C).start()
  }
}

export function buildAppInsightsClient(
  { applicationName, buildNumber }: ApplicationInfo,
  overrideName?: string,
): TelemetryClient {
  if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
    defaultClient.context.tags['ai.cloud.role'] = overrideName || applicationName
    defaultClient.context.tags['ai.application.ver'] = buildNumber

    if (!processorsRegistered) {
      defaultClient.addTelemetryProcessor(({ tags, data }, contextObjects) => {
        const operationNameOverride = contextObjects.correlationContext?.customProperties?.getProperty('operationName')
        if (operationNameOverride) {
          /* eslint-disable no-param-reassign */
          tags['ai.operation.name'] = operationNameOverride
          data.baseData.name = operationNameOverride
          /* eslint-enable no-param-reassign */
        }
        return true
      })
      defaultClient.addTelemetryProcessor(ignoredRequestsProcessor)
      defaultClient.addTelemetryProcessor(ignoredDependenciesProcessor)
      processorsRegistered = true
    }
    return defaultClient
  }
  return null
}

export function ignoredRequestsProcessor(envelope: any) {
  const telemetryItem = envelope.data.baseData
  return !(
    telemetryItem?.success &&
    telemetryItem.name &&
    requestPrefixesToIgnore.some(prefix => telemetryItem.name.startsWith(prefix))
  )
}

export function ignoredDependenciesProcessor(envelope: any) {
  const telemetryItem = envelope.data.baseData
  return !(
    telemetryItem?.success &&
    telemetryItem.target &&
    dependencyPrefixesToIgnore.some(prefix => telemetryItem.target.startsWith(prefix))
  )
}

export function appInsightsMiddleware(): RequestHandler {
  return (req, res, next) => {
    res.prependOnceListener('finish', () => {
      const context = getCorrelationContext()
      if (context && req.route) {
        const path = req.route?.path
        const pathToReport = Array.isArray(path) ? `"${path.join('" | "')}"` : path
        context.customProperties.setProperty('operationName', `${req.method} ${pathToReport}`)
      }
    })
    next()
  }
}
