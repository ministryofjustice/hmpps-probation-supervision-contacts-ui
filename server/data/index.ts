import { AuthenticationClient, InMemoryTokenStore, RedisTokenStore } from '@ministryofjustice/hmpps-auth-clients'
import { ArnsComponents } from '@ministryofjustice/hmpps-arns-frontend-components-lib'
import ProbationFrontendComponentsApiClient from './probationFrontendComponentsClient'
import applicationInfoSupplier from '../applicationInfo'
import { createRedisClient } from './redisClient'
import config from '../config'
import logger from '../../logger'
import MasApiClient from './masApiClient'
import TierApiClient from './tierApiClient'

const applicationInfo = applicationInfoSupplier()

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
    tierApiClient: new TierApiClient(hmppsAuthClient),
    arnsComponents: new ArnsComponents(authClientArns as any, config.apis.arnsApi, logger),
  }
}

export { AuthenticationClient, ProbationFrontendComponentsApiClient }
