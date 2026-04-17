import type { Request, Response } from 'express'
import MasApiClient from '../data/masApiClient'
import ContactService from '../services/contactService'
import addContactController from './addContact'
import sendAuditMessage, { AuditAction, SubjectType } from '../middleware/sendAuditMessage'

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

describe('addContactController', () => {
  let mockMasApiClient: jest.Mocked<Pick<MasApiClient, 'getUserProviders' | 'getOverview'>>
  let mockCreateContact: jest.Mock
  let mockPatchDocuments: jest.Mock
  let next: jest.Mock

  beforeEach(() => {
    jest.resetAllMocks()
    next = jest.fn()
    mockMasApiClient = {
      getUserProviders: jest.fn().mockResolvedValue({
        defaultUserDetails: { staffCode: 'N01A001', username: 'test-user', homeArea: 'N01', team: 'Team One' },
        teams: [{ description: 'Team One', code: 'N01T01' }],
      }),
      getOverview: jest.fn().mockResolvedValue({ registrations: [] }),
    }
    mockCreateContact = jest.fn().mockResolvedValue({ id: 1 })
    mockPatchDocuments = jest.fn().mockResolvedValue(undefined)
    MockContactService.mockImplementation(
      () => ({ createContact: mockCreateContact, patchDocuments: mockPatchDocuments }) as any,
    )
  })

  describe('getFrequentlyUsedContact', () => {
    it('renders the add-frequently-used-contact page with correct locals', async () => {
      const req = createReq({ params: { crn: 'X123456' } })
      const res = createRes({ radioItems: [{ value: 'CM3A', text: 'Some contact' }], csrfToken: 'token' })

      await addContactController.getFrequentlyUsedContact()(req, res, next)

      expect(mockSendAuditMessage).toHaveBeenCalledWith(
        res,
        AuditAction.VIEW_ADD_FREQUENTLY_USED_CONTACT,
        'X123456',
        SubjectType.CRN,
      )
      expect(res.render).toHaveBeenCalledWith(
        'pages/contacts/add-frequently-used-contact',
        expect.objectContaining({
          crn: 'X123456',
          radioItems: res.locals.radioItems,
          csrfToken: 'token',
        }),
      )
    })

    it('includes contactLogUrl and ndeliusDeepLinkUrl', async () => {
      const req = createReq({ params: { crn: 'X123456' } })
      const res = createRes()

      await addContactController.getFrequentlyUsedContact()(req, res, next)

      const renderArgs = (res.render as jest.Mock).mock.calls[0][1]
      expect(renderArgs.contactLogUrl).toContain('X123456')
      expect(renderArgs.ndeliusDeepLinkUrl).toContain('X123456')
    })

    it('keeps selected contactType when returning from step 2 via query param', async () => {
      const req = createReq({
        params: { crn: 'X123456' },
        query: { from: 'step2' },
        session: {
          data: {
            contactType: {
              X123456: 'CM3A',
            },
          },
        } as any,
      })

      const res = createRes({
        radioItems: [{ value: 'CM3A' }, { value: 'CM1' }],
        contactTypes: [],
      })

      await addContactController.getFrequentlyUsedContact()(req, res, next)

      expect((req.session as any).data.contactType.X123456).toBe('CM3A')
    })

    it('keeps selected contactType when returning from step 2 via referer', async () => {
      const req = createReq({
        params: { crn: 'X123456' },
        session: {
          data: {
            contactType: {
              X123456: 'CM3A',
            },
          },
        } as any,
      })

      ;(req.get as jest.Mock).mockReturnValue('/case/X123456/contacts/add-email-or-text-from-other')

      const res = createRes({
        radioItems: [{ value: 'CM3A' }, { value: 'CM1' }],
        contactTypes: [],
      })

      await addContactController.getFrequentlyUsedContact()(req, res, next)

      expect((req.session as any).data.contactType.X123456).toBe('CM3A')
    })

    it('clears selected contactType when not returning from step 2', async () => {
      const req = createReq({
        params: { crn: 'X123456' },
        session: {
          data: {
            contactType: {
              X123456: 'CM3A',
            },
          },
        } as any,
      })

      ;(req.get as jest.Mock).mockReturnValue('/case/X123456/')

      const res = createRes({
        radioItems: [{ value: 'CM3A' }, { value: 'CM1' }],
        contactTypes: [],
      })

      await addContactController.getFrequentlyUsedContact()(req, res, next)

      expect((req.session as any).data.contactType.X123456).toBeUndefined()
    })

    it('redirects to arrange-appointment when feature flag is on and appointment query is set', async () => {
      jest.spyOn(crypto, 'randomUUID').mockReturnValue('test-uuid' as ReturnType<typeof crypto.randomUUID>)
      const req = createReq({ params: { crn: 'X123456' }, query: { contactType: 'APPOINTMENT' } })
      const res = createRes({ flags: { searchContactsByCategory: true } })

      await addContactController.getFrequentlyUsedContact()(req, res, next)

      expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('/case/X123456/arrange-appointment/'))
      expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('test-uuid'))
    })
  })

  describe('postFrequentlyUsedContact', () => {
    it('stores selected contactType in session', async () => {
      const req = createReq({
        params: { crn: 'X123456' },
        body: { contactType: 'CM3A' },
      })

      const res = createRes()

      await addContactController.postFrequentlyUsedContact(mockMasApiClient as unknown as MasApiClient)(req, res, next)

      expect((req.session as any).data.contactType.X123456).toBe('CM3A')
    })
    it('redirects to arrange-appointment when contactType is APPOINTMENT', async () => {
      jest.spyOn(crypto, 'randomUUID').mockReturnValue('test-uuid' as ReturnType<typeof crypto.randomUUID>)
      const req = createReq({ params: { crn: 'X123456' }, body: { contactType: 'APPOINTMENT' } })
      const res = createRes()

      await addContactController.postFrequentlyUsedContact(mockMasApiClient as unknown as MasApiClient)(req, res, next)

      expect(mockSendAuditMessage).toHaveBeenCalledWith(
        res,
        AuditAction.SELECT_FREQUENTLY_USED_CONTACT_TYPE,
        'X123456',
        SubjectType.CRN,
      )
      expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('/case/X123456/arrange-appointment/'))
      expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('test-uuid'))
    })

    it('redirects to slugified contact type page for non-appointment types', async () => {
      const req = createReq({ params: { crn: 'X123456' }, body: { contactType: 'CM3A' } })
      const res = createRes()

      await addContactController.postFrequentlyUsedContact(mockMasApiClient as unknown as MasApiClient)(req, res, next)

      expect(res.redirect).toHaveBeenCalledWith('/case/X123456/contacts/add-email-or-text-from-other')
    })

    it('falls back to raw contactType code in slug when type not found', async () => {
      const req = createReq({ params: { crn: 'X123456' }, body: { contactType: 'UNKNOWN_CODE' } })
      const res = createRes()

      await addContactController.postFrequentlyUsedContact(mockMasApiClient as unknown as MasApiClient)(req, res, next)

      expect(res.redirect).toHaveBeenCalledWith('/case/X123456/contacts/add-UNKNOWN_CODE')
    })
  })

  describe('getAddContactType', () => {
    it('renders add-contact-type page with correct locals', async () => {
      const req = createReq({ params: { crn: 'X123456', contactType: 'police-liaison' } })
      const res = createRes({
        isResponsibleOfficer: true,
        sentences: [],
        csrfToken: 'csrf',
        responsibleOfficerForename: 'Jane',
        responsibleOfficerSurname: 'Doe',
      })

      await addContactController.getAddContactType(mockMasApiClient as unknown as MasApiClient)(req, res, next)

      expect(mockSendAuditMessage).toHaveBeenCalledWith(res, AuditAction.VIEW_ADD_CONTACT, 'X123456', SubjectType.CRN)
      expect(res.render).toHaveBeenCalledWith(
        'pages/contacts/add-contact-type',
        expect.objectContaining({
          crn: 'X123456',
          contactTypeName: 'Police liaison',
          relatesToOptions: expect.any(Array),
        }),
      )
    })

    it('sets responsibleOfficer to SHOW_OFFICER when user is not responsible officer', async () => {
      const req = createReq({ params: { crn: 'X123456', contactType: 'community-intervention' } })
      const res = createRes({ isResponsibleOfficer: false })

      await addContactController.getAddContactType(mockMasApiClient as unknown as MasApiClient)(req, res, next)

      const renderArgs = (res.render as jest.Mock).mock.calls[0][1]
      expect(renderArgs.responsibleOfficer).toBe('SHOW_OFFICER')
    })

    it('sets responsibleOfficer to undefined when user is responsible officer', async () => {
      const req = createReq({ params: { crn: 'X123456', contactType: 'community-intervention' } })
      const res = createRes({ isResponsibleOfficer: true })

      await addContactController.getAddContactType(mockMasApiClient as unknown as MasApiClient)(req, res, next)

      const renderArgs = (res.render as jest.Mock).mock.calls[0][1]
      expect(renderArgs.responsibleOfficer).toBeUndefined()
    })

    it('sets isVisor to SHOW_VISOR when registrations include visor', async () => {
      mockMasApiClient.getOverview.mockResolvedValue({ registrations: ['VISOR', 'Restraining Order'] })
      const req = createReq({ params: { crn: 'X123456', contactType: 'community-intervention' } })
      const res = createRes()

      await addContactController.getAddContactType(mockMasApiClient as unknown as MasApiClient)(req, res, next)

      const renderArgs = (res.render as jest.Mock).mock.calls[0][1]
      expect(renderArgs.isVisor).toBe('SHOW_VISOR')
    })

    it('sets isVisor to undefined when registrations do not include visor', async () => {
      mockMasApiClient.getOverview.mockResolvedValue({ registrations: ['Restraining Order'] })
      const req = createReq({ params: { crn: 'X123456', contactType: 'community-intervention' } })
      const res = createRes()

      await addContactController.getAddContactType(mockMasApiClient as unknown as MasApiClient)(req, res, next)

      const renderArgs = (res.render as jest.Mock).mock.calls[0][1]
      expect(renderArgs.isVisor).toBeUndefined()
    })

    it('sets isVisor to undefined when overview is null', async () => {
      mockMasApiClient.getOverview.mockResolvedValue(null)
      const req = createReq({ params: { crn: 'X123456', contactType: 'community-intervention' } })
      const res = createRes()

      await addContactController.getAddContactType(mockMasApiClient as unknown as MasApiClient)(req, res, next)

      const renderArgs = (res.render as jest.Mock).mock.calls[0][1]
      expect(renderArgs.isVisor).toBeUndefined()
    })

    it('renders person-only contacts without relates-to options and normalises string values', async () => {
      const req = createReq({
        params: { crn: ['X123456'], contactType: ['accommodation-evidence'] } as any,
      })
      const res = createRes({
        isResponsibleOfficer: false,
        sentences: [],
        csrfToken: ['csrf-token'],
        responsibleOfficerForename: ['jane'],
        responsibleOfficerSurname: ['doe'],
      })

      await addContactController.getAddContactType(mockMasApiClient as unknown as MasApiClient)(req, res, next)

      const renderArgs = (res.render as jest.Mock).mock.calls[0][1]
      expect(renderArgs.crn).toBe('X123456')
      expect(renderArgs.contactTypeName).toBe('Accommodation evidence')
      expect(renderArgs.showRelatesToQuestion).toBe(false)
      expect(renderArgs.formValues.sentence).toBe('PERSON_LEVEL_CONTACT')
      expect(renderArgs.csrfToken).toBe('csrf-token')
      expect(renderArgs.responsibleOfficerForename).toBe('Jane')
      expect(renderArgs.responsibleOfficerSurname).toBe('Doe')
    })

    it('renders guidance for configured no outcome contacts', async () => {
      const req = createReq({ params: { crn: 'X123456', contactType: 'mappa-level-setting-process' } })
      const res = createRes({
        isResponsibleOfficer: true,
        sentences: [{ id: 1, order: { description: 'Community Order 1', startDate: '2024-06-15' } }],
      })

      await addContactController.getAddContactType(mockMasApiClient as unknown as MasApiClient)(req, res, next)

      const renderArgs = (res.render as jest.Mock).mock.calls[0][1]
      expect(renderArgs.guidance).toEqual({
        paragraphs: ['You must notify the prison of the MAPPA level, and record that you\'ve done this.'],
        insertText: 'You must notify the prison of the MAPPA level, and record that you\'ve done this.',
      })
      expect(renderArgs.showPersonOption).toBe(false)
      expect(renderArgs.showEventOptions).toBe(true)
    })
  })

  describe('postAddContactType', () => {
    const validBody = {
      sentence: '1',
      title: 'Meeting',
      details: 'Some notes',
      sensitivity: 'Yes',
      visor: 'No',
      alertResponsibleOfficer: 'No',
      date: '17/5/2024',
      time: '09:00',
    }

    it('creates a contact and redirects to activity log', async () => {
      const req = createReq({ params: { crn: 'X123456', contactType: 'email-or-text-from-other' }, body: validBody })
      const res = createRes()

      await addContactController.postAddContactType(mockMasApiClient as unknown as MasApiClient)(req, res, next)

      expect(mockSendAuditMessage).toHaveBeenCalledWith(res, AuditAction.ADD_CONTACT, 'X123456', SubjectType.CRN)
      expect(mockCreateContact).toHaveBeenCalledWith(
        'X123456',
        expect.objectContaining({
          date: '2024-05-17',
          time: '09:00',
          staffCode: 'N01A001',
          teamCode: 'N01T01',
          type: 'CM3A',
          eventId: 1,
          sensitive: true,
          visorReport: false,
          alert: false,
        }),
        'test-user',
      )
      expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('/case/X123456/activity-log'))
      expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('showSuccessBanner=true'))
    })

    it('sets eventId to null when sentence is PERSON_LEVEL_CONTACT', async () => {
      const req = createReq({
        params: { crn: 'X123456', contactType: 'community-intervention' },
        body: { ...validBody, sentence: 'PERSON_LEVEL_CONTACT' },
      })
      const res = createRes()

      await addContactController.postAddContactType(mockMasApiClient as unknown as MasApiClient)(req, res, next)

      expect(mockCreateContact).toHaveBeenCalledWith('X123456', expect.objectContaining({ eventId: null }), 'test-user')
    })

    it('redirects with showSuccessBanner only when no file is attached', async () => {
      const req = createReq({ params: { crn: 'X123456', contactType: 'community-intervention' }, body: validBody })
      const res = createRes()

      await addContactController.postAddContactType(mockMasApiClient as unknown as MasApiClient)(req, res, next)

      expect(mockPatchDocuments).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('showSuccessBanner=true'))
      expect(res.redirect).not.toHaveBeenCalledWith(expect.stringContaining('uploadFailed=true'))
    })

    it('redirects with showSuccessBanner only when file upload succeeds', async () => {
      const mockFile = { buffer: Buffer.from('data'), originalname: 'test.pdf', mimetype: 'application/pdf' }
      const req = createReq({
        params: { crn: 'X123456', contactType: 'community-intervention' },
        body: validBody,
        file: mockFile as Express.Multer.File,
      })
      const res = createRes()

      await addContactController.postAddContactType(mockMasApiClient as unknown as MasApiClient)(req, res, next)

      expect(mockPatchDocuments).toHaveBeenCalledWith('X123456', '1', mockFile, 'test-user')
      expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('showSuccessBanner=true'))
      expect(res.redirect).not.toHaveBeenCalledWith(expect.stringContaining('uploadFailed=true'))
    })

    it('redirects with uploadFailed=true when file upload fails', async () => {
      mockPatchDocuments.mockRejectedValue(new Error('Upload failed'))
      const mockFile = { buffer: Buffer.from('data'), originalname: 'test.pdf', mimetype: 'application/pdf' }
      const req = createReq({
        params: { crn: 'X123456', contactType: 'community-intervention' },
        body: validBody,
        file: mockFile as Express.Multer.File,
      })
      const res = createRes()

      await addContactController.postAddContactType(mockMasApiClient as unknown as MasApiClient)(req, res, next)

      expect(mockPatchDocuments).toHaveBeenCalledWith('X123456', '1', mockFile, 'test-user')
      expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('showSuccessBanner=true&uploadFailed=true'))
    })
  })

  describe('postSearchByCategory', () => {
    it('clears selections and results when action is clear', async () => {
      const req = createReq({
        params: { crn: 'X123456' },
        body: { action: 'clear' },
      })
      const res = createRes({ csrfToken: 'csrf-token', contactTypes: [] })

      await addContactController.postSearchByCategory()(req, res, next)

      expect(res.render).toHaveBeenCalledWith(
        'pages/contacts/add-frequently-used-contact',
        expect.objectContaining({
          crn: 'X123456',
          searchResults: null,
          selectedCategories: [],
          searchByCategoryTabActive: true,
          lastCategories: '',
        }),
      )
    })

    it('renders validation error when no categories selected', async () => {
      const req = createReq({
        params: { crn: 'X123456' },
        body: { lastCategories: 'Referrals,Sentence management' },
      })
      const res = createRes({ csrfToken: 'csrf-token', contactTypes: [] })

      await addContactController.postSearchByCategory()(req, res, next)

      const renderArgs = (res.render as jest.Mock).mock.calls[0][1]
      expect(renderArgs.errorMessages).toEqual({ categories: 'Select a category' })
      expect(renderArgs.searchByCategoryTabActive).toBe(true)
      expect(renderArgs.lastCategories).toBe('Referrals,Sentence management')
    })

    it('renders results when categories are selected', async () => {
      const req = createReq({
        params: { crn: 'X123456' },
        body: { categories: ['Referrals', 'Sentence management'] },
      })
      const res = createRes({ csrfToken: 'csrf-token', contactTypes: [] })

      await addContactController.postSearchByCategory()(req, res, next)

      const renderArgs = (res.render as jest.Mock).mock.calls[0][1]
      expect(renderArgs.selectedCategories).toEqual(['Referrals', 'Sentence management'])
      expect(renderArgs.searchResults).toEqual(
        expect.objectContaining({
          count: expect.any(Number),
          categories: expect.any(Array),
        }),
      )
      expect(renderArgs.searchByCategoryTabActive).toBe(true)
    })
  })
})
