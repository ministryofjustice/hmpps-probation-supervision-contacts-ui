import httpMocks from 'node-mocks-http'
import { ArnsComponents, RiskData } from '@ministryofjustice/hmpps-arns-frontend-components-lib'
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

const mockRiskData: RiskData = {
  assessments: [],
  httpStatus: 200,
}

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

let mockMasApiClient: jest.Mocked<Pick<MasApiClient, 'getPersonalDetails'>>
let mockArnsApiClient: jest.Mocked<Pick<ArnsApiClient, 'getRisks' | 'getPredictorsAll'>>
let mockTierApiClient: jest.Mocked<Pick<TierApiClient, 'getCalculationDetails'>>
let mockArnsComponents: jest.Mocked<Pick<ArnsComponents, 'getRiskData'>>

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
  risks: mockRisks,
  tierCalculation: mockTierCalculation,
  predictors: mockPredictors,
  riskData: mockRiskData,
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

    mockMasApiClient = { getPersonalDetails: jest.fn() }
    mockArnsApiClient = {
      getRisks: jest.fn().mockResolvedValue(mockRisks),
      getPredictorsAll: jest.fn().mockResolvedValue(mockPredictors),
    }
    mockTierApiClient = { getCalculationDetails: jest.fn().mockResolvedValue(mockTierCalculation) }
    mockArnsComponents = { getRiskData: jest.fn().mockResolvedValue(mockRiskData) }
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
      mockArnsApiClient as unknown as ArnsApiClient,
      mockTierApiClient as unknown as TierApiClient,
      mockArnsComponents as unknown as ArnsComponents,
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
    expect(mockArnsApiClient.getRisks).toHaveBeenCalledWith(req.params.crn, 'user-1')
    expect(mockArnsApiClient.getPredictorsAll).toHaveBeenCalledWith(req.params.crn, 'user-1')
    expect(mockArnsComponents.getRiskData).toHaveBeenCalled()
    expect(res.locals.case).toEqual(overview('X000002'))
    expect(res.locals.risksWidget).toEqual(toRoshWidget(mockRisks))
    expect(res.locals.tierCalculation).toEqual(mockTierCalculation)
    expect(res.locals.predictorScores).toEqual(toPredictors(mockPredictors))
    expect(res.locals.headerPersonName).toEqual({ forename: 'Caroline', surname: 'Wolff' })
    expect(res.locals.headerCRN).toEqual(req.params.crn)
    expect(res.locals.headerDob).toEqual('1979-08-18')
    expect(res.locals.headerTierLink).toEqual('https://tier-dev.hmpps.service.justice.gov.uk/case/X000002')
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
            X000002: mockSession('X000002'),
          },
        },
      },
    })
    res = getRes()
    await getPersonalDetails(
      mockMasApiClient as unknown as MasApiClient,
      mockArnsApiClient as unknown as ArnsApiClient,
      mockTierApiClient as unknown as TierApiClient,
      mockArnsComponents as unknown as ArnsComponents,
    )(req, res, nextSpy)
    expect(mockMasApiClient.getPersonalDetails).not.toHaveBeenCalled()
    expect(mockArnsApiClient.getRisks).not.toHaveBeenCalled()
    expect(mockTierApiClient.getCalculationDetails).not.toHaveBeenCalled()
    expect(mockArnsApiClient.getPredictorsAll).not.toHaveBeenCalled()
    expect(mockArnsComponents.getRiskData).not.toHaveBeenCalled()
    expect(res.locals.case).toEqual(overview('X000002'))
    expect(res.locals.risksWidget).toEqual(toRoshWidget(mockRisks))
    expect(res.locals.tierCalculation).toEqual(mockTierCalculation)
    expect(res.locals.predictorScores).toEqual(toPredictors(mockPredictors))
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
      mockArnsApiClient as unknown as ArnsApiClient,
      mockTierApiClient as unknown as TierApiClient,
      mockArnsComponents as unknown as ArnsComponents,
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
      mockArnsApiClient as unknown as ArnsApiClient,
      mockTierApiClient as unknown as TierApiClient,
      mockArnsComponents as unknown as ArnsComponents,
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
      mockArnsApiClient as unknown as ArnsApiClient,
      mockTierApiClient as unknown as TierApiClient,
      mockArnsComponents as unknown as ArnsComponents,
    )(req, res, nextSpy)

    const expected = {
      personalDetails: {
        X000002: mockSession('X000002'),
      },
    }

    expect((req.session as any).data).toEqual(expected)

    expect(mockMasApiClient.getPersonalDetails).toHaveBeenCalledWith(req.params.crn, 'user-1')
    expect(mockTierApiClient.getCalculationDetails).toHaveBeenCalledWith(req.params.crn, 'user-1')
    expect(mockArnsApiClient.getRisks).toHaveBeenCalledWith(req.params.crn, 'user-1')
    expect(mockArnsApiClient.getPredictorsAll).toHaveBeenCalledWith(req.params.crn, 'user-1')
    expect(mockArnsComponents.getRiskData).toHaveBeenCalled()

    expect(res.locals.case).toEqual(overview('X000002'))
    expect(res.locals.risksWidget).toEqual(toRoshWidget(mockRisks))
    expect(res.locals.tierCalculation).toEqual(mockTierCalculation)
    expect(res.locals.predictorScores).toEqual(toPredictors(mockPredictors))
    expect(res.locals.headerPersonName).toEqual({ forename: 'Caroline', surname: 'Wolff' })
    expect(res.locals.headerCRN).toEqual(req.params.crn)
    expect(res.locals.headerDob).toEqual('1979-08-18')
    expect(res.locals.headerTierLink).toEqual('https://tier-dev.hmpps.service.justice.gov.uk/case/X000002')

    expect(nextSpy).toHaveBeenCalled()
  })
})
