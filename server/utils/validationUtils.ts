import { DateTime } from 'luxon'
import { ErrorCheck, Validateable, ValidationSpec } from '../models/Errors'

export const isNotEmpty = (args: any[]) => {
  return !!args[0] && args[0] !== undefined
}

export const isValidDate = (args: any[]) => {
  return !!args[0] && DateTime.fromFormat(args[0], 'd/M/yyyy').isValid
}

export const isValidDateFormat = (args: any[]): boolean => {
  const regex = /^[1-9]?\d\/[1-9]?\d\/\d{4}$/
  return regex.test(args[0])
}

export const timeIsValid24HourFormat = (args: any[]): boolean => {
  if (!args[1]) {
    return false
  }
  const timeStr = args[1]
  const regex = /^([01]\d|2[0-3]):[0-5]\d$/
  return regex.test(timeStr)
}

export function validateWithSpec<R extends Validateable>(request: R, validationSpec: ValidationSpec) {
  const errors: Record<string, string> = {}
  Object.entries(validationSpec).forEach(([fieldName, checks]) => {
    if (!request?.[fieldName] && checks.optional === true) {
      return
    }
    const hasProperty = Object.keys(request).includes(fieldName)
    if (hasProperty) {
      const error = executeValidator(checks.checks, fieldName, request)
      if (error) {
        errors[fieldName] = error
      }
    } else if (checks?.optional === false) {
      errors[fieldName] = checks.checks[0].msg
    }
  })
  return errors
}

function executeValidator(checks: ErrorCheck[], fieldName: string, request: Validateable) {
  for (const check of checks) {
    let args: any[] = [request[fieldName]]
    if (check?.crossField) {
      args = [request[check.crossField], request[fieldName]]
    }
    if (!check.validator(args)) {
      return check.msg
    }
  }
  return null
}
