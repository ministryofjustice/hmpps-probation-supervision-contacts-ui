/* eslint-disable import/first */
/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
import { AuthenticationClient, InMemoryTokenStore, RedisTokenStore } from '@ministryofjustice/hmpps-auth-clients'
import { initialiseAppInsights, buildAppInsightsClient } from '../utils/azureAppInsights'
import applicationInfoSupplier from '../applicationInfo'

const applicationInfo = applicationInfoSupplier()
initialiseAppInsights()
buildAppInsightsClient(applicationInfo)

import { createRedisClient } from './redisClient'
import config from '../config'
import HmppsAuditClient from './hmppsAuditClient'
import logger from '../../logger'
import ProbationFrontendComponentsApiClient from './probationFrontendComponentsClient'
import MasApiClient from './masApiClient'
import ArnsApiClient from './arnsApiClient'
import TierApiClient from './tierApiClient'

export const dataAccess = () => {
  const hmppsAuthClient = new AuthenticationClient(
    config.apis.hmppsAuth,
    logger,
    config.redis.enabled ? new RedisTokenStore(createRedisClient()) : new InMemoryTokenStore(),
  )

  return {
    applicationInfo,
    hmppsAuthClient,
    hmppsAuditClient: new HmppsAuditClient(config.sqs.audit),
    probationFrontendComponentsApiClient: new ProbationFrontendComponentsApiClient(),
    masApiClient: new MasApiClient(hmppsAuthClient),
    arnsApiClient: new ArnsApiClient(hmppsAuthClient),
    tierApiClient: new TierApiClient(hmppsAuthClient),
  }
}

export { AuthenticationClient, HmppsAuditClient, ProbationFrontendComponentsApiClient }
