import * as Sentry from '@sentry/node'
import config from './config'

if (config.sentry.dsn) {
  Sentry.init({
    dsn: config.sentry.dsn,
    environment: config.env,
    tracesSampleRate: config.sentry.tracesSampleRate,
    integrations: [
      Sentry.expressIntegration({
        shouldHandleError(error) {
          const status = Number(error.status ?? error.statusCode ?? 500)
          // Capture 401/403 in addition to the default 5xx errors
          return status === 401 || status === 403 || status >= 500
        },
      }),
    ],
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: false,
      httpBodies: [],
      urlQueryParams: false,
      stackFrameVariables: false,
    },
    beforeSend(event) {
      if (!event.request) {
        return event
      }

      return {
        ...event,
        request: {
          ...event.request,
          data: undefined, // removes POST body
        },
      }
    },
  })
}
