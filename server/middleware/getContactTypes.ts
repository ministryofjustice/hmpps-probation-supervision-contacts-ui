import type { RequestHandler } from 'express'
import MasApiClient from '../data/masApiClient'
import { ContactType } from '../data/model/contacts'
import { ContactTypeFullDetail, ContactTypeInfo } from '../data/model/contactInfo'

export const getContactTypes = (masApiClient: MasApiClient): RequestHandler => {
  return async (req, res, next) => {
    const response = res.locals.flags?.enableCheckOutcomes20261124Squad3
      ? await masApiClient.getAllContactTypes(res.locals.user.username)
      : undefined
    const apiTypes: ContactType[] = response?.contactTypes
    const localData = ContactTypeInfo(res.locals.flags)
    const checkedTypes = apiTypes?.map(entry => (localData[entry.code] ?? entry) as ContactTypeFullDetail)
    res.locals.contactTypes = checkedTypes
    return next()
  }
}
