import httpMocks from 'node-mocks-http'
import { getPersonRiskFlags } from './getPersonRiskFlags'
import MasApiClient from '../data/masApiClient'
import { findReplace } from '../utils/findReplace'
import { setDataValue } from '../utils/setDataValue'
import { getStaffRisk } from '../utils/getStaffRisk'
import { PersonRiskFlags, RiskFlag } from '../data/model/risk'

jest.mock('../utils/findReplace', () => {
  return {
    findReplace: jest.fn(),
  }
})
jest.mock('../utils/setDataValue', () => {
  return {
    setDataValue: jest.fn(),
  }
})
jest.mock('../utils/getStaffRisk', () => {
  return {
    getStaffRisk: jest.fn(),
    getProbationRisk: jest.fn(),
  }
})

const getStaffRiskMock = getStaffRisk as jest.MockedFunction<typeof getStaffRisk>

getStaffRiskMock.mockReturnValue({ id: 1, description: 'Risk to Staff', levelDescription: 'Medium' } as RiskFlag)

const nextSpy = jest.fn()
const crn = 'X000001'

const mockRisks: PersonRiskFlags = {
  personSummary: { name: { forename: '', surname: '' }, crn, dateOfBirth: '' },
  opd: {},
  mappa: {},
  riskFlags: [],
  removedRiskFlags: [],
}

const mockSessionRisks: PersonRiskFlags = {
  ...mockRisks,
  personSummary: { ...mockRisks.personSummary, name: { forename: 'James', surname: 'Morrison' } },
}

const mockSetDataValue = setDataValue as jest.MockedFunction<typeof setDataValue>
const mockFindReplace = findReplace as jest.MockedFunction<typeof findReplace>

const mockFormattedRisks = {
  ...mockRisks,
  riskFlags: [
    { id: 1, description: 'Risk to Staff', levelDescription: 'Medium' },
    { id: 2, description: 'High ROSH', levelDescription: 'High' },
  ],
  removedRiskFlags: [{ id: 2, description: 'Removed ROSH flag' }],
} as Partial<PersonRiskFlags>

mockFindReplace.mockImplementation(() => mockFormattedRisks)

const getPersonRiskFlagsSpy = jest
  .spyOn(MasApiClient.prototype, 'getPersonRiskFlags')
  .mockImplementation(() => Promise.resolve(mockRisks))

const createResponse = ({ enableNDeliusRosh = true } = {}) =>
  httpMocks.createResponse({
    locals: {
      flags: {
        enableNDeliusRosh,
      },
      user: {
        username: 'testuser',
      },
    },
  })

const mockMasApiClient = { getPersonRiskFlags: jest.fn().mockResolvedValue(mockRisks) }

describe('middleware/getPersonRiskFlags', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  describe('feature flag is disabled', () => {
    it('should call next() without calling the API', async () => {
      const req = httpMocks.createRequest({
        params: {
          crn,
        },
        session: {
          data: {},
        },
      })
      const res = createResponse({ enableNDeliusRosh: false })
      await getPersonRiskFlags(mockMasApiClient as unknown as MasApiClient)(req, res, nextSpy)
      expect(nextSpy).toHaveBeenCalledTimes(1)
      expect(mockMasApiClient.getPersonRiskFlags).not.toHaveBeenCalled()
    })
  })

  describe('feature flag is enabled', () => {
    const res = createResponse()
    describe('risks session does not exist for current crn', () => {
      const req = httpMocks.createRequest({
        params: {
          crn,
        },
        session: {
          data: {},
        },
      })
      beforeEach(async () => {
        await getPersonRiskFlags(mockMasApiClient as unknown as MasApiClient)(req, res, nextSpy)
      })
      it('should request the risk flags from the api', async () => {
        expect(mockMasApiClient.getPersonRiskFlags).toHaveBeenCalledWith(crn, 'testuser')
      })

      it(`should find and replace RoSH with ROSH in the api response`, () => {
        expect(mockFindReplace).toHaveBeenCalledTimes(2)
        expect(mockFindReplace).toHaveBeenNthCalledWith(1, {
          data: mockRisks,
          path: ['riskFlags'],
          key: 'description',
          find: 'RoSH',
          replace: 'ROSH',
        })
        expect(mockFindReplace).toHaveBeenNthCalledWith(2, {
          data: expect.any(Object),
          path: ['removedRiskFlags'],
          key: 'description',
          find: 'RoSH',
          replace: 'ROSH',
        })
        expect(res.locals.personRisks).toEqual(mockFormattedRisks)
      })
      it('should add the response to to req.session.data.risks', () => {
        expect(mockSetDataValue).toHaveBeenCalledWith(req.session.data, ['risks', crn], mockFormattedRisks)
      })
      it('should set res.locals.personRisks to the api response', () => {
        expect(res.locals.personRisks).toEqual(mockFormattedRisks)
        expect(res.locals.rosh).toStrictEqual({ level: 'HIGH' })
      })
      it('should call next()', () => {
        expect(nextSpy).toHaveBeenCalledTimes(1)
      })
    })

    describe('risks session exists for current crn', () => {
      const mockRiskBadgeData = {
        remainingCount: 0,
      }

      const req = httpMocks.createRequest({
        params: {
          crn,
        },
        session: {
          data: {
            risks: {
              [crn]: mockSessionRisks,
            },
            riskBadgeData: {
              [crn]: mockRiskBadgeData,
            },
          },
        },
      })

      beforeEach(async () => {
        jest.clearAllMocks()

        await getPersonRiskFlags(mockMasApiClient as unknown as MasApiClient)(req, res, nextSpy)
      })

      it('should not request the risk flags from the api', () => {
        expect(getPersonRiskFlagsSpy).not.toHaveBeenCalled()
      })

      it('should not set the risks session', () => {
        expect(mockSetDataValue).not.toHaveBeenCalled()
      })

      it('should set res.locals.personRisks to the session value', () => {
        expect(res.locals.personRisks).toEqual(mockSessionRisks)
      })

      it('should set res.locals.riskToStaff to the expected value', () => {
        expect(res.locals.riskToStaff).toStrictEqual({
          id: 1,
          level: 'MEDIUM',
        })
      })

      it('should call next()', () => {
        expect(nextSpy).toHaveBeenCalledTimes(1)
      })
    })

    describe('Risk to staff level value is formatted as VERY HIGH', () => {
      const req = httpMocks.createRequest({
        params: {
          crn,
        },
        session: {
          data: {},
        },
      })
      beforeEach(async () => {
        getStaffRiskMock.mockImplementationOnce(
          () => ({ id: 1, description: 'Risk to Staff', levelDescription: 'VERY HIGH' }) as RiskFlag,
        )
        await getPersonRiskFlags(mockMasApiClient as unknown as MasApiClient)(req, res, nextSpy)
      })
      it('should set res.locals.riskToStaff level to VERY_HIGH', () => {
        expect(res.locals.riskToStaff).toStrictEqual({ id: 1, level: 'VERY_HIGH' })
      })
    })

    it('should not generate risk badge data when risk flags are not present', async () => {
      jest.spyOn(mockMasApiClient, 'getPersonRiskFlags').mockResolvedValueOnce({
        ...mockRisks,
        riskFlags: undefined,
      } as PersonRiskFlags)

      const req = httpMocks.createRequest({
        params: {
          crn,
        },
        session: {
          data: {},
        },
      })

      await getPersonRiskFlags(mockMasApiClient as unknown as MasApiClient)(req, res, nextSpy)

      expect(res.locals.riskBadgeData).toBeUndefined()

      expect(mockSetDataValue).toHaveBeenCalledWith(req.session.data, ['riskBadgeData', crn], undefined)
    })

    it('should assign NDelius Rosh values to res.locals.rosh', async () => {
      const req = httpMocks.createRequest({
        params: {
          crn,
        },
        session: {
          data: {},
        },
      })
      const mockRes = createResponse({ enableNDeliusRosh: true })
      await getPersonRiskFlags(mockMasApiClient as unknown as MasApiClient)(req, mockRes, nextSpy)
      expect(mockRes.locals.rosh).toEqual({ level: 'HIGH' })
    })
  })
})
