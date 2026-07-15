/* eslint-disable import/first */
/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
import { AuthenticationClient, InMemoryTokenStore, RedisTokenStore } from '@ministryofjustice/hmpps-auth-clients'
import { ArnsComponents } from '@ministryofjustice/hmpps-arns-frontend-components-lib'
import ProbationFrontendComponentsApiClient from './probationFrontendComponentsClient'

import applicationInfoSupplier from '../applicationInfo'

const applicationInfo = applicationInfoSupplier()

import { createRedisClient } from './redisClient'
import config from '../config'
import logger from '../../logger'
import MasApiClient from './masApiClient'
import ArnsApiClient from './arnsApiClient'
import TierApiClient from './tierApiClient'

const authClientArns = new AuthenticationClient(
  config.apis.hmppsAuth,
  logger,
  config.redis.enabled ? new RedisTokenStore(createRedisClient()) : new InMemoryTokenStore(),
)

export const dataAccess = () => {
  const hmppsAuthClient = new AuthenticationClient(
    config.apis.hmppsAuth,
    logger,
    config.redis.enabled ? new RedisTokenStore(createRedisClient()) : new InMemoryTokenStore(),
  )

  return {
    applicationInfo,
    hmppsAuthClient,
    probationFrontendComponentsApiClient: new ProbationFrontendComponentsApiClient(),
    masApiClient: new MasApiClient(hmppsAuthClient),
    arnsApiClient: new ArnsApiClient(hmppsAuthClient),
    tierApiClient: new TierApiClient(hmppsAuthClient),
    arnsComponents: new ArnsComponents(authClientArns as any, config.apis.arnsApi, logger),
  }
}

export { AuthenticationClient, ProbationFrontendComponentsApiClient }
