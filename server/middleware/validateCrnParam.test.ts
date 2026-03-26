import type { NextFunction, Request, Response } from 'express'
import validateCrnParam from './validateCrnParam'

function createMocks() {
  return {
    req: {} as Request,
    res: {} as Response,
    next: jest.fn() as jest.MockedFunction<NextFunction>,
  }
}

describe('validateCrnParam', () => {
  it('calls next with a 404 error when the CRN is invalid', () => {
    const { req, res, next } = createMocks()

    validateCrnParam(req, res, next, 'INVALID')

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 404 }))
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('calls next with a 404 error when the CRN is undefined', () => {
    const { req, res, next } = createMocks()

    validateCrnParam(req, res, next, undefined as unknown as string)

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 404 }))
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('calls next with no arguments when the CRN is valid', () => {
    const { req, res, next } = createMocks()

    validateCrnParam(req, res, next, 'X123456')

    expect(next).toHaveBeenCalledWith()
    expect(next).toHaveBeenCalledTimes(1)
  })
})
