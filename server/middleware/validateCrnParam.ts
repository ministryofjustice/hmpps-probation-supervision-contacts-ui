import type { NextFunction, Request, Response } from 'express'
import createError from 'http-errors'
import { isValidCrn } from '../utils/isValidCrn'

export default function validateCrnParam(_req: Request, _res: Response, next: NextFunction, crn: string): void {
  if (!isValidCrn(crn)) {
    next(createError(404, 'Not found'))
    return
  }
  next()
}
