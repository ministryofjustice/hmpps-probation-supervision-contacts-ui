import express from 'express'
import request from 'supertest'
import setUpWebSecurity from './setUpWebSecurity'

describe('setUpWebSecurity', () => {
  const app = express().use(setUpWebSecurity())
  app.get('/', (_req, res) => {
    res.send('ok')
  })

  it('allows images from the S3 bucket used for online check-in photos', async () => {
    const response = await request(app).get('/')

    expect(response.headers['content-security-policy']).toContain(
      "img-src 'self' data: https://*.s3.eu-west-2.amazonaws.com/",
    )
  })

  it('sets a credentialless cross-origin embedder policy so check-in photos can load', async () => {
    const response = await request(app).get('/')

    expect(response.headers['cross-origin-embedder-policy']).toBe('credentialless')
  })
})
