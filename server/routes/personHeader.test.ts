import express, { Router } from 'express'
import request from 'supertest'
import addPersonHeaderRoutes from './personHeader'
import type { Services } from '../services'
import { getPersonPhoto } from '../middleware/getPersonPhoto'

jest.mock('../middleware/getPersonPhoto', () => ({
  getPersonPhoto: jest.fn().mockReturnValue(jest.fn((_req, res) => res.send('photo'))),
}))

describe('personHeader routes', () => {
  it('serves the person photo from the getPersonPhoto middleware', async () => {
    const hmppsAuthClient = {}
    const mpopComponents = {}
    const router = Router()
    addPersonHeaderRoutes(router, { hmppsAuthClient, mpopComponents } as unknown as Services)

    const response = await request(express().use(router)).get('/person-photo/A1234BC')

    expect(getPersonPhoto).toHaveBeenCalledWith(hmppsAuthClient, mpopComponents)
    expect(response.text).toEqual('photo')
  })
})
