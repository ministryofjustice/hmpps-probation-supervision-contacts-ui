import httpMocks from 'node-mocks-http'
import addContactType from './addContactType'

const validBody = {
  sentence: '1',
  date: '17/5/2024',
  time: '09:00',
  sensitivity: 'Yes',
}

function createRes(locals: Record<string, unknown> = {}) {
  return { locals, render: jest.fn() } as unknown as any
}

describe('middleware/validation/addContactType', () => {
  let next: jest.Mock

  beforeEach(() => {
    next = jest.fn()
  })

  it('calls next when all required fields are valid', () => {
    const req = httpMocks.createRequest({
      params: { crn: 'X123456', contactType: 'add-police-liaison' },
      body: validBody,
    })
    const res = createRes()

    addContactType(req, res, next)

    expect(next).toHaveBeenCalledWith()
    expect(res.render).not.toHaveBeenCalled()
  })
  it('renders with errors when all required fields are  missing', () => {
    const req = httpMocks.createRequest({
      params: { crn: 'X123456', contactType: 'add-police-liaison' },
      body: { date: '', time: '', sensitivity: '' },
    })
    const res = createRes()

    addContactType(req, res, next)

    expect(next).not.toHaveBeenCalled()
    const renderData = (res.render as jest.Mock).mock.calls[0][1]
    expect(renderData.errorMessages).toEqual({
      sentence: 'Select what the contact is related to',
      date: 'Enter or select a date',
      time: 'Enter a time in the 24-hour format, for example 16:30',
      sensitivity: 'Select if the contact includes sensitive information',
    })
  })

  it('renders with errors when sentence is missing', () => {
    const req = httpMocks.createRequest({
      params: { crn: 'X123456', contactType: 'add-police-liaison' },
      body: { date: '17/5/2024', time: '09:00', sensitivity: 'Yes' },
    })
    const res = createRes()

    addContactType(req, res, next)

    expect(next).not.toHaveBeenCalled()
    const renderData = (res.render as jest.Mock).mock.calls[0][1]
    expect(renderData.errorMessages.sentence).toBeDefined()
  })

  it('renders with errors when date is missing', () => {
    const req = httpMocks.createRequest({
      params: { crn: 'X123456', contactType: 'add-police-liaison' },
      body: { sentence: '1', time: '09:00', sensitivity: 'Yes' },
    })
    const res = createRes()

    addContactType(req, res, next)

    expect(next).not.toHaveBeenCalled()
    const renderData = (res.render as jest.Mock).mock.calls[0][1]
    expect(renderData.errorMessages.date).toBeDefined()
    expect(renderData.contactTypeName).toBe('Police liaison')
  })

  it('renders with errors when time format is invalid', () => {
    const req = httpMocks.createRequest({
      params: { crn: 'X123456', contactType: 'add-police-liaison' },
      body: { sentence: '1', date: '17/5/2024', time: 'not-a-time', sensitivity: 'Yes' },
    })
    const res = createRes()

    addContactType(req, res, next)

    expect(next).not.toHaveBeenCalled()
    const renderData = (res.render as jest.Mock).mock.calls[0][1]
    expect(renderData.errorMessages.time).toBeDefined()
    expect(renderData.contactTypeName).toBe('Police liaison')
  })

  it('requires alertResponsibleOfficer when responsibleOfficer is SHOW_OFFICER', () => {
    const req = httpMocks.createRequest({
      params: { crn: 'X123456', contactType: 'add-police-liason' },
      body: { ...validBody, responsibleOfficer: 'SHOW_OFFICER' },
    })
    const res = createRes()

    addContactType(req, res, next)

    expect(next).not.toHaveBeenCalled()
    const renderData = (res.render as jest.Mock).mock.calls[0][1]
    expect(renderData.errorMessages.alertResponsibleOfficer).toBeDefined()
  })

  it('does not require alertResponsibleOfficer when responsibleOfficer is not SHOW_OFFICER', () => {
    const req = httpMocks.createRequest({
      params: { crn: 'X123456', contactType: 'add-police-liaison' },
      body: validBody,
    })
    const res = createRes()

    addContactType(req, res, next)

    expect(next).toHaveBeenCalledWith()
  })

  it('requires visor when isVisor is SHOW_VISOR', () => {
    const req = httpMocks.createRequest({
      params: { crn: 'X123456', contactType: 'add-police-liaison' },
      body: { ...validBody, isVisor: 'SHOW_VISOR' },
    })
    const res = createRes()

    addContactType(req, res, next)

    expect(next).not.toHaveBeenCalled()
    const renderData = (res.render as jest.Mock).mock.calls[0][1]
    expect(renderData.errorMessages.visor).toBeDefined()
  })

  it('renders with the crn and form values on error', () => {
    const body = { date: '17/5/2024', time: '09:00', sensitivity: 'Yes' }
    const req = httpMocks.createRequest({ params: { crn: 'X123456', contactType: 'add-police-liaison' }, body })
    const res = createRes()

    addContactType(req, res, next)

    const [view, renderData] = (res.render as jest.Mock).mock.calls[0]
    expect(view).toBe('pages/contacts/add-contact-type')
    expect(renderData.crn).toBe('X123456')
    expect(renderData.formValues).toEqual(body)
  })
})
