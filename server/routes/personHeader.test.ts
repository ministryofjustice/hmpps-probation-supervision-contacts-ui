import express, { Router } from 'express'
import request from 'supertest'
import addPersonHeaderRoutes from './personHeader'
import type { Services } from '../services'
import controllers from '../controllers'

jest.mock('../controllers', () => ({
  __esModule: true,
  default: {
    personHeader: {
      getPhoto: jest.fn().mockReturnValue(jest.fn((_req, res) => res.send('photo'))),
    },
  },
}))

describe('personHeader routes', () => {
  it('serves the prisoner image from the photo controller', async () => {
    const personRecordApiClient = {}
    const router = Router()
    addPersonHeaderRoutes(router, { personRecordApiClient } as unknown as Services)

    const response = await request(express().use(router)).get('/search/prisoner-image/A1234BC')

    expect(controllers.personHeader.getPhoto).toHaveBeenCalledWith(personRecordApiClient)
    expect(response.text).toEqual('photo')
  })
})
