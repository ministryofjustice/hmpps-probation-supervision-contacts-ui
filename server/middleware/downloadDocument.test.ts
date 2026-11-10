import httpMocks from 'node-mocks-http'
import { Response } from 'express'
import fs from 'fs'
import MasApiClient from '../data/masApiClient'
import { downloadDocument } from './downloadDocument'

describe('downloadDocument', () => {
  let next: jest.Mock
  let mockMasApiClient: jest.Mocked<Pick<MasApiClient, 'getDocument'>>

  const res = {
    locals: {
      user: {
        username: 'user-1',
      },
      flags: {},
    },
    render: jest.fn().mockReturnThis(),
    redirect: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
  } as unknown as Response

  const base64File = fs.readFileSync('wiremock/__files/template.dotx')

  beforeEach(() => {
    jest.resetAllMocks()
    next = jest.fn()
    mockMasApiClient = {
      getDocument: jest.fn().mockResolvedValue({
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
          'Content-Disposition': 'attachment; filename="template.dotx"',
        },
        body: base64File,
      }),
    }
  })

  const statusSpy = jest.spyOn(res, 'status')
  const sendSpy = jest.spyOn(res, 'send')

  it('error if early termination flag is not set to true', async () => {
    const req = httpMocks.createRequest({
      params: { contactType: 'ETRP', name: 'templates' },
    })

    await downloadDocument(mockMasApiClient as unknown as MasApiClient)(req, res, next)

    expect(statusSpy).toHaveBeenCalledWith(404)
  })

  it('fetches document from API and downloads it', async () => {
    const req = httpMocks.createRequest({
      params: { contactType: 'ETRP', name: 'templates' },
    })
    res.locals.user = { username: 'test-user' } as any
    res.locals.flags = { enableEarlyTermination20261103Squad3: true }

    await downloadDocument(mockMasApiClient as unknown as MasApiClient)(req, res, next)

    expect(mockMasApiClient.getDocument).toHaveBeenCalledWith('ETRP', 'templates', 'test-user')
    expect(sendSpy).toHaveBeenCalled()
  })
})
