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
          name: { forename: 'Jane', surname: 'Doe' },
          provider: { code: 'N01', name: 'NPS North West' },
          team: { description: 'Team One', code: 'N01T01' },
          unallocated: false,
          username: 'PRACTITIONER1',
        },
      },
    }),
}
