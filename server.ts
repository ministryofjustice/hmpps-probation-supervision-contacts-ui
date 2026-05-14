// Require app insights before anything else to allow for instrumentation of bunyan and express
import 'applicationinsights'

import { app, metricsApp } from './server/index'
import logger from './logger'

const validatePort = (port: number) => {
  if (port >= 0 && port <= 65535) {
    return port
  }
  throw new Error(`Port number out of range ${port}`)
}

app.listen(app.get('port'), () => {
  logger.info(`Server listening on port ${app.get('port')}`)
})

const metricsPort = validatePort(metricsApp.get('port'))
metricsApp.listen(metricsPort, () => {
  logger.info(`Metrics server listening on port ${metricsPort}`)
})
