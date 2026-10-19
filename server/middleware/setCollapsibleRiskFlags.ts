import type { RequestHandler } from 'express'

export const setCollapsibleRiskFlags: RequestHandler = (_req, res, next) => {
  if (res.locals.flags?.enablePersonHeader === true) {
    res.locals.collapsibleRiskFlags = true
  }
  return next()
}
