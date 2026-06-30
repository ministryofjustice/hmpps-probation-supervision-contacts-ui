import httpMocks from 'node-mocks-http'
import updateContact from './updateContact'

// Fixed to noon on a mid-month day: avoids midnight/hour-0 and month-end edge cases
const FIXED_NOW = new Date('2024-06-15T12:00:00')

const validBody = {
  date: '17/5/2024',
  time: '09:00',
  sensitivity: 'Yes',
  alertResponsibleOfficer: 'yes',
}

function createRes(locals: Record<string, unknown> = {}) {
  return {
    locals: {
      contact: { appointment: { displayName: 'Police Liaison' } },
      ...locals,
    },
    render: jest.fn(),
  } as unknown as any
}

describe('middleware/validation/updateContact', () => {
  let next: jest.Mock

  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(FIXED_NOW)
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  beforeEach(() => {
    next = jest.fn()
  })

  it('calls next when required fields are valid', () => {
    const req = httpMocks.createRequest({
      params: { crn: 'X123456', contactId: 'ABC123' },
      body: validBody,
    })
    const res = createRes()

    updateContact(req, res, next)

    expect(next).toHaveBeenCalledWith()
    expect(res.render).not.toHaveBeenCalled()
  })

  it('renders with errors when required fields are missing', () => {
    const req = httpMocks.createRequest({
      params: { crn: 'X123456', contactId: 'ABC123' },
      body: { date: '', time: '', alertResponsibleOfficer: 'yes' },
    })
    const res = createRes()

    updateContact(req, res, next)

    expect(next).not.toHaveBeenCalled()
    const renderData = (res.render as jest.Mock).mock.calls[0][1]
    expect(renderData.errorMessages.date).toBeDefined()
    expect(renderData.errorMessages.time).toBeDefined()
  })

  it('preserves multer file upload errors and re-renders with form values', () => {
    const req = httpMocks.createRequest({
      params: { crn: 'X123456', contactId: 'ABC123' },
      body: {
        date: '01/01/2026',
        time: '09:30',
        details: 'details',
        alertResponsibleOfficer: 'Yes',
        sensitivity: 'No',
      },
    })
    const res = createRes()

    res.locals.errorMessages = { fileUpload: 'File size must be 5mb or under' }

    updateContact(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.render).toHaveBeenCalled()

    const renderData = (res.render as jest.Mock).mock.calls[0][1]

    expect(renderData.errorMessages.fileUpload).toBe('File size must be 5mb or under')

    expect(renderData.formValues.date).toBe('01/01/2026')
    expect(renderData.formValues.time).toBe('09:30')
    expect(renderData.formValues.details).toBe('details')
    expect(renderData.formValues.alertResponsibleOfficer).toBe('Yes')
  })

  it('renders with error when date is in the future', () => {
    const req = httpMocks.createRequest({
      params: { crn: 'X123456', contactId: 'ABC123' },
      body: { ...validBody, date: '16/6/2024', time: '09:00' },
    })
    const res = createRes()

    updateContact(req, res, next)

    expect(next).not.toHaveBeenCalled()
    const renderData = (res.render as jest.Mock).mock.calls[0][1]
    expect(renderData.errorMessages.date).toEqual('The date of the contact must be today or in the past')
  })

  it('renders with error when time is in the future for today', () => {
    const req = httpMocks.createRequest({
      params: { crn: 'X123456', contactId: 'ABC123' },
      body: { ...validBody, date: '15/6/2024', time: '13:00' },
    })
    const res = createRes()

    updateContact(req, res, next)

    expect(next).not.toHaveBeenCalled()
    const renderData = (res.render as jest.Mock).mock.calls[0][1]
    expect(renderData.errorMessages.time).toEqual('The time of the contact must be the current time or in the past')
  })

  it('calls next when date is today and time is in the past', () => {
    const req = httpMocks.createRequest({
      params: { crn: 'X123456', contactId: 'ABC123' },
      body: { ...validBody, date: '15/6/2024', time: '11:00' },
    })
    const res = createRes()

    updateContact(req, res, next)

    expect(next).toHaveBeenCalledWith()
    expect(res.render).not.toHaveBeenCalled()
  })

  it('renders with error when details exceed 12000 characters', () => {
    const longText = 'a'.repeat(12005)
    const req = httpMocks.createRequest({
      params: { crn: 'X123456', contactId: 'ABC123' },
      body: { ...validBody, details: longText },
    })
    const res = createRes()

    updateContact(req, res, next)

    expect(next).not.toHaveBeenCalled()
    const renderData = (res.render as jest.Mock).mock.calls[0][1]
    expect(renderData.errorMessages.details).toEqual('You have entered 5 characters too many')
  })

  it('does not error when \\r\\n newlines keep details within 12000 characters', () => {
    // Browser submits \r\n (2 chars) per newline; govuk counter counts each as 1.
    // 11999 'a' chars + 1 \r\n = 12000 by govuk count — should pass.
    const textWithNewline = `${'a'.repeat(11999)}\r\n`
    const req = httpMocks.createRequest({
      params: { crn: 'X123456', contactId: 'ABC123' },
      body: { ...validBody, details: textWithNewline },
    })
    const res = createRes()

    updateContact(req, res, next)

    expect(next).toHaveBeenCalledWith()
    expect(res.render).not.toHaveBeenCalled()
  })

  it('renders with error when \\r\\n newlines push details over 12000 characters', () => {
    // 12000 'a' chars + 1 \r\n = 12001 by govuk count — should fail.
    const textWithNewline = `${'a'.repeat(12000)}\r\n`
    const req = httpMocks.createRequest({
      params: { crn: 'X123456', contactId: 'ABC123' },
      body: { ...validBody, details: textWithNewline },
    })
    const res = createRes()

    updateContact(req, res, next)

    expect(next).not.toHaveBeenCalled()
    const renderData = (res.render as jest.Mock).mock.calls[0][1]
    expect(renderData.errorMessages.details).toEqual('You have entered 1 characters too many')
  })
})
