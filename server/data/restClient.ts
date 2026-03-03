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
  handle404?: boolean
  handle500?: boolean
  handle401?: boolean
  errorMessage?: string
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
    handle404 = false,
    handle500 = false,
    handle401 = false,
    errorMessage = '',
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
    } catch (error: any) {
      if (handle500 && error?.response?.status === 500) {
        error.response.errors = [{ text: errorMessage }]
        logger.info('Handling 500')
        return error.response
      }
      if (handle404 && error?.response?.status === 404) {
        logger.info('Handling 404')
        return null
      }
      if (handle401 && error?.response?.status === 401) {
        logger.info('Handling 401s the same as 500s')
        error.response.errors = [{ text: errorMessage }]
        return error.response
      }
      logger.warn(`Error calling ${this.name}, path: '${path}', verb: 'GET'`)
      throw error
    }
  }
}
