import httpMocks from 'node-mocks-http'
import { populateContactTypes } from './populateContactTypes'

describe('populateContactTypes', () => {
  let next: jest.Mock

  beforeEach(() => {
    jest.resetAllMocks()
    next = jest.fn()
  })

  it('includes non person-level types if sentences exist', async () => {
    const req = httpMocks.createRequest()
    const res = httpMocks.createResponse({
      locals: { flags: { enableEarlyTermination20261103Squad3: true }, sentences: [{}] },
    })

    await populateContactTypes()(req, res, next)

    expect(res.locals.contactTypes.length).toEqual(11)
    expect(next).toHaveBeenCalledWith()
  })

  it('excludes non person-level types if no sentences exist', async () => {
    const req = httpMocks.createRequest()
    const res = httpMocks.createResponse({
      locals: { flags: { enableEarlyTermination20261103Squad3: true }, sentences: [] },
    })

    await populateContactTypes()(req, res, next)

    expect(res.locals.contactTypes.length).toEqual(10)
    expect(next).toHaveBeenCalledWith()
  })
})
