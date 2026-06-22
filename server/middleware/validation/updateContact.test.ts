import httpMocks from 'node-mocks-http'
import updateContact from './updateContact'

const today = new Date()
const pad = (n: number) => String(n).padStart(2, '0')
const todayStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`
const tomorrowStr = `${today.getDate() + 1}/${today.getMonth() + 1}/${today.getFullYear()}`
const pastHour = `${pad(today.getHours() === 0 ? 23 : today.getHours() - 1)}:00`
const futureHour = `${pad(today.getHours() === 23 ? 0 : today.getHours() + 1)}:00`

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

  it('renders with error when date is in the future', () => {
    const req = httpMocks.createRequest({
      params: { crn: 'X123456', contactId: 'ABC123' },
      body: { ...validBody, date: tomorrowStr, time: '09:00' },
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
      body: { ...validBody, date: todayStr, time: futureHour },
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
      body: { ...validBody, date: todayStr, time: pastHour },
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
