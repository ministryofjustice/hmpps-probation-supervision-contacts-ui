import express, { Router } from 'express'
import request from 'supertest'
import addMpopRedirectRoutes from './mpopRedirects'
import config from '../config'

const app = () => {
  const router = Router()
  addMpopRedirectRoutes(router)
  return express().use(router)
}

describe('mpopRedirects', () => {
  it.each([
    '/case/X000001',
    '/case',
    '/case/X000001/risk',
    '/case/X000001/risk/flag/5',
    '/case/X000001/personal-details/staff-contacts',
  ])('redirects %s to MPoP', async path => {
    const response = await request(app()).get(path)

    expect(response.status).toEqual(302)
    expect(response.headers.location).toEqual(`${config.manageProbationUrl}${path}`)
  })
})
