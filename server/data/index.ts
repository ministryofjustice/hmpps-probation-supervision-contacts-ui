import { AuthenticationClient, InMemoryTokenStore, RedisTokenStore } from '@ministryofjustice/hmpps-auth-clients'
import { ArnsComponents } from '@ministryofjustice/hmpps-arns-frontend-components-lib'
import { MPoPComponents } from '@ministryofjustice/hmpps-mpop-frontend-components-lib'
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

  const authClientMpop = new AuthenticationClient(
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
    mpopComponents: new MPoPComponents(
      authClientMpop as any,
      { ...config.apis.tierApi, masApiConfig: config.apis.masApi, supervisionPackageApiConfig: config.apis.mpopApi },
      logger,
    ),
  }
}

export { AuthenticationClient, ProbationFrontendComponentsApiClient }
