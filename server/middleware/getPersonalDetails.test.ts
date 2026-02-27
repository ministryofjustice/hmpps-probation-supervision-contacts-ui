import httpMocks from 'node-mocks-http'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { getPersonalDetails } from './getPersonalDetails'
import MasApiClient from '../data/masApiClient'
import TierApiClient, { TierCalculation } from '../data/tierApiClient'
import ArnsApiClient from '../data/arnsApiClient'
import { toPredictors } from '../utils/toPredictors'
import { toRoshWidget } from '../utils/toRoshWidget'
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
import { Contact } from '../data/model/professionalContact'
import { RiskSummary } from '../data/model/risk'

jest.mock('../data/masApiClient')
jest.mock('../data/tierApiClient')
jest.mock('../data/arnsApiClient')

const mockRisks = {
  overallRisk: 'VERY_HIGH',
  assessedOn: '2024-11-29T13:01:15',
  riskInCommunity: {
    Public: 'HIGH',
    Children: 'LOW',
    'Known Adult': 'MEDIUM',
    Staff: 'VERY_HIGH',
  },
  riskInCustody: {
    Public: 'HIGH',
    Children: 'LOW',
    'Known Adult': 'MEDIUM',
    Staff: 'VERY_HIGH',
    Prisoners: 'MEDIUM',
  },
} as unknown as RiskSummary

const mockPredictors = [] as any[]

const mockTierCalculation = {
  tierScore: 'B2',
  calculationId: 'ee1f151f-7417-47f8-9366-2ced6356db37',
  calculationDate: '2023-12-07T12:05:11.524616',
} as unknown as TierCalculation

const tierCalculationSpy = jest
  .spyOn(TierApiClient.prototype, 'getCalculationDetails')
  .mockImplementation(() => Promise.resolve(mockTierCalculation))
const risksSpy = jest.spyOn(ArnsApiClient.prototype, 'getRisks').mockImplementation(() => Promise.resolve(mockRisks))
const predictorsSpy = jest
  .spyOn(ArnsApiClient.prototype, 'getPredictorsAll')
  .mockImplementation(() => Promise.resolve(mockPredictors))
let getPersonalDetailsSpy: jest.SpyInstance
let req: httpMocks.MockRequest<any>
let res: httpMocks.MockResponse<any>
let nextSpy: jest.Mock

let hmppsAuthClient: jest.Mocked<AuthenticationClient>

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
  risks: mockRisks,
  tierCalculation: mockTierCalculation,
  predictors: mockPredictors,
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

const getRes = (flags = {}) =>
  ({
    locals: {
      user: {
        username: 'user-1',
      },
      flags,
    },
    redirect: jest.fn().mockReturnThis(),
  }) as unknown as any

describe('/middleware/getPersonalDetails', () => {
  const ORIGINAL_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    getPersonalDetailsSpy = jest.spyOn(MasApiClient.prototype, 'getPersonalDetails')
    nextSpy = jest.fn()
    process.env = { ...ORIGINAL_ENV }
    hmppsAuthClient = {
      getToken: jest.fn().mockResolvedValue('test-system-token'),
    } as unknown as jest.Mocked<AuthenticationClient>
  })

  afterEach(() => {
    process.env = ORIGINAL_ENV
  })

  it('should request data from the api if personal details for crn does not exist in the session and env is not development', async () => {
    process.env.NODE_ENV = 'production'
    getPersonalDetailsSpy.mockResolvedValueOnce(overview('X000002'))
    req = getReq()
    res = getRes({ enableTierLink: true })
    await getPersonalDetails(hmppsAuthClient)(req, res, nextSpy)
    const expected = {
      personalDetails: {
        X000001: mockSession(),
        X000002: mockSession('X000002'),
      },
    }
    expect((req.session as any).data).toEqual(expected)
    expect(getPersonalDetailsSpy).toHaveBeenCalledWith(req.params.crn)
    expect(tierCalculationSpy).toHaveBeenCalledWith(req.params.crn)
    expect(risksSpy).toHaveBeenCalledWith(req.params.crn)
    expect(predictorsSpy).toHaveBeenCalledWith(req.params.crn)
    expect(res.locals.case).toEqual(overview('X000002'))
    expect(res.locals.risksWidget).toEqual(toRoshWidget(mockRisks))
    expect(res.locals.tierCalculation).toEqual(mockTierCalculation)
    expect(res.locals.predictorScores).toEqual(toPredictors(mockPredictors))
    expect(res.locals.headerPersonName).toEqual({ forename: 'Caroline', surname: 'Wolff' })
    expect(res.locals.headerCRN).toEqual(req.params.crn)
    expect(res.locals.headerDob).toEqual('1979-08-18')
    expect(res.locals.headerTierLink).toEqual('https://tier-dummy-url/X000002')
    expect(nextSpy).toHaveBeenCalled()
  })

  it('should request data from the api if personal details for crn exist in the session and the env is development', async () => {
    process.env.NODE_ENV = 'development'
    getPersonalDetailsSpy.mockResolvedValueOnce(overview('X000002'))
    req = httpMocks.createRequest({
      params: {
        crn: 'X000002',
      },
      session: {
        data: {
          personalDetails: {
            X000001: mockSession(),
            X000002: mockSession('X000002'),
          },
        },
      },
    })
    res = getRes({ enableTierLink: true })
    await getPersonalDetails(hmppsAuthClient)(req, res, nextSpy)
    expect(getPersonalDetailsSpy).toHaveBeenCalledWith(req.params.crn)
    expect(tierCalculationSpy).toHaveBeenCalledWith(req.params.crn)
    expect(risksSpy).toHaveBeenCalledWith(req.params.crn)
    expect(predictorsSpy).toHaveBeenCalledWith(req.params.crn)
    expect(res.locals.case).toEqual(overview('X000002'))
    expect(res.locals.risksWidget).toEqual(toRoshWidget(mockRisks))
    expect(res.locals.tierCalculation).toEqual(mockTierCalculation)
    expect(res.locals.predictorScores).toEqual(toPredictors(mockPredictors))
    expect(res.locals.headerPersonName).toEqual({ forename: 'Caroline', surname: 'Wolff' })
    expect(res.locals.headerCRN).toEqual(req.params.crn)
    expect(res.locals.headerDob).toEqual('1979-08-18')
    expect(res.locals.headerTierLink).toEqual('https://tier-dummy-url/X000002')
    expect(nextSpy).toHaveBeenCalled()
  })

  it('should not request data from the api if personal details for crn already exist in the session and env is not development', async () => {
    process.env.NODE_ENV = 'production'
    req = httpMocks.createRequest({
      params: {
        crn: 'X000002',
      },
      session: {
        data: {
          personalDetails: {
            X000001: mockSession(),
            X000002: mockSession('X000002'),
          },
        },
      },
    })
    res = getRes({ enableTierLink: true })
    await getPersonalDetails(hmppsAuthClient)(req, res, nextSpy)
    expect(getPersonalDetailsSpy).not.toHaveBeenCalled()
    expect(risksSpy).not.toHaveBeenCalled()
    expect(tierCalculationSpy).not.toHaveBeenCalled()
    expect(predictorsSpy).not.toHaveBeenCalled()
    expect(res.locals.case).toEqual(overview('X000002'))
    expect(res.locals.risksWidget).toEqual(toRoshWidget(mockRisks))
    expect(res.locals.tierCalculation).toEqual(mockTierCalculation)
    expect(res.locals.predictorScores).toEqual(toPredictors(mockPredictors))
    expect(res.locals.headerPersonName).toEqual({ forename: 'Caroline', surname: 'Wolff' })
    expect(res.locals.headerCRN).toEqual(req.params.crn)
    expect(res.locals.headerDob).toEqual('1979-08-18')
    expect(res.locals.headerTierLink).toEqual('https://tier-dummy-url/X000002')
    expect(res.locals.dateOfDeath).toBeUndefined()
    expect(nextSpy).toHaveBeenCalled()
  })

  it('should set the local variable if date of death is recorded', async () => {
    req = getReq()
    res = getRes()
    const dateOfDeath = '2025-11-15'
    getPersonalDetailsSpy.mockImplementationOnce(() =>
      Promise.resolve({
        ...overview('X000002'),
        dateOfDeath,
      } as PersonalDetails),
    )
    await getPersonalDetails(hmppsAuthClient)(req, res, nextSpy)
    expect(res.locals.dateOfDeath).toEqual(dateOfDeath)
  })

  it('should not set res.locals.headerTierLink if feature flag is disabled', async () => {
    getPersonalDetailsSpy.mockImplementationOnce(() => Promise.resolve(overview('X000002')))
    req = getReq()
    res = getRes({ enableTierLink: false })
    await getPersonalDetails(hmppsAuthClient)(req, res, nextSpy)
    expect(res.locals.headerTierLink).toBeUndefined()
  })
})
