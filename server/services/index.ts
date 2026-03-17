import { dataAccess } from '../data'
import AuditService from './auditService'
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
    probationComponentsService: new ProbationComponentsService(probationFrontendComponentsApiClient),
    masApiClient,
    arnsApiClient,
    tierApiClient,
  }
}

export type Services = ReturnType<typeof services>
