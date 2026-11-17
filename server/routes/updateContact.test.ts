import express from 'express'
import addUpdateContactRoutes from './updateContact'
import { setCollapsibleRiskFlags } from '../middleware/setCollapsibleRiskFlags'

jest.mock('../middleware/validateCrnParam', () => jest.fn())
jest.mock('../middleware/isResponsibleOfficer', () => ({
  isResponsibleOfficerMiddleware: jest.fn().mockReturnValue(jest.fn()),
}))
jest.mock('../middleware/getSentences', () => ({
  getSentences: jest.fn().mockReturnValue(jest.fn()),
}))
jest.mock('../middleware/getPersonalDetails', () => ({
  getPersonalDetails: jest.fn().mockReturnValue(jest.fn()),
}))
jest.mock('../middleware/getPersonRiskFlags', () => ({
  getPersonRiskFlags: jest.fn().mockReturnValue(jest.fn()),
}))
jest.mock('../middleware/getTierDetailsV3', () => ({
  getTierDetails: jest.fn().mockReturnValue(jest.fn()),
}))
jest.mock('../middleware/getContact', () => ({
  getExistingContact: jest.fn().mockReturnValue(jest.fn()),
}))
jest.mock('../middleware/validation/updateContact', () => jest.fn())
jest.mock('../middleware/validation/multerErrorHandler', () => ({
  multerErrorHandler: jest.fn().mockReturnValue(jest.fn()),
}))
jest.mock('../controllers', () => ({
  __esModule: true,
  default: {
    updateContact: {
      getUpdateContact: jest.fn().mockReturnValue(jest.fn()),
      postupdateContact: jest.fn().mockReturnValue(jest.fn()),
    },
  },
}))

describe('addUpdateContactRoutes', () => {
  let getSpy: jest.SpyInstance
  let postSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    const router = express.Router()
    getSpy = jest.spyOn(router, 'get')
    postSpy = jest.spyOn(router, 'post')
    addUpdateContactRoutes(router, {} as any)
  })

  it('registers GET and POST /case/:crn/:contactId/update-contact', () => {
    expect(getSpy.mock.calls[0][0]).toBe('/case/:crn/:contactId/update-contact')
    expect(postSpy.mock.calls[0][0]).toBe('/case/:crn/:contactId/update-contact')
  })

  it('makes the person header risk flags collapsible on the update contact journey', () => {
    expect(getSpy.mock.calls[0]).toContain(setCollapsibleRiskFlags)
    expect(postSpy.mock.calls[0]).toContain(setCollapsibleRiskFlags)
  })
})
