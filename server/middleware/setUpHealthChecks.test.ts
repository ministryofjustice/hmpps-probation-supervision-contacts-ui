import express, { NextFunction, Request, Response } from 'express'
import request from 'supertest'
import setUpHealthChecks from './setUpHealthChecks'
import type { ApplicationInfo } from '../applicationInfo'

const applicationInfo = {
  applicationName: 'test-app',
  buildNumber: '1',
  gitRef: 'abc',
  gitShortHash: 'abc',
  branchName: 'main',
} as ApplicationInfo

describe('setUpHealthChecks', () => {
  let app: express.Express

  beforeEach(() => {
    app = express()
    app.use(setUpHealthChecks(applicationInfo))
    app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
      res.status(500).json({ message: error.message })
    })
  })

  it('responds to /ping', async () => {
    const res = await request(app).get('/ping')

    expect(res.status).toBe(200)
  })

  it('responds to /info', async () => {
    const res = await request(app).get('/info')

    expect(res.status).toBe(200)
  })

  it('raises a 500 error from /debug-sentry', async () => {
    const res = await request(app).get('/debug-sentry')

    expect(res.status).toBe(500)
    expect(res.body).toEqual({ message: 'Sentry debug error' })
  })
})
