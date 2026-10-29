import httpMocks from 'node-mocks-http'
import { ArnsComponents, RiskData } from '@ministryofjustice/hmpps-arns-frontend-components-lib'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { getPersonalDetails } from './getPersonalDetails'
import MasApiClient from '../data/masApiClient'
import TierApiClient, { TierCalculation } from '../data/tierApiClient'
import PersonRecordApiClient from '../data/personRecordApiClient'
import {
  AddressType,
  Circumstances,
  Disabilities,
  Document,
  Name,
  PersonalContact,
  PersonalDetails,
  Provisions,
} from '../data/model/personalDetails'
import { Contact, ProfessionalContact } from '../data/model/professionalContact'
import * as personStatusTag from '../utils/personStatusTag'

jest.mock('../data/prisonerSearchApiClient')
jest.mock('../utils/personStatusTag', () => ({
  ...jest.requireActual('../utils/personStatusTag'),
  getStatusTag: jest.fn(),
}))

const mockedGetStatusTag = jest.mocked(personStatusTag.getStatusTag)

const mockRiskData: RiskData = {
  assessments: [
    {
      outputVersion: '1',
      completedDate: '09 May 2024',
      completedDateTime: '09 May 2024 at 10:22',
      assessmentType: 'layer 3',
      ogrs3: {
        name: 'OGRS',
        band: 'LOW',
        staticOrDynamic: null,
        score: 1,
        completedDate: '09 May 2024',
      },
      ovp: {
        name: 'OVP',
        band: 'LOW',
        staticOrDynamic: null,
        score: 10,
        completedDate: '09 May 2024',
      },
      ogp: {
        name: 'OGP',
        band: 'LOW',
        staticOrDynamic: null,
        score: 15,
        completedDate: '09 May 2024',
      },
      rsr: {
        name: 'RSR',
        band: 'LOW',
        staticOrDynamic: 'Dynamic',
        score: 0.76,
        completedDate: '09 May 2024',
      },
      ospdc: {
        name: 'OSP–DC',
        band: null,
        staticOrDynamic: null,
        score: null,
        completedDate: '09 May 2024',
      },
      ospiic: {
        name: 'OSP–IIC',
        band: null,
        staticOrDynamic: null,
        score: null,
        completedDate: '09 May 2024',
      },
    },
  ],
  httpStatus: 200,
}

const mockRoshData = {
  assessment: {
    completedDate: '09 May 2024',
    overallRisk: 'LOW',
    risks: [
      { riskTo: 'Children', community: 'LOW', custody: 'LOW' },
      { riskTo: 'Public', community: 'LOW', custody: 'LOW' },
    ],
  },
  httpStatus: 200,
}

const mockTierCalculation = {
  tierScore: 'B2',
  calculationId: 'ee1f151f-7417-47f8-9366-2ced6356db37',
  calculationDate: '2023-12-07T12:05:11.524616',
} as unknown as TierCalculation

let mockMasApiClient: jest.Mocked<Pick<MasApiClient, 'getPersonalDetails' | 'getContacts'>>
let mockPersonRecordApiClient: jest.Mocked<Pick<PersonRecordApiClient, 'getImageData'>>
let mockHmppsAuthClient: jest.Mocked<Pick<AuthenticationClient, 'getToken'>>
let mockTierApiClient: jest.Mocked<Pick<TierApiClient, 'getCalculationDetails'>>
let mockArnsComponents: jest.Mocked<Pick<ArnsComponents, 'getRiskData' | 'getRoshData'>>

let req: httpMocks.MockRequest<any>
let res: httpMocks.MockResponse<any>
let nextSpy: jest.Mock

const overview = (crn = 'X000001'): PersonalDetails => ({
  name: {
    forename: 'Caroline',
    surname: 'Wolff',
  },
  crn,
  contacts: [] as PersonalContact[],
  otherAddressCount: 0,
  previousAddressCount: 0,
  preferredGender: 'male',
  dateOfBirth: '1979-08-18',
  aliases: [] as Name[],
  circumstances: {} as Circumstances,
  disabilities: {} as Disabilities,
  provisions: {} as Provisions,
  sex: 'male',
  documents: [] as Document[],
  addressTypes: [] as AddressType[],
  staffContacts: [] as Contact[],
})

const mockSession = (crn = 'X000001') => ({
  overview: overview(crn),
  tierCalculation: mockTierCalculation,
  riskData: mockRiskData,
  roshData: mockRoshData,
})

const getReq = () =>
  httpMocks.createRequest({
    params: {
      crn: 'X000002',
    },
    session: {
      data: {
        personalDetails: {
          X000001: mockSession(),
        },
      },
    },
  })

const getRes = () =>
  ({
    locals: {
      user: {
        username: 'user-1',
        token: 'test-token',
      },
    },
    redirect: jest.fn().mockReturnThis(),
  }) as unknown as any

describe('/middleware/getPersonalDetails', () => {
  const ORIGINAL_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    nextSpy = jest.fn()
    process.env = { ...ORIGINAL_ENV }

    mockMasApiClient = { getPersonalDetails: jest.fn(), getContacts: jest.fn() }
    mockPersonRecordApiClient = { getImageData: jest.fn() }
    mockHmppsAuthClient = { getToken: jest.fn().mockResolvedValue('token') }
    mockTierApiClient = { getCalculationDetails: jest.fn().mockResolvedValue(mockTierCalculation) }
    mockArnsComponents = {
      getRiskData: jest.fn().mockResolvedValue(mockRiskData),
      getRoshData: jest.fn().mockResolvedValue(mockRoshData),
    }
  })

  afterEach(() => {
    process.env = ORIGINAL_ENV
  })

  it('should request data from the api if personal details for crn does not exist in the session', async () => {
    process.env.NODE_ENV = 'production'
    mockMasApiClient.getPersonalDetails.mockResolvedValueOnce(overview('X000002'))
    req = getReq()
    res = getRes()
    await getPersonalDetails(
      mockMasApiClient as unknown as MasApiClient,
      mockTierApiClient as unknown as TierApiClient,
      mockArnsComponents as unknown as ArnsComponents,
      mockPersonRecordApiClient as unknown as PersonRecordApiClient,
      mockHmppsAuthClient as unknown as AuthenticationClient,
    )(req, res, nextSpy)
    const expected = {
      personalDetails: {
        X000001: mockSession(),
        X000002: mockSession('X000002'),
      },
    }
    expect((req.session as any).data).toEqual(expected)
    expect(mockMasApiClient.getPersonalDetails).toHaveBeenCalledWith(req.params.crn, 'user-1')
    expect(mockTierApiClient.getCalculationDetails).toHaveBeenCalledWith(req.params.crn, 'user-1')
    expect(mockArnsComponents.getRiskData).toHaveBeenCalled()
    expect(mockArnsComponents.getRoshData).toHaveBeenCalled()
    expect(res.locals.case).toEqual(overview('X000002'))
    expect(res.locals.riskData).toEqual(mockRiskData)
    expect(res.locals.tierCalculation).toEqual(mockTierCalculation)
    expect(res.locals.headerPersonName).toEqual({ forename: 'Caroline', surname: 'Wolff' })
    expect(res.locals.headerCRN).toEqual(req.params.crn)
    expect(res.locals.headerDob).toEqual('1979-08-18')
    expect(res.locals.headerTierLink).toEqual('https://tier-dev.hmpps.service.justice.gov.uk/case/X000002')
    expect(mockMasApiClient.getContacts).not.toHaveBeenCalled()
    expect(mockPersonRecordApiClient.getImageData).not.toHaveBeenCalled()
    expect(res.locals.managedBy).toBeUndefined()
    expect(nextSpy).toHaveBeenCalled()
  })

  it('should not request data from the api if personal details for crn already exist in the session', async () => {
    process.env.NODE_ENV = 'production'
    req = httpMocks.createRequest({
      params: {
        crn: 'X000002',
      },
      session: {
        data: {
          personalDetails: {
            X000001: mockSession(),
            X000002: {
              ...mockSession('X000002'),
              riskData: mockRiskData,
              roshData: mockRoshData,
            },
          },
        },
      },
    })
    res = getRes()
    await getPersonalDetails(
      mockMasApiClient as unknown as MasApiClient,
      mockTierApiClient as unknown as TierApiClient,
      mockArnsComponents as unknown as ArnsComponents,
      mockPersonRecordApiClient as unknown as PersonRecordApiClient,
      mockHmppsAuthClient as unknown as AuthenticationClient,
    )(req, res, nextSpy)
    expect(mockMasApiClient.getPersonalDetails).not.toHaveBeenCalled()
    expect(mockTierApiClient.getCalculationDetails).not.toHaveBeenCalled()
    expect(mockArnsComponents.getRiskData).not.toHaveBeenCalled()
    expect(mockArnsComponents.getRoshData).not.toHaveBeenCalled()
    expect(res.locals.case).toEqual(overview('X000002'))
    expect(res.locals.riskData).toEqual(mockRiskData)
    expect(res.locals.tierCalculation).toEqual(mockTierCalculation)
    expect(res.locals.headerPersonName).toEqual({ forename: 'Caroline', surname: 'Wolff' })
    expect(res.locals.headerCRN).toEqual(req.params.crn)
    expect(res.locals.headerDob).toEqual('1979-08-18')
    expect(res.locals.headerTierLink).toEqual('https://tier-dev.hmpps.service.justice.gov.uk/case/X000002')
    expect(res.locals.dateOfDeath).toBeUndefined()
    expect(nextSpy).toHaveBeenCalled()
  })

  it('should call next with a 404 error if personal details are not found', async () => {
    process.env.NODE_ENV = 'production'
    mockMasApiClient.getPersonalDetails.mockResolvedValueOnce(null)
    req = getReq()
    res = getRes()
    await getPersonalDetails(
      mockMasApiClient as unknown as MasApiClient,
      mockTierApiClient as unknown as TierApiClient,
      mockArnsComponents as unknown as ArnsComponents,
      mockPersonRecordApiClient as unknown as PersonRecordApiClient,
      mockHmppsAuthClient as unknown as AuthenticationClient,
    )(req, res, nextSpy)
    expect(nextSpy).toHaveBeenCalledWith(expect.objectContaining({ status: 404 }))
  })

  it('should set the local variable if date of death is recorded', async () => {
    req = getReq()
    res = getRes()
    const dateOfDeath = '2025-11-15'
    mockMasApiClient.getPersonalDetails.mockImplementationOnce(() =>
      Promise.resolve({
        ...overview('X000002'),
        dateOfDeath,
      } as PersonalDetails),
    )
    await getPersonalDetails(
      mockMasApiClient as unknown as MasApiClient,
      mockTierApiClient as unknown as TierApiClient,
      mockArnsComponents as unknown as ArnsComponents,
      mockPersonRecordApiClient as unknown as PersonRecordApiClient,
      mockHmppsAuthClient as unknown as AuthenticationClient,
    )(req, res, nextSpy)
    expect(res.locals.dateOfDeath).toEqual(dateOfDeath)
  })

  it('should initialise session data when no session data exists', async () => {
    process.env.NODE_ENV = 'production'
    mockMasApiClient.getPersonalDetails.mockResolvedValueOnce(overview('X000002'))

    req = httpMocks.createRequest({
      params: {
        crn: 'X000002',
      },
      session: {}, // no data property on session
    })

    res = getRes()

    await getPersonalDetails(
      mockMasApiClient as unknown as MasApiClient,
      mockTierApiClient as unknown as TierApiClient,
      mockArnsComponents as unknown as ArnsComponents,
      mockPersonRecordApiClient as unknown as PersonRecordApiClient,
      mockHmppsAuthClient as unknown as AuthenticationClient,
    )(req, res, nextSpy)

    const expected = {
      personalDetails: {
        X000002: mockSession('X000002'),
      },
    }

    expect((req.session as any).data).toEqual(expected)

    expect(mockMasApiClient.getPersonalDetails).toHaveBeenCalledWith(req.params.crn, 'user-1')
    expect(mockTierApiClient.getCalculationDetails).toHaveBeenCalledWith(req.params.crn, 'user-1')
    expect(mockArnsComponents.getRiskData).toHaveBeenCalled()

    expect(res.locals.case).toEqual(overview('X000002'))
    expect(res.locals.riskData).toEqual(mockRiskData)
    expect(res.locals.tierCalculation).toEqual(mockTierCalculation)
    expect(res.locals.headerPersonName).toEqual({ forename: 'Caroline', surname: 'Wolff' })
    expect(res.locals.headerCRN).toEqual(req.params.crn)
    expect(res.locals.headerDob).toEqual('1979-08-18')
    expect(res.locals.headerTierLink).toEqual('https://tier-dev.hmpps.service.justice.gov.uk/case/X000002')

    expect(nextSpy).toHaveBeenCalled()
  })

  describe('when the person header is enabled', () => {
    const professionalContact: ProfessionalContact = {
      name: { forename: 'Caroline', surname: 'Wolff' },
      currentContacts: [
        {
          name: 'Jack Frost',
          probationDeliveryUnit: 'Worksop Probation Office',
          responsibleOfficer: true,
          prisonOffenderManager: false,
        } as Contact,
      ],
      previousContacts: [],
    }
    const photo = () =>
      ({ destroy: jest.fn() }) as unknown as Awaited<ReturnType<PersonRecordApiClient['getImageData']>>

    const getHeaderRes = () => {
      const headerRes = getRes()
      headerRes.locals.flags = { enablePersonHeader: true, enablePersonHeaderPhoto: true }
      return headerRes
    }

    const run = () =>
      getPersonalDetails(
        mockMasApiClient as unknown as MasApiClient,
        mockTierApiClient as unknown as TierApiClient,
        mockArnsComponents as unknown as ArnsComponents,
        mockPersonRecordApiClient as unknown as PersonRecordApiClient,
        mockHmppsAuthClient as unknown as AuthenticationClient,
      )(req, res, nextSpy)

    beforeEach(() => {
      mockMasApiClient.getPersonalDetails.mockResolvedValue({ ...overview('X000002'), noms: 'A1234BC' })
      mockMasApiClient.getContacts.mockResolvedValue(professionalContact)
    })

    it('sets managed by and the photo, and caches them in the session', async () => {
      const photoData = photo()
      mockPersonRecordApiClient.getImageData.mockResolvedValue(photoData)
      req = getReq()
      res = getHeaderRes()

      await run()

      expect(mockMasApiClient.getContacts).toHaveBeenCalledWith('X000002', 'user-1')
      expect(mockPersonRecordApiClient.getImageData).toHaveBeenCalledWith('A1234BC', 'user-1')
      expect(photoData.destroy).toHaveBeenCalled()
      expect(res.locals.managedBy).toEqual({
        text: 'Jack Frost (Worksop Probation Office)',
        name: 'Jack Frost',
        location: 'Worksop Probation Office',
        href: '/case/X000002/personal-details/staff-contacts',
      })
      expect(res.locals.personPhotoSrc).toEqual('/search/prisoner-image/A1234BC')
      expect(res.locals.arnsUnavailable).toBe(false)
      expect(res.locals.prisonsUnavailable).toBe(false)
      expect(req.session.data.personalDetails.X000002.professionalContact).toEqual(professionalContact)
      expect(req.session.data.personalDetails.X000002.personPhotoSrc).toEqual('/search/prisoner-image/A1234BC')
      expect(nextSpy).toHaveBeenCalledWith()
    })

    it('does not request managed by or the photo again when they are cached', async () => {
      req = httpMocks.createRequest({
        params: { crn: 'X000002' },
        session: {
          data: {
            personalDetails: {
              X000002: { ...mockSession('X000002'), professionalContact, personPhotoSrc: '/search/prisoner-image/A1' },
            },
          },
        },
      })
      res = getHeaderRes()

      await run()

      expect(mockMasApiClient.getContacts).not.toHaveBeenCalled()
      expect(mockPersonRecordApiClient.getImageData).not.toHaveBeenCalled()
      expect(res.locals.managedBy.name).toEqual('Jack Frost')
      expect(res.locals.personPhotoSrc).toEqual('/search/prisoner-image/A1')
    })

    it('does not set a photo when there is no noms number', async () => {
      mockMasApiClient.getPersonalDetails.mockResolvedValue(overview('X000002'))
      req = getReq()
      res = getHeaderRes()

      await run()

      expect(mockPersonRecordApiClient.getImageData).not.toHaveBeenCalled()
      expect(res.locals.personPhotoSrc).toBeUndefined()
    })

    it('shows managed by as no data available when the contacts request fails', async () => {
      mockMasApiClient.getContacts.mockRejectedValue(new Error('500'))
      mockPersonRecordApiClient.getImageData.mockResolvedValue(null)
      req = getReq()
      res = getHeaderRes()

      await run()

      expect(res.locals.managedBy).toEqual({ text: 'No data available' })
      expect(nextSpy).toHaveBeenCalledWith()
    })

    it('flags prisons as unavailable and does not cache the photo when the prison api fails', async () => {
      mockPersonRecordApiClient.getImageData.mockRejectedValue(new Error('500'))
      req = getReq()
      res = getHeaderRes()

      await run()

      expect(res.locals.prisonsUnavailable).toBe(true)
      expect(res.locals.personPhotoSrc).toBeUndefined()
      expect(res.locals.managedBy.name).toEqual('Jack Frost')
      expect(req.session.data.personalDetails.X000002.professionalContact).toEqual(professionalContact)
      expect(req.session.data.personalDetails.X000002.personPhotoSrc).toBeUndefined()
      expect(nextSpy).toHaveBeenCalledWith()
    })

    it('does not request the photo, or flag prisons as unavailable, when enablePersonHeaderPhoto is off', async () => {
      req = getReq()
      res = getRes()
      res.locals.flags = { enablePersonHeader: true, enablePersonHeaderPhoto: false }

      await run()

      expect(mockPersonRecordApiClient.getImageData).not.toHaveBeenCalled()
      expect(res.locals.personPhotoSrc).toBeUndefined()
      expect(res.locals.prisonsUnavailable).toBe(false)
      expect(res.locals.managedBy.name).toEqual('Jack Frost')
      expect(req.session.data.personalDetails.X000002.personPhotoSrc).toBeUndefined()
    })

    it('requests only the photo once enablePersonHeaderPhoto is turned on for an already cached person', async () => {
      mockPersonRecordApiClient.getImageData.mockResolvedValue(photo())
      req = httpMocks.createRequest({
        params: { crn: 'X000002' },
        session: {
          data: {
            personalDetails: {
              X000002: {
                ...mockSession('X000002'),
                overview: { ...overview('X000002'), noms: 'A1234BC' },
                professionalContact,
              },
            },
          },
        },
      })
      res = getHeaderRes()

      await run()

      expect(mockMasApiClient.getContacts).not.toHaveBeenCalled()
      expect(mockPersonRecordApiClient.getImageData).toHaveBeenCalledWith('A1234BC', 'user-1')
      expect(res.locals.personPhotoSrc).toEqual('/search/prisoner-image/A1234BC')
      expect(req.session.data.personalDetails.X000002.personPhotoSrc).toEqual('/search/prisoner-image/A1234BC')
    })

    it('does not look up the photo again when it is cached as having no image', async () => {
      req = httpMocks.createRequest({
        params: { crn: 'X000002' },
        session: {
          data: {
            personalDetails: {
              X000002: { ...mockSession('X000002'), professionalContact, personPhotoSrc: null },
            },
          },
        },
      })
      res = getHeaderRes()

      await run()

      expect(mockPersonRecordApiClient.getImageData).not.toHaveBeenCalled()
      expect(res.locals.personPhotoSrc).toBeUndefined()
    })

    it('does not look up the photo again for a crn with no image after the session is saved and reloaded', async () => {
      mockPersonRecordApiClient.getImageData.mockResolvedValue(null)
      req = getReq()
      res = getHeaderRes()
      await run()

      // The session store (Redis, or the in-memory store locally) saves the session as JSON
      const savedSession = JSON.parse(JSON.stringify(req.session.data))
      req = httpMocks.createRequest({ params: { crn: 'X000002' }, session: { data: savedSession } })
      res = getHeaderRes()
      await run()

      expect(mockPersonRecordApiClient.getImageData).toHaveBeenCalledTimes(1)
      expect(savedSession.personalDetails.X000002.personPhotoSrc).toBeNull()
      expect(res.locals.personPhotoSrc).toBeUndefined()
    })

    it('hides a cached photo when enablePersonHeaderPhoto is turned off', async () => {
      req = httpMocks.createRequest({
        params: { crn: 'X000002' },
        session: {
          data: {
            personalDetails: {
              X000002: { ...mockSession('X000002'), professionalContact, personPhotoSrc: '/search/prisoner-image/A1' },
            },
          },
        },
      })
      res = getRes()
      res.locals.flags = { enablePersonHeader: true, enablePersonHeaderPhoto: false }

      await run()

      expect(res.locals.personPhotoSrc).toBeUndefined()
    })

    it('flags arns as unavailable instead of failing the page when arns fails', async () => {
      mockPersonRecordApiClient.getImageData.mockResolvedValue(null)
      mockArnsComponents.getRiskData.mockRejectedValue(new Error('500'))
      req = getReq()
      res = getHeaderRes()

      await run()

      expect(res.locals.arnsUnavailable).toBe(true)
      expect(res.locals.riskData).toBeNull()
      expect(nextSpy).toHaveBeenCalledWith()
    })

    it('flags arns as unavailable when the risk data has an error status', async () => {
      mockPersonRecordApiClient.getImageData.mockResolvedValue(null)
      mockArnsComponents.getRiskData.mockResolvedValue({ ...mockRiskData, httpStatus: 500 })
      req = getReq()
      res = getHeaderRes()

      await run()

      expect(res.locals.arnsUnavailable).toBe(true)
      expect(res.locals.riskData).toBeNull()
      expect(req.session.data.personalDetails.X000002.riskData).toBeNull()
    })

    it('flags arns as unavailable and requests the rosh data again when it has an error status', async () => {
      mockPersonRecordApiClient.getImageData.mockResolvedValue(null)
      mockArnsComponents.getRoshData.mockResolvedValueOnce({ ...mockRoshData, httpStatus: 500 })
      req = getReq()
      res = getHeaderRes()
      await run()

      expect(res.locals.arnsUnavailable).toBe(true)
      expect(req.session.data.personalDetails.X000002.roshData).toBeNull()

      res = getHeaderRes()
      await run()

      expect(mockArnsComponents.getRoshData).toHaveBeenCalledTimes(2)
      expect(res.locals.roshData).toEqual(mockRoshData)
      expect(res.locals.arnsUnavailable).toBe(false)
    })

    it('sets the rosh widget from the rosh data', async () => {
      mockPersonRecordApiClient.getImageData.mockResolvedValue(null)
      req = getReq()
      res = getHeaderRes()

      await run()

      expect(res.locals.risksWidget).toEqual({
        overallRisk: 'LOW',
        assessedOn: '09 May 2024',
        risks: mockRoshData.assessment.risks,
      })
    })

    it('sets the rosh widget to not found when there is no rosh assessment', async () => {
      mockPersonRecordApiClient.getImageData.mockResolvedValue(null)
      mockArnsComponents.getRoshData.mockResolvedValue({ assessment: null, httpStatus: 404 })
      req = getReq()
      res = getHeaderRes()

      await run()

      expect(res.locals.risksWidget).toEqual({ overallRisk: 'NOT_FOUND', assessedOn: undefined, risks: undefined })
    })

    it('requests the risk data again on the next request after arns failed', async () => {
      mockPersonRecordApiClient.getImageData.mockResolvedValue(null)
      mockArnsComponents.getRiskData.mockResolvedValueOnce({ ...mockRiskData, httpStatus: 500 })
      req = getReq()
      res = getHeaderRes()
      await run()

      res = getHeaderRes()
      await run()

      expect(mockArnsComponents.getRiskData).toHaveBeenCalledTimes(2)
      expect(res.locals.riskData).toEqual(mockRiskData)
      expect(res.locals.arnsUnavailable).toBe(false)
    })
  })

  describe('person status tag', () => {
    beforeEach(() => {
      mockedGetStatusTag.mockReset()
      mockMasApiClient.getContacts.mockResolvedValue(null)
      mockPersonRecordApiClient.getImageData.mockResolvedValue(null)
      req = getReq()
      res = getRes()
    })

    const run = () =>
      getPersonalDetails(
        mockMasApiClient as unknown as MasApiClient,
        mockTierApiClient as unknown as TierApiClient,
        mockArnsComponents as unknown as ArnsComponents,
        mockPersonRecordApiClient as unknown as PersonRecordApiClient,
        mockHmppsAuthClient as unknown as AuthenticationClient,
      )(req, res, nextSpy)

    it('sets personStatusTag when the feature flag is enabled and NOMS number exists', async () => {
      const personOverview = { ...overview('X000002'), noms: 'A1234BC' }
      mockMasApiClient.getPersonalDetails.mockResolvedValueOnce(personOverview)
      mockedGetStatusTag.mockResolvedValueOnce('In custody')
      res.locals.flags = { enablePersonHeader: true }

      await run()

      expect(mockHmppsAuthClient.getToken).toHaveBeenCalledWith('user-1')
      expect(mockedGetStatusTag).toHaveBeenCalledWith(
        personOverview,
        res.locals.supervisionPackageDetails,
        res.locals.prisoner,
      )
      expect(res.locals.personStatusTag).toBe('In custody')
      expect(nextSpy).toHaveBeenCalled()
    })

    it('does not call getStatusTag when the feature flag is disabled', async () => {
      const personOverview = { ...overview('X000002'), noms: 'A1234BC' }
      mockMasApiClient.getPersonalDetails.mockResolvedValueOnce(personOverview)
      res.locals.flags = { enablePersonHeader: false }

      await run()

      expect(mockedGetStatusTag).not.toHaveBeenCalled()
      expect(res.locals.personStatusTag).toBeUndefined()
      expect(nextSpy).toHaveBeenCalled()
    })

    it('sets personStatusTag to undefined when getStatusTag returns undefined', async () => {
      const personOverview = { ...overview('X000002'), noms: 'A1234BC' }
      mockMasApiClient.getPersonalDetails.mockResolvedValueOnce(personOverview)
      mockedGetStatusTag.mockResolvedValueOnce(undefined)
      res.locals.flags = { enablePersonHeader: true }

      await run()

      expect(mockedGetStatusTag).toHaveBeenCalledWith(
        personOverview,
        res.locals.supervisionPackageDetails,
        res.locals.prisoner,
      )
      expect(res.locals.personStatusTag).toBeUndefined()
      expect(nextSpy).toHaveBeenCalled()
    })
  })
})
