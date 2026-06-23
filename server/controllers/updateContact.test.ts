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
          displayName: 'Alcohol consumption',
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

  it('renders the update-contact page with the outcome contact data', async () => {
    const next = jest.fn()
    const req = createReq({
      params: { crn: 'X123456', contactId: 'ABC123' },
    })

    const res = createRes({
      contact: {
        appointment: {
          id: 'ABC123',
          displayName: 'Alcohol consumption',
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
        contactId: '00001',
      },
      body: {
        date: '14/05/2026',
        time: '09:00',
        details: 'Updated notes',
        sensitivity: 'Yes',
        alertResponsibleOfficer: 'Yes',
      },
    })

    const res = createRes({
      user: {
        username: 'john.smith',
      },
      contact: {
        appointment: {
          displayName: 'Case consultation',
          appointmentNotes: [
            {
              note: 'Existing note',
            },
          ],
        },
      },
    })

    await updateContactController.postupdateContact(mockMasApiClient as unknown as MasApiClient)(req, res, next)
    expect(mockUpdateContactWithNoOutcome).toHaveBeenCalledWith(
      '00001',
      expect.objectContaining({
        dateTime: expect.stringContaining('2026-05-14'),
        notes: 'Updated notes',
        sensitiveFlag: true,
        alert: true,
      }),
      'john.smith',
    )

    expect(res.redirect).toHaveBeenCalledWith(
      `${config.manageProbationUrl}/case/X123456/activity/00001?showSuccessBanner=true`,
    )
  })
  it('updates the outcome type contact and redirects to the contact card page', async () => {
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

    const mockUpdateContactWithOutcome = jest.fn().mockResolvedValue({})

    MockContactService.mockImplementation(
      () =>
        ({
          updateContactWithOutcome: mockUpdateContactWithOutcome,
        }) as any,
    )

    const req = createReq({
      params: {
        crn: 'X123456',
        contactId: '00002',
      },
      body: {
        date: '14/05/2026',
        time: '09:00',
        details: 'Updated notes',
        sensitivity: 'Yes',
        outcomeCode: 'SFG3',
        alertResponsibleOfficer: 'Yes',
      },
    })

    const res = createRes({
      user: {
        username: 'john.smith',
      },
      contact: {
        appointment: {
          displayName: 'Safeguarding enquiries requested',
          appointmentNotes: [
            {
              note: 'Existing note',
            },
          ],
        },
      },
    })

    await updateContactController.postupdateContact(mockMasApiClient as unknown as MasApiClient)(req, res, next)
    expect(mockUpdateContactWithOutcome).toHaveBeenCalledWith(
      '00002',
      {
        alert: true,
        date: '2026-05-14',
        enforcementActionCode: null,
        notes: 'Updated notes',
        outcomeCode: 'SFG3',
        sensitive: true,
        time: '09:00',
      },
      'john.smith',
    )

    expect(res.redirect).toHaveBeenCalledWith(
      `${config.manageProbationUrl}/case/X123456/activity/00002?showSuccessBanner=true`,
    )
  })
})
