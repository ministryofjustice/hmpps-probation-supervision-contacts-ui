import config from '../config'
import RestClient from './restClient'

interface UserAlerts {
  content: unknown[]
  totalResults: number
  totalPages: number
  page: number
  size: number
}

export default class MasApiClient extends RestClient {
  constructor(token: string) {
    super('Manage a Supervision API', config.apis.masApi, token)
  }

  async getUserAlertsCount(): Promise<number> {
    const response: UserAlerts = await this.get({ path: `/alerts` })
    return response.totalResults
  }
}
