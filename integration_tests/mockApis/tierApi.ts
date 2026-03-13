import type { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'

export default {
  stubPing: (httpStatus = 200): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/tier-api/health/ping',
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { status: httpStatus === 200 ? 'UP' : 'DOWN' },
      },
    }),

  stubGetCalculationDetails: (tierScore = 'A1'): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/tier-api/crn/.+/tier/details',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          tierScore,
          calculationId: 'abc123',
          calculationDate: '2024-01-01',
          data: {
            protect: { tier: 'A', points: 0, pointsBreakdown: {} },
            change: { tier: '1', points: 0, pointsBreakdown: {} },
            calculationVersion: '1',
          },
        },
      },
    }),
}
