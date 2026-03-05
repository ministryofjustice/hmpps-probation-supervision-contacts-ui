import { dataAccess } from '../data'
import AuditService from './auditService'
import ExampleService from './exampleService'
import ProbationComponentsService from './ProbationComponentsService'

export const services = () => {
  const {
    applicationInfo,
    hmppsAuthClient,
    hmppsAuditClient,
    exampleApiClient,
    probationFrontendComponentsApiClient,
    masApiClient,
    arnsApiClient,
    tierApiClient,
  } = dataAccess()

  return {
    applicationInfo,
    hmppsAuthClient,
    auditService: new AuditService(hmppsAuditClient),
    exampleService: new ExampleService(exampleApiClient),
    probationComponentsService: new ProbationComponentsService(probationFrontendComponentsApiClient),
    masApiClient,
    arnsApiClient,
    tierApiClient,
  }
}

export type Services = ReturnType<typeof services>
