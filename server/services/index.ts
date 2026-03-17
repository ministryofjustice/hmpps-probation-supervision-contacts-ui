import { dataAccess } from '../data'
import AuditService from './auditService'
import FlagService from './flagService'
import ProbationComponentsService from './ProbationComponentsService'

export const services = () => {
  const {
    applicationInfo,
    hmppsAuthClient,
    hmppsAuditClient,
    probationFrontendComponentsApiClient,
    masApiClient,
    arnsApiClient,
    tierApiClient,
  } = dataAccess()

  return {
    applicationInfo,
    hmppsAuthClient,
    auditService: new AuditService(hmppsAuditClient),
    flagService: new FlagService(),
    probationComponentsService: new ProbationComponentsService(probationFrontendComponentsApiClient),
    masApiClient,
    arnsApiClient,
    tierApiClient,
  }
}

export type Services = ReturnType<typeof services>
