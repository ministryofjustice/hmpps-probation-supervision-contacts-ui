import { Request, Response, NextFunction } from 'express'
import { MulterError } from 'multer'
import { multerErrorHandler } from './multerErrorHandler'

jest.mock('multer', () => {
  const multerMock = jest.fn()
  const single = jest.fn()
  multerMock.mockReturnValue({ single })
  ;(multerMock as any).memoryStorage = jest.fn()
  ;(multerMock as any).MulterError = class MockMulterError extends Error {
    code: string

    field: string

    constructor(code: string, field: string) {
      super(code)
      this.code = code
      this.field = field
    }
  }
  return multerMock
})

const multer = jest.requireMock('multer')

describe('multerErrorHandler', () => {
  let req: Partial<Request>
  let res: Partial<Response>
  let next: NextFunction

  beforeEach(() => {
    req = {}
    res = { locals: {} } as any
    next = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('calls next when there is no error', () => {
    multer().single.mockImplementation(
      (_field: string) => (_req: Request, _res: Response, cb: (err?: Error) => void) => cb(),
    )

    const middleware = multerErrorHandler('file')
    middleware(req as Request, res as Response, next)

    expect(next).toHaveBeenCalled()
    expect(res.locals.errorMessages).toBeUndefined()
  })

  it('sets errorMessages for LIMIT_FILE_SIZE error', () => {
    const error = new MulterError('LIMIT_FILE_SIZE', 'file')
    multer().single.mockImplementation(
      (_field: string) => (_req: Request, _res: Response, cb: (err?: Error) => void) => cb(error),
    )

    const middleware = multerErrorHandler('file')
    middleware(req as Request, res as Response, next)

    expect(res.locals.errorMessages).toEqual({ file: 'File size must be 5mb or under' })
    expect(next).toHaveBeenCalled()
  })

  it('sets errorMessages for LIMIT_UNEXPECTED_FILE error', () => {
    const error = new MulterError('LIMIT_UNEXPECTED_FILE', 'file')
    multer().single.mockImplementation(
      (_field: string) => (_req: Request, _res: Response, cb: (err?: Error) => void) => cb(error),
    )

    const middleware = multerErrorHandler('file')
    middleware(req as Request, res as Response, next)

    expect(res.locals.errorMessages).toEqual({ file: 'Only PDF or Word files are allowed' })
    expect(next).toHaveBeenCalled()
  })

  it('uses the field name provided as the error key', () => {
    const error = new MulterError('LIMIT_FILE_SIZE', 'document')
    multer().single.mockImplementation(
      (_field: string) => (_req: Request, _res: Response, cb: (err?: Error) => void) => cb(error),
    )

    const middleware = multerErrorHandler('document')
    middleware(req as Request, res as Response, next)

    expect(res.locals.errorMessages).toEqual({ document: 'File size must be 5mb or under' })
  })

  it('calls next even when there is an error', () => {
    const error = new MulterError('LIMIT_FILE_SIZE', 'file')
    multer().single.mockImplementation(
      (_field: string) => (_req: Request, _res: Response, cb: (err?: Error) => void) => cb(error),
    )

    const middleware = multerErrorHandler('file')
    middleware(req as Request, res as Response, next)

    expect(next).toHaveBeenCalled()
  })
})
