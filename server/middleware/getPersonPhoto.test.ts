import httpMocks from 'node-mocks-http'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { MPoPComponents } from '@ministryofjustice/hmpps-mpop-frontend-components-lib'
import { getPersonPhoto } from './getPersonPhoto'

const hmppsAuthClient = { getToken: jest.fn().mockResolvedValue('token') } as unknown as AuthenticationClient
const mpopComponents = { sendPersonPhoto: jest.fn() } as unknown as jest.Mocked<MPoPComponents>
const next = jest.fn()

const createRes = (flags = { enablePersonHeader: true, enablePersonHeaderPhoto: true }) =>
  httpMocks.createResponse({ locals: { flags, user: { username: 'user-1' } } })

const run = (res: httpMocks.MockResponse<any>) =>
  getPersonPhoto(hmppsAuthClient, mpopComponents)(
    httpMocks.createRequest({ params: { nomsNumber: 'A1234BC' } }),
    res,
    next,
  )

describe('middleware/getPersonPhoto', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('sends the photo from the lib', async () => {
    const res = createRes()

    await run(res)

    expect(hmppsAuthClient.getToken).toHaveBeenCalledWith('user-1')
    expect(mpopComponents.sendPersonPhoto).toHaveBeenCalledWith('token', 'A1234BC', res)
  })

  it.each([
    { enablePersonHeader: false, enablePersonHeaderPhoto: true },
    { enablePersonHeader: true, enablePersonHeaderPhoto: false },
  ])('returns a 404 without requesting the photo when the photo is switched off: %o', async flags => {
    const res = createRes(flags)

    await run(res)

    expect(mpopComponents.sendPersonPhoto).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(404)
  })
})
