import { SentryConfig } from '../config'
import type { ProbationDeliveryUnit } from './ProbationDeliveryUnit'

export interface LocalsUser {
  userId?: string
  username?: string
  firstName?: string
  surname?: string
  email?: string
  enabled?: boolean
  roles?: string[]
  active?: boolean
  name?: string
  authSource: string
  uuid?: string
  displayName?: string
  token: string
  probationDeliveryUnits?: ProbationDeliveryUnit[]
}

interface Locals {
  user: LocalsUser
  sentry: SentryConfig
  version: string
}

export interface AppResponse extends Express.Response {
  locals: Locals
}
