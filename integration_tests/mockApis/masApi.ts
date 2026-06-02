import type { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'

export default {
  stubPing: (httpStatus = 200): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/mas-api/health/ping',
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { status: httpStatus === 200 ? 'UP' : 'DOWN' },
      },
    }),

  stubGetAlertsCount: (totalResults = 0): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/mas-api/alerts',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          content: [],
          totalResults,
          totalPages: 0,
          page: 0,
          size: 0,
        },
      },
    }),

  stubGetPersonalDetailsNotFound: (crn = 'X999999'): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: `/mas-api/personal-details/${crn}`,
      },
      response: {
        status: 404,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {},
      },
    }),

  stubGetPersonalDetails: (crn = 'A000001'): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/mas-api/personal-details/.+',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          crn,
          name: { forename: 'John', surname: 'Smith' },
          dateOfBirth: '1990-01-01',
          sex: 'Male',
          preferredGender: 'Male',
          otherAddressCount: 0,
          previousAddressCount: 0,
          contacts: [],
          aliases: [],
          circumstances: { circumstances: [] },
          disabilities: { disabilities: [] },
          provisions: { provisions: [] },
          documents: [],
          addressTypes: [],
          staffContacts: [],
        },
      },
    }),

  stubGetContactTypes: (): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/mas-api/contact/types',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [
          { code: 'APPT', description: 'One-to-one appointment', isPersonLevelContact: false },
          { code: 'POL', description: 'Police Liaison', isPersonLevelContact: false },
        ],
      },
    }),

  stubGetContactType: (code = 'APPT'): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/mas-api/contact/types/.+',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { code, description: 'One-to-one appointment', isPersonLevelContact: false },
      },
    }),

  stubGetUserProviders: (): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/mas-api/user/.+/providers',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          defaultUserDetails: { staffCode: 'N01A001', username: 'USER1', homeArea: 'N01', team: 'Team One' },
          teams: [{ description: 'Team One', code: 'N01T01' }],
        },
      },
    }),

  stubGetSentences: (crn = 'A000001'): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/mas-api/sentences/.+',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          sentences: [{ id: 1, order: { description: 'ORA Community Order', startDate: '2023-01-01' } }],
        },
      },
    }),

  stubIsResponsibleOfficer: (isResponsible = true): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/mas-api/case/.+/officer-status/.+',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { isResponsibleOfficer: isResponsible },
      },
    }),

  stubCreateContact: (id = 1): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: '/mas-api/contact/.+',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { id },
      },
    }),

  stubGetOverview: (): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/mas-api/overview/.+',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { registrations: [] },
      },
    }),

  stubGetContact: (): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/mas-api/schedule/X123456/appointment/00001',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          personSummary: {
            name: {
              forename: 'Marianne',
              middleName: 'S',
              surname: 'DuBuque-Predovic',
            },
            crn: 'X793504',
            offenderId: 2501225867,
            pnc: '1974/3498172L',
            noms: 'A6087EA',
            dateOfBirth: '1974-09-19',
          },
          appointment: {
            id: 2510648859,
            eventNumber: '3',
            type: 'Arrest Incident',
            startDateTime: '2026-05-28T12:35:00+01:00',
            appointmentNotes: [
              {
                id: 0,
                createdBy: 'A Ramchurn',
                createdByDate: '2026-05-21',
                note: 'optional outcome testing\n\nThis contact was created in the Manage people on probation service.',
                hasNoteBeenTruncated: false,
              },
            ],
            isSensitive: false,
            wasAbsent: false,
            officer: {
              code: 'N56A119',
              name: {
                forename: 'leigh',
                surname: 'christie1',
              },
              teamCode: 'N56N07',
              providerCode: 'N56',
              username: 'leigh.christie1',
            },
            isInitial: false,
            isNationalStandard: false,
            rescheduled: false,
            rescheduledStaff: false,
            rescheduledPop: false,
            absentWaitingEvidence: false,
            documents: [],
            isRarRelated: false,
            acceptableAbsence: false,
            isAppointment: false,
            isCommunication: false,
            isSystemContact: false,
            isEmailOrTextFromPop: false,
            isPhoneCallFromPop: false,
            isEmailOrTextToPop: false,
            isPhoneCallToPop: false,
            isInPast: true,
            isPastAppointment: false,
            isAlert: false,
            lastUpdated: '2026-05-28T15:44:17+01:00',
            lastUpdatedBy: {
              forename: 'John',
              surname: 'Doe',
            },
            description: 'optional outcome',
            outcome: 'Risk Review',
            deliusManaged: true,
            isVisor: false,
            eventId: 2501068142,
            displayName: 'Arrest incident',
          },
          documents: [],
        },
      },
    }),

  stubGetContactOutome: (): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/mas-api/schedule/X123456/appointment/00002',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          appointment: {
            id: 2533,
            type: 'eMail/Text to PoP',
            startDateTime: '2026-05-06T09:28:01+01:00',
            appointmentNotes: [
              {
                id: 0,
                createdBy: 'J dsd',
                createdByDate: '2026-05-06',
                note: '[DEV] Mocked notes',
                hasNoteBeenTruncated: false,
              },
            ],
            isSensitive: false,
            wasAbsent: false,
            officer: {
              code: 'N56A174',
              name: {
                forename: 'Jane',
                surname: 'Smith',
              },
              teamCode: 'N11',
              providerCode: 'N12',
              username: 'J20',
            },
            isInitial: false,
            isNationalStandard: false,
            rescheduled: false,
            rescheduledStaff: false,
            rescheduledPop: false,
            absentWaitingEvidence: false,
            documents: [],
            isRarRelated: false,
            acceptableAbsence: false,
            isAppointment: false,
            isCommunication: true,
            isSystemContact: false,
            isEmailOrTextFromPop: false,
            isPhoneCallFromPop: false,
            isEmailOrTextToPop: true,
            isPhoneCallToPop: false,
            isInPast: true,
            isPastAppointment: false,
            lastUpdated: '2026-05-06T09:28:01+01:00',
            lastUpdatedBy: {
              forename: 'Manage People on Probation',
              surname: 'Service',
            },
            deliusManaged: true,
            isVisor: false,
            displayName: 'Email or text to person on probation',
          },
        },
      },
    }),

  stubGetProbationPractitioner: (): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/mas-api/case/.+/probation-practitioner',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          code: 'N01A001',
          name: { forename: 'jane', surname: 'doe' },
          provider: { code: 'N01', name: 'NPS North West' },
          team: { description: 'Team One', code: 'N01T01' },
          unallocated: false,
          username: 'PRACTITIONER1',
        },
      },
    }),
}
