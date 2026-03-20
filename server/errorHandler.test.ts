import type { Express } from 'express'
import express from 'express'
import request from 'supertest'
import nunjucksSetup from './utils/nunjucksSetup'
import errorHandler from './errorHandler'
import { appWithAllRoutes } from './routes/testutils/appSetup'
import type { HmppsUser } from './interfaces/hmppsUser'

function appWith500Route(production: boolean): Express {
  const app = express()
  app.set('view engine', 'njk')
  nunjucksSetup(app)
  app.use((req, res, next) => {
    res.locals = { user: { username: 'test-user' } as HmppsUser }
    next()
  })
  app.get('/boom', () => {
    throw new Error('something went wrong')
  })
  app.use(errorHandler(production))
  return app
}

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({})
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET 404', () => {
  it('should render content with stack in dev mode', () => {
    return request(app)
      .get('/unknown')
      .expect(404)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
        expect(res.text).toContain('NotFoundError: Not Found')
      })
  })

  it('should render content without stack in production mode', () => {
    return request(appWithAllRoutes({ production: true }))
      .get('/unknown')
      .expect(404)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
        expect(res.text).not.toContain('NotFoundError: Not Found')
      })
  })
})

describe('GET 500', () => {
  it('should render title and stack in dev mode', () => {
    return request(appWith500Route(false))
      .get('/boom')
      .expect(500)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Sorry, there is a problem with the service')
        expect(res.text).toContain('something went wrong')
      })
  })

  it('should render title without stack in production mode', () => {
    return request(appWith500Route(true))
      .get('/boom')
      .expect(500)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Sorry, there is a problem with the service')
        expect(res.text).not.toContain('something went wrong')
      })
  })
})
