import { dataAccess } from '../data'
import FlagService from './flagService'
import ProbationComponentsService from './ProbationComponentsService'

export const services = () => {
  const {
    applicationInfo,
    hmppsAuthClient,
    probationFrontendComponentsApiClient,
    masApiClient,
    arnsApiClient,
    tierApiClient,
    arnsComponents,
  } = dataAccess()

  return {
    applicationInfo,
    hmppsAuthClient,
    flagService: new FlagService(),
    probationComponentsService: new ProbationComponentsService(probationFrontendComponentsApiClient),
    masApiClient,
    arnsApiClient,
    tierApiClient,
    arnsComponents,
  }
}

export type Services = ReturnType<typeof services>
