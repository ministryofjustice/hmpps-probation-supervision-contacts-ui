import { RestClient } from '@ministryofjustice/hmpps-rest-client'
import type { AuthOptions } from '@ministryofjustice/hmpps-rest-client'
import * as Sentry from '@sentry/node'

type ClientRequest = Parameters<RestClient['get']>[0]
type ClientRequestWithBody = Parameters<RestClient['post']>[0]
type HandlerError = Parameters<NonNullable<ClientRequest['errorHandler']>>[2]

export interface ErrorHandlingFlags {
  /** 401 returns `{ errors: [{ text: errorMessage }] }` */
  handle401?: boolean
  /** 403 is reported to Sentry and returns null */
  handle403?: boolean
  /** 404 returns null */
  handle404?: boolean
  /** 415 returns `{ errors: [{ text: errorMessage }] }` */
  handle415?: boolean
  /** 500 returns `{ errors: [{ text: errorMessage }] }` */
  handle500?: boolean
  /** Any 5xx returns `{ errors: [{ text: errorMessage }] }` */
  handle5xxRange?: boolean
  /** Timeouts are reported to Sentry and return `{ timeoutError: [...] }` */
  handleTimeout?: boolean
  /** Message shown to the user for the statuses returning `errors` */
  errorMessage?: string
}

const TIMEOUT_CODES = new Set(['ECONNABORTED', 'ETIMEDOUT', 'ESOCKETTIMEDOUT'])

const isTimeoutError = (error: HandlerError): boolean => !!error.code && TIMEOUT_CODES.has(error.code)

export default class BaseRestClient extends RestClient {
  private reportToSentry(kind: string, path: string, error: Error) {
    if (Sentry.getClient()) {
      Sentry.captureException(error, { tags: { 'error.kind': kind, 'request.path': path, 'api.name': this.name } })
    }
  }

  // Strips the handleXxx flags from the request and folds them into a single errorHandler
  private applyFlags<T extends ErrorHandlingFlags & { errorHandler?: unknown }>(request: T) {
    const {
      handle401,
      handle403,
      handle404,
      handle415,
      handle500,
      handle5xxRange,
      handleTimeout,
      errorMessage = '',
      errorHandler,
      ...rest
    } = request
    const anyFlag = [handle401, handle403, handle404, handle415, handle500, handle5xxRange, handleTimeout].some(Boolean)
    if (!anyFlag) return { ...rest, errorHandler } as unknown as Omit<T, keyof ErrorHandlingFlags>

    const fallback = (errorHandler as ClientRequest['errorHandler']) ?? this.handleError.bind(this)

    const handler = (path: string, method: string, error: HandlerError): unknown => {
      const status = error.responseStatus

      if (handleTimeout && isTimeoutError(error)) {
        this.reportToSentry('timeout', path, error)
        return { timeoutError: [{ text: 'Some information on this page is currently unavailable.' }] }
      }
      if (handle404 && status === 404) return null
      if (handle403 && status === 403) {
        this.reportToSentry('403', path, error)
        return null
      }
      if (
        (handle401 && status === 401) ||
        (handle415 && status === 415) ||
        (handle500 && status === 500) ||
        (handle5xxRange && status >= 500 && status <= 599)
      ) {
        this.logger.info(`Handling ${status} from ${this.name} ${method} ${path}`)
        return { errors: [{ text: errorMessage }] }
      }
      return fallback(path, method, error)
    }
    return { ...rest, errorHandler: handler } as unknown as Omit<T, keyof ErrorHandlingFlags>
  }

  override async get<Response = unknown, ErrorData = unknown>(
    request: ClientRequest & ErrorHandlingFlags,
    authOptions?: AuthOptions | string,
  ): Promise<Response> {
    return super.get<Response, ErrorData>(this.applyFlags(request) as never, authOptions)
  }

  override async post<Response = unknown, ErrorData = unknown>(
    request: ClientRequestWithBody & ErrorHandlingFlags,
    authOptions?: AuthOptions | string,
  ): Promise<Response> {
    return super.post<Response, ErrorData>(this.applyFlags(request) as never, authOptions)
  }

  override async put<Response = unknown, ErrorData = unknown>(
    request: ClientRequestWithBody & ErrorHandlingFlags,
    authOptions?: AuthOptions | string,
  ): Promise<Response> {
    return super.put<Response, ErrorData>(this.applyFlags(request) as never, authOptions)
  }

  override async patch<Response = unknown, ErrorData = unknown>(
    request: ClientRequestWithBody & ErrorHandlingFlags,
    authOptions?: AuthOptions | string,
  ): Promise<Response> {
    return super.patch<Response, ErrorData>(this.applyFlags(request) as never, authOptions)
  }

  override async delete<Response = unknown, ErrorData = unknown>(
    request: ClientRequest & ErrorHandlingFlags,
    authOptions?: AuthOptions | string,
  ): Promise<Response> {
    return super.delete<Response, ErrorData>(this.applyFlags(request) as never, authOptions)
  }
}
