import superagent from 'superagent'
import logger from '../../logger'

interface ApiConfig {
  url: string
  timeout: {
    response: number
    deadline: number
  }
}

interface Request {
  path: string
  query?: object | string
  headers?: Record<string, string>
  responseType?: string
  raw?: boolean
}

export default class RestClient {
  constructor(
    private readonly name: string,
    private readonly config: ApiConfig,
    private readonly token: string,
  ) {}

  async get<TResponse = unknown>({
    path,
    query = {},
    headers = {},
    responseType = '',
    raw = false,
  }: Request): Promise<TResponse> {
    logger.info(`${this.name} GET: ${path}`)

    try {
      const result = await superagent
        .get(`${this.config.url}${path}`)
        .query(query)
        .retry(2, (err, _) => {
          if (err) logger.info(`Retry handler found ${this.name} API error with ${err.code} ${err.message}`)
          return undefined
        })
        .auth(this.token, { type: 'bearer' })
        .set(headers)
        .responseType(responseType)
        .timeout(this.config.timeout)

      return raw ? (result as TResponse) : result.body
    } catch (error) {
      logger.warn(`Error calling ${this.name}, path: '${path}', verb: 'GET'`)
      throw error
    }
  }
}
