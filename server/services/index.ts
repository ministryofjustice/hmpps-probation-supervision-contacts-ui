import { dataAccess } from '../data'
import FlagService from './flagService'
import ProbationComponentsService from './ProbationComponentsService'

export const services = () => {
  const {
    applicationInfo,
    hmppsAuthClient,
    probationFrontendComponentsApiClient,
    masApiClient,
    tierApiClient,
    arnsComponents,
  } = dataAccess()

  return {
    applicationInfo,
    hmppsAuthClient,
    flagService: new FlagService(),
    probationComponentsService: new ProbationComponentsService(probationFrontendComponentsApiClient),
    masApiClient,
    tierApiClient,
    arnsComponents,
  }
}

export type Services = ReturnType<typeof services>
