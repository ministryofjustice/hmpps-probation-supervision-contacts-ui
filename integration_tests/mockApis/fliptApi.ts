import type { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'

export default {
  stubSnapshot: (): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/flipt/internal/v1/evaluation/snapshot/namespace/.+',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          namespace: { key: 'probation-supervision-contacts-ui', name: 'probation-supervision-contacts-ui' },
          flags: [],
        },
      },
    }),
}
