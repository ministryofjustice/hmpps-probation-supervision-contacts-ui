import express from 'express'
import addContactRoutes from './addContact'
import validateCrnParam from '../middleware/validateCrnParam'

jest.mock('../middleware/validateCrnParam', () => jest.fn())
jest.mock('../middleware/populateContactTypes', () => ({
  populateContactTypes: jest.fn().mockReturnValue(jest.fn()),
}))
jest.mock('../middleware/isResponsibleOfficer', () => ({
  isResponsibleOfficerMiddleware: jest.fn().mockReturnValue(jest.fn()),
}))
jest.mock('../middleware/getSentences', () => ({
  getSentences: jest.fn().mockReturnValue(jest.fn()),
}))
jest.mock('../middleware/getPersonalDetails', () => ({
  getPersonalDetails: jest.fn().mockReturnValue(jest.fn()),
}))
jest.mock('../middleware/validation/addContactType', () => jest.fn())
jest.mock('../middleware/validation/addFrequentlyUsedContact', () => jest.fn())
jest.mock('../middleware/validation/multerErrorHandler', () => ({
  multerErrorHandler: jest.fn().mockReturnValue(jest.fn()),
}))
jest.mock('../controllers', () => ({
  __esModule: true,
  default: {
    addContact: {
      getFrequentlyUsedContact: jest.fn().mockReturnValue(jest.fn()),
      postFrequentlyUsedContact: jest.fn().mockReturnValue(jest.fn()),
      getSearchByCategory: jest.fn().mockReturnValue(jest.fn()),
      getAddContactType: jest.fn().mockReturnValue(jest.fn()),
      postAddContactType: jest.fn().mockReturnValue(jest.fn()),
    },
  },
}))

const mockServices = {
  masApiClient: {} as any,
  arnsApiClient: {} as any,
  tierApiClient: {} as any,
}

describe('addContactRoutes', () => {
  let router: express.Router
  let getSpy: jest.SpyInstance
  let postSpy: jest.SpyInstance
  let paramSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    router = express.Router()
    getSpy = jest.spyOn(router, 'get')
    postSpy = jest.spyOn(router, 'post')
    paramSpy = jest.spyOn(router, 'param')
    addContactRoutes(router, mockServices as any)
  })

  it('registers GET /case/:crn/add-frequently-used-contact', () => {
    expect(getSpy.mock.calls[0][0]).toBe('/case/:crn/add-frequently-used-contact')
  })

  it('registers POST /case/:crn/add-frequently-used-contact', () => {
    expect(postSpy.mock.calls[0][0]).toBe('/case/:crn/add-frequently-used-contact')
  })

  it('registers GET /case/:crn/add-frequently-used-contact/search-by-category', () => {
    expect(getSpy.mock.calls[1][0]).toBe('/case/:crn/add-frequently-used-contact/search-by-category')
  })

  it('registers GET /case/:crn/contacts/add-:contactType', () => {
    expect(getSpy.mock.calls[2][0]).toBe('/case/:crn/contacts/add-:contactType')
  })

  it('registers POST /case/:crn/contacts/add-:contactType', () => {
    expect(postSpy.mock.calls[1][0]).toBe('/case/:crn/contacts/add-:contactType')
  })

  it('registers exactly 2 GET routes and 3 POST routes', () => {
    expect(getSpy).toHaveBeenCalledTimes(3)
    expect(postSpy).toHaveBeenCalledTimes(2)
  })

  it('registers validateCrnParam for the crn route parameter', () => {
    expect(paramSpy).toHaveBeenCalledWith('crn', validateCrnParam)
  })
})
