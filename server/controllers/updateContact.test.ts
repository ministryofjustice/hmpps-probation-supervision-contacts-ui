import type { Request, Response } from 'express'
import MasApiClient from '../data/masApiClient'
import ContactService from '../services/contactService'
import updateContactController from './updateContact'
import sendAuditMessage, { AuditAction, SubjectType } from '../middleware/sendAuditMessage'
import config from '../config'

jest.mock('../services/contactService')
jest.mock('../middleware/sendAuditMessage')

const MockContactService = ContactService as jest.MockedClass<typeof ContactService>
const mockSendAuditMessage = sendAuditMessage as jest.Mock

function createRes(locals: Record<string, unknown> = {}): Response {
  return {
    locals: { user: { username: 'test-user' }, ...locals },
    render: jest.fn(),
    redirect: jest.fn(),
  } as unknown as Response
}

function createReq(overrides: Partial<Request> = {}): Request {
  return {
    params: {},
    body: {},
    query: {},
    session: { data: {} },
    get: jest.fn().mockReturnValue(''),
    ...overrides,
  } as unknown as Request
}

describe('getUpdateContact', () => {
  it('renders the update-contact page with the outcome contact data', async () => {
    const next = jest.fn()
    const req = createReq({
      params: { crn: 'X123456', contactId: 'ABC123' },
    })

    const res = createRes({
      contact: {
        appointment: {
          id: 'ABC123',
          displayName: 'Tes contact',
        },
      },
      csrfToken: 'token',
    })

    await updateContactController.getUpdateContact()(req, res, next)

    expect(res.render).toHaveBeenCalledWith(
      'pages/contacts/update-contact',
      expect.objectContaining({
        crn: 'X123456',
        contactId: 'ABC123',
        contact: res.locals.contact,
        isOutcome: true,
        csrfToken: 'token',
      }),
    )
  })

  it('renders the update-contact page with the  no outcome contact data', async () => {
    const next = jest.fn()
    const req = createReq({
      params: { crn: 'X123456', contactId: 'ABC123' },
    })

    const res = createRes({
      contact: {
        appointment: {
          id: 'ABC123',
          displayName: 'Information from person on probation',
        },
      },
      csrfToken: 'token',
    })

    await updateContactController.getUpdateContact()(req, res, next)

    expect(res.render).toHaveBeenCalledWith(
      'pages/contacts/update-contact',
      expect.objectContaining({
        crn: 'X123456',
        contactId: 'ABC123',
        contact: res.locals.contact,
        isOutcome: false,
        csrfToken: 'token',
      }),
    )
  })
})

describe('postupdateContact', () => {
  it('updates the contact and redirects to the contact card page', async () => {
    jest.resetAllMocks()

    const next = jest.fn()

    const mockMasApiClient: jest.Mocked<
      Pick<MasApiClient, 'getUserProviders' | 'getOverview' | 'getProbationPractitioner'>
    > = {
      getUserProviders: jest.fn().mockResolvedValue({
        defaultUserDetails: {
          staffCode: 'USER999',
          username: 'test-user',
          homeArea: 'N99',
          team: 'Team One',
        },
        teams: [{ description: 'Uset Team', code: 'N99' }],
      }),

      getOverview: jest.fn().mockResolvedValue({ registrations: [] }),

      getProbationPractitioner: jest.fn().mockResolvedValue({
        code: 'N01A001',
        name: { forename: 'jane', surname: 'doe' },
        provider: { code: 'N01', name: 'NPS North West' },
        team: { description: 'Team One', code: 'N01T01' },
        unallocated: false,
        username: 'PRACTITIONER1',
      }),
    }

    const mockUpdateContactWithNoOutcome = jest.fn().mockResolvedValue({})

    MockContactService.mockImplementation(
      () =>
        ({
          updateContactWithNoOutcome: mockUpdateContactWithNoOutcome,
        }) as any,
    )

    const req = createReq({
      params: {
        crn: 'X123456',
        contactId: 'X00001',
      },
      body: {
        date: '14/05/2026',
        time: '09:00',
        details: 'Updated notes',
        sensitivity: 'Yes',
      },
    })

    const res = createRes({
      user: {
        username: 'john.smith',
      },
      contact: {
        appointment: {
          displayName: 'Test contact',
        },
      },
    })

    await updateContactController.postupdateContact(mockMasApiClient as unknown as MasApiClient)(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith(
      `${config.manageProbationUrl}/case/X123456/activity/X00001?showSuccessBanner=true`,
    )
  })
})
