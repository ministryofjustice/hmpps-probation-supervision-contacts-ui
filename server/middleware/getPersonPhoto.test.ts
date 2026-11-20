import httpMocks from 'node-mocks-http'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { MPoPComponents } from '@ministryofjustice/hmpps-mpop-frontend-components-lib'
import { getPersonPhoto, personPhotoHref } from './getPersonPhoto'

jest.mock('node:stream/promises', () => ({ pipeline: jest.fn().mockResolvedValue(undefined) }))

const hmppsAuthClient = { getToken: jest.fn().mockResolvedValue('token') } as unknown as AuthenticationClient
const mpopComponents = { getPersonPhoto: jest.fn() } as unknown as jest.Mocked<MPoPComponents>
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

  it('builds the person photo href', () => {
    expect(personPhotoHref('A1234 BC')).toBe('/person-photo/A1234%20BC')
  })

  it('streams the photo from the lib as a jpeg', async () => {
    const photo = Readable.from(['image'])
    mpopComponents.getPersonPhoto.mockResolvedValue({ photo, httpStatus: 200 })
    const res = createRes()
    const setSpy = jest.spyOn(res, 'set')
    const typeSpy = jest.spyOn(res, 'type')

    await run(res)

    expect(hmppsAuthClient.getToken).toHaveBeenCalledWith('user-1')
    expect(mpopComponents.getPersonPhoto).toHaveBeenCalledWith('token', 'A1234BC')
    expect(setSpy).toHaveBeenCalledWith('Cache-Control', 'private, max-age=86400')
    expect(typeSpy).toHaveBeenCalledWith('image/jpeg')
    expect(pipeline).toHaveBeenCalledWith(photo, res)
  })

  it('returns a 404 when there is no photo', async () => {
    mpopComponents.getPersonPhoto.mockResolvedValue({ photo: null, httpStatus: 404 })
    const res = createRes()

    await run(res)

    expect(res.statusCode).toBe(404)
    expect(pipeline).not.toHaveBeenCalled()
  })

  it.each([
    { enablePersonHeader: false, enablePersonHeaderPhoto: true },
    { enablePersonHeader: true, enablePersonHeaderPhoto: false },
  ])('returns a 404 without requesting the photo when the photo is switched off: %o', async flags => {
    const res = createRes(flags)

    await run(res)

    expect(mpopComponents.getPersonPhoto).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(404)
  })
})
