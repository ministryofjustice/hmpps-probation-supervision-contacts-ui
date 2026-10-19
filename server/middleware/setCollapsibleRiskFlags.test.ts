import httpMocks from 'node-mocks-http'
import { setCollapsibleRiskFlags } from './setCollapsibleRiskFlags'

const nextSpy = jest.fn()

describe('/middleware/setCollapsibleRiskFlags', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('sets collapsibleRiskFlags to true when enablePersonHeader is enabled', () => {
    const req = httpMocks.createRequest()
    const res = httpMocks.createResponse({ locals: { flags: { enablePersonHeader: true } } })
    setCollapsibleRiskFlags(req, res, nextSpy)
    expect(res.locals.collapsibleRiskFlags).toBe(true)
    expect(nextSpy).toHaveBeenCalled()
  })

  it('does not set collapsibleRiskFlags when enablePersonHeader is disabled', () => {
    const req = httpMocks.createRequest()
    const res = httpMocks.createResponse({ locals: { flags: { enablePersonHeader: false } } })
    setCollapsibleRiskFlags(req, res, nextSpy)
    expect(res.locals.collapsibleRiskFlags).toBeUndefined()
    expect(nextSpy).toHaveBeenCalled()
  })

  it('does not set collapsibleRiskFlags when flags are not available', () => {
    const req = httpMocks.createRequest()
    const res = httpMocks.createResponse()
    setCollapsibleRiskFlags(req, res, nextSpy)
    expect(res.locals.collapsibleRiskFlags).toBeUndefined()
    expect(nextSpy).toHaveBeenCalled()
  })
})
