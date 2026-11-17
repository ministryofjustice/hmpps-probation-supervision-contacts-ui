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
    const prisonApiClient = {}
    const router = Router()
    addPersonHeaderRoutes(router, { prisonApiClient } as unknown as Services)

    const response = await request(express().use(router)).get('/search/prisoner-image/A1234BC')

    expect(controllers.personHeader.getPhoto).toHaveBeenCalledWith(prisonApiClient)
    expect(response.text).toEqual('photo')
  })
})
