import { EvaluationRequest, EvaluationResponse, FliptEvaluationClient } from '@flipt-io/flipt-client'
import config from '../config'
import { FeatureFlags } from '../data/model/featureFlags'
import logger from '../../logger'

const responsesFor = (results: EvaluationResponse[], key: string) =>
  results.filter(r => r.booleanEvaluationResponse?.flagKey === key)

export default class FlagService {
  async getFlags(context: { email?: string }): Promise<FeatureFlags> {
    const namespace = 'probation-supervision-contacts-ui'
    const fliptEvaluationClient = await FliptEvaluationClient.init(namespace, {
      url: config.flipt.url,
      authentication: {
        clientToken: config.flipt.token,
      },
    })
    const flagList: string[] = []
    const featureFlags = new FeatureFlags()
    Object.keys(featureFlags).forEach(key => {
      if (Object.hasOwn(featureFlags, key)) {
        flagList.push(key)
      }
    })

    const buildRequest = (flag: string): EvaluationRequest => {
      return {
        flagKey: flag,
        entityId: context?.email ? context.email.toLowerCase() || 'anonymous' : flag,
        context: {
          ...(context?.email ? { email: context.email.toLowerCase() } : {}),
        },
      }
    }

    const requests: EvaluationRequest[] = flagList.flatMap(flag => {
      return [buildRequest(flag)]
    })

    const flags = fliptEvaluationClient.evaluateBatch(requests)

    flagList.forEach(f => {
      const matching = responsesFor(flags.responses, f)
      if (matching.length === 1) {
        featureFlags[f] = matching[0].booleanEvaluationResponse.enabled === true
      } else {
        logger.warn(`Expected exactly 1 response for flag ${f}, got ${matching.length} — defaulting to false`)
        featureFlags[f] = false
      }
    })
    return featureFlags
  }
}
