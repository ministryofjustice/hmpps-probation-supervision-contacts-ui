import httpMocks from 'node-mocks-http'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { MPoPComponents } from '@ministryofjustice/hmpps-mpop-frontend-components-lib'
import { getPersonRiskFlags } from './getPersonRiskFlags'
import { PersonRiskFlags, RiskFlag } from '../data/model/risk'

const hmppsAuthClient = { getToken: jest.fn().mockResolvedValue('token') } as unknown as AuthenticationClient
const mpopComponents = { getPersonRiskFlags: jest.fn() } as unknown as jest.Mocked<MPoPComponents>

const nextSpy = jest.fn()
const crn = 'X000001'

const riskFlag = (overrides: Partial<RiskFlag>): RiskFlag =>
  ({
    id: 1,
    description: 'Risk to Staff',
    level: 'HIGH',
    levelDescription: 'High',
    mostRecentReviewDate: '2026-10-01',
    removed: false,
    removalHistory: [],
    ...overrides,
  }) as RiskFlag

const mockRisks = (overrides: Partial<PersonRiskFlags> = {}): PersonRiskFlags => ({
  personSummary: { name: { forename: 'James', surname: 'Morrison' }, crn, dateOfBirth: '' },
  opd: {},
  mappa: {},
  riskFlags: [
    riskFlag({ id: 1, description: 'Risk to Staff', levelDescription: 'Medium' }),
    riskFlag({ id: 2, description: 'High RoSH', levelDescription: 'High' }),
    riskFlag({ id: 3, description: 'Risk to Probation Staff', level: 'HIGH' }),
  ],
  removedRiskFlags: [riskFlag({ id: 4, description: 'Removed RoSH flag', removed: true })],
  ...overrides,
})

const createRequest = (risks?: PersonRiskFlags) =>
  httpMocks.createRequest({
    params: { crn },
    session: { data: risks ? { risks: { [crn]: risks } } : {} },
  })

const createResponse = ({ enableNDeliusRosh = true, enablePersonHeader = false } = {}) =>
  httpMocks.createResponse({
    locals: {
      flags: { enableNDeliusRosh, enablePersonHeader },
      user: { username: 'testuser' },
    },
  })

const apiResponse = (personRiskFlags: PersonRiskFlags | null, httpStatus = 200, error?: Error) => ({
  personRiskFlags,
  httpStatus,
  error,
})

const run = (req: httpMocks.MockRequest<any>, res: httpMocks.MockResponse<any>) =>
  getPersonRiskFlags(hmppsAuthClient, mpopComponents)(req, res, nextSpy)

describe('middleware/getPersonRiskFlags', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mpopComponents.getPersonRiskFlags.mockResolvedValue(apiResponse(mockRisks()))
  })

  it('does not request the risk flags when enableNDeliusRosh and enablePersonHeader are off', async () => {
    const res = createResponse({ enableNDeliusRosh: false, enablePersonHeader: false })

    await run(createRequest(), res)

    expect(mpopComponents.getPersonRiskFlags).not.toHaveBeenCalled()
    expect(res.locals.personRisks).toBeUndefined()
    expect(nextSpy).toHaveBeenCalledTimes(1)
  })

  describe('risks session does not exist for current crn', () => {
    it('requests the risk flags from the api and caches the response in the session', async () => {
      const req = createRequest()

      await run(req, createResponse())

      expect(hmppsAuthClient.getToken).toHaveBeenCalledWith('testuser')
      expect(mpopComponents.getPersonRiskFlags).toHaveBeenCalledWith('token', crn)
      expect(req.session.data.risks[crn]).toEqual(mockRisks())
      expect(nextSpy).toHaveBeenCalledTimes(1)
    })

    it('renames RoSH to ROSH in the risk flags and removed risk flags', async () => {
      const res = createResponse()

      await run(createRequest(), res)

      expect(res.locals.personRisks.riskFlags[1].description).toBe('High ROSH')
      expect(res.locals.personRisks.removedRiskFlags[0].description).toBe('Removed ROSH flag')
    })

    it('clears the level on the Risk to Probation Staff flag', async () => {
      const res = createResponse()

      await run(createRequest(), res)

      expect(res.locals.personRisks.riskFlags[2].level).toBeUndefined()
      expect(res.locals.riskToProbationStaff).toEqual({ id: 3 })
    })

    it('sets the risk badge data', async () => {
      const res = createResponse()

      await run(createRequest(), res)

      expect(res.locals.riskBadgeData.headerBadges.length).toBeGreaterThan(0)
    })

    it('throws when the api returns an error', async () => {
      const error = new Error('Server error')
      mpopComponents.getPersonRiskFlags.mockResolvedValue(apiResponse(null, 500, error))
      const req = createRequest()

      await expect(run(req, createResponse())).rejects.toBe(error)
      expect(req.session.data.risks).toBeUndefined()
      expect(nextSpy).not.toHaveBeenCalled()
    })
  })

  describe('risks session exists for current crn', () => {
    it('uses the session value without calling the api', async () => {
      const res = createResponse()

      await run(
        createRequest(
          mockRisks({ personSummary: { name: { forename: 'Cached', surname: 'Person' }, crn, dateOfBirth: '' } }),
        ),
        res,
      )

      expect(mpopComponents.getPersonRiskFlags).not.toHaveBeenCalled()
      expect(res.locals.personRisks.personSummary.name.forename).toBe('Cached')
      expect(res.locals.riskToStaff).toStrictEqual({ id: 1, level: 'MEDIUM' })
      expect(nextSpy).toHaveBeenCalledTimes(1)
    })
  })

  it('sets the risk to staff level to VERY_HIGH when it is Very High', async () => {
    mpopComponents.getPersonRiskFlags.mockResolvedValue(
      apiResponse(mockRisks({ riskFlags: [riskFlag({ id: 1, levelDescription: 'Very High' })] })),
    )
    const res = createResponse()

    await run(createRequest(), res)

    expect(res.locals.riskToStaff).toStrictEqual({ id: 1, level: 'VERY_HIGH' })
  })

  it('does not set risk badge data when there are no risk flags', async () => {
    mpopComponents.getPersonRiskFlags.mockResolvedValue(apiResponse(mockRisks({ riskFlags: undefined })))
    const res = createResponse()

    await run(createRequest(), res)

    expect(res.locals.riskBadgeData).toBeUndefined()
  })

  it('sets the NDelius ROSH level when enableNDeliusRosh is enabled', async () => {
    const res = createResponse()

    await run(createRequest(), res)

    expect(res.locals.rosh).toEqual({ level: 'HIGH', assessedOn: '2026-10-01' })
  })

  it('does not set a NDelius ROSH level from a removed ROSH flag', async () => {
    mpopComponents.getPersonRiskFlags.mockResolvedValue(
      apiResponse(
        mockRisks({
          riskFlags: [],
          removedRiskFlags: [riskFlag({ id: 4, description: 'High RoSH', removed: true })],
        }),
      ),
    )
    const res = createResponse()

    await run(createRequest(), res)

    expect(res.locals.rosh).toEqual({ level: null, assessedOn: null })
  })

  it('requests the risk flags for the header without setting the NDelius ROSH when only enablePersonHeader is on', async () => {
    const res = createResponse({ enableNDeliusRosh: false, enablePersonHeader: true })

    await run(createRequest(), res)

    expect(mpopComponents.getPersonRiskFlags).toHaveBeenCalledWith('token', crn)
    expect(res.locals.personRisks).toBeDefined()
    expect(res.locals.rosh).toBeUndefined()
    expect(nextSpy).toHaveBeenCalledTimes(1)
  })
})
