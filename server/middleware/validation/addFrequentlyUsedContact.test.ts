import httpMocks from 'node-mocks-http'
import addFrequentlyUsedContact from './addFrequentlyUsedContact'
import config from '../../config'

function createRes(locals: Record<string, any> = {}): httpMocks.MockResponse<any> {
  return { locals, render: jest.fn() }
}

describe('middleware/validation/addFrequentlyUsedContact', () => {
  let next: jest.Mock

  beforeEach(() => {
    next = jest.fn()
  })

  it('calls next when contactType is provided', () => {
    const req = httpMocks.createRequest({ params: { crn: 'X123456' }, body: { contactType: 'CM3A' } })
    const res = createRes()

    addFrequentlyUsedContact(req, res, next)

    expect(next).toHaveBeenCalledWith()
    expect(res.render).not.toHaveBeenCalled()
  })

  it('renders with errors when contactType is missing', () => {
    const req = httpMocks.createRequest({ params: { crn: 'X123456' }, body: {} })
    const res = createRes({ radioItems: [] })

    addFrequentlyUsedContact(req, res, next)

    expect(next).not.toHaveBeenCalled()
    const [view, renderData] = (res.render as jest.Mock).mock.calls[0]
    expect(view).toBe('pages/contacts/add-frequently-used-contact')
    expect(renderData.errorMessages.contactType).toBe('Select a contact')
  })

  it('includes crn and formValues in the error render', () => {
    const body = { someOtherField: 'value' }
    const req = httpMocks.createRequest({ params: { crn: 'X123456' }, body })
    const res = createRes()

    addFrequentlyUsedContact(req, res, next)

    const renderData = (res.render as jest.Mock).mock.calls[0][1]
    expect(renderData.crn).toBe('X123456')
    expect(renderData.formValues).toEqual(body)
  })

  it('includes radioItems from res.locals in the error render', () => {
    const radioItems = [{ value: 'CM3A', text: 'Some contact' }]
    const req = httpMocks.createRequest({ params: { crn: 'X123456' }, body: {} })
    const res = createRes({ radioItems })

    addFrequentlyUsedContact(req, res, next)

    const renderData = (res.render as jest.Mock).mock.calls[0][1]
    expect(renderData.radioItems).toEqual(radioItems)
  })

  it('renders the absolute activity log redirect url for the NDelius flow', () => {
    const req = httpMocks.createRequest({
      params: { crn: 'X123456' },
      body: {},
    })

    const res = createRes()

    addFrequentlyUsedContact(req, res, next)

    const renderData = (res.render as jest.Mock).mock.calls[0][1]

    expect(renderData.contactLogUrl).toBe(`${config.manageProbationUrl}/case/X123456/activity-log`)
  })
})
