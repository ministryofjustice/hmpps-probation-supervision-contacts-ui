import { Request, Response, NextFunction } from 'express'
import { MulterError } from 'multer'
import { fileFilter, multerErrorHandler } from './multerErrorHandler'

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

    expect(res.locals.errorMessages).toEqual({ file: 'Only PDF, Word or JPEG files are allowed' })
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

  it('should accept image/jpeg with a .jpeg extension', () => {
    const file = {
      mimetype: 'image/jpeg',
      originalname: 'image.jpeg',
      fieldname: 'file',
    } as Express.Multer.File

    const cb = jest.fn()

    fileFilter(req as Request, file, cb)

    expect(cb).toHaveBeenCalledWith(null, true)
  })

  it('should reject image/jpeg with a mismatched extension', () => {
    const file = {
      mimetype: 'image/jpeg',
      originalname: 'image.pdf',
      fieldname: 'file',
    } as Express.Multer.File

    const cb = jest.fn()

    fileFilter(req as Request, file, cb)

    expect(cb).toHaveBeenCalledWith(expect.any(MulterError))
    expect(cb.mock.calls[0][0]).toMatchObject({ code: 'LIMIT_UNEXPECTED_FILE', field: 'file' })
  })

  it('should reject an unsupported MIME type and image type', () => {
    const file = {
      mimetype: 'image/png',
      originalname: 'image.png',
      fieldname: 'file',
    } as Express.Multer.File

    const cb = jest.fn()

    fileFilter(req as Request, file, cb)

    expect(cb).toHaveBeenCalledWith(expect.any(MulterError))
    expect(cb.mock.calls[0][0]).toMatchObject({ code: 'LIMIT_UNEXPECTED_FILE', field: 'file' })
  })
})
