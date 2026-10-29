import { Readable } from 'stream'
import { pipeline } from 'stream/promises'
import httpMocks from 'node-mocks-http'
import PersonRecordApiClient from '../data/personRecordApiClient'
import personHeaderController from './personHeader'

jest.mock('stream/promises', () => ({ pipeline: jest.fn() }))

describe('personHeaderController', () => {
  const mockPrisonApiClient = { getImageData: jest.fn() } as unknown as jest.Mocked<PersonRecordApiClient>
  const next = jest.fn()

  const createResponse = (enablePersonHeader: boolean, enablePersonHeaderPhoto = true) =>
    httpMocks.createResponse({
      locals: { user: { username: 'user-1' }, flags: { enablePersonHeader, enablePersonHeaderPhoto } },
    })

  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('getPhoto', () => {
    it('streams the prisoner image when the person header is enabled', async () => {
      const imageData = Readable.from([Buffer.from('image-data')])
      mockPrisonApiClient.getImageData.mockResolvedValue(imageData)
      const req = httpMocks.createRequest({ params: { prisonerId: 'A1234BC' } })
      const res = createResponse(true)

      await personHeaderController.getPhoto(mockPrisonApiClient)(req, res, next)

      expect(mockPrisonApiClient.getImageData).toHaveBeenCalledWith('A1234BC', 'user-1')
      expect(res.getHeader('Cache-Control')).toEqual('private, max-age=86400')
      expect(res.getHeader('Content-Type')).toContain('image/jpeg')
      expect(pipeline).toHaveBeenCalledWith(imageData, res)
    })

    it('returns not found when there is no image', async () => {
      mockPrisonApiClient.getImageData.mockResolvedValue(null)
      const req = httpMocks.createRequest({ params: { prisonerId: 'A1234BC' } })
      const res = createResponse(true)

      await personHeaderController.getPhoto(mockPrisonApiClient)(req, res, next)

      expect(res.statusCode).toEqual(404)
    })

    it('does not call the prison api when the person header photo is disabled', async () => {
      const req = httpMocks.createRequest({ params: { prisonerId: 'A1234BC' } })
      const res = createResponse(true, false)

      await personHeaderController.getPhoto(mockPrisonApiClient)(req, res, next)

      expect(mockPrisonApiClient.getImageData).not.toHaveBeenCalled()
      expect(pipeline).not.toHaveBeenCalled()
      expect(res.statusCode).toEqual(404)
    })

    it('does not call the prison api when the person header is disabled', async () => {
      const req = httpMocks.createRequest({ params: { prisonerId: 'A1234BC' } })
      const res = createResponse(false)

      await personHeaderController.getPhoto(mockPrisonApiClient)(req, res, next)

      expect(mockPrisonApiClient.getImageData).not.toHaveBeenCalled()
      expect(pipeline).not.toHaveBeenCalled()
      expect(res.statusCode).toEqual(404)
    })
  })
})
