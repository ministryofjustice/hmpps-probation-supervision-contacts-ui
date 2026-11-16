import express from 'express'
import request from 'supertest'
import homeRoutes from './home'

describe('homeController', () => {
  describe('GET /sentry-test-error', () => {
    it('should throw an error and return 500', async () => {
      const app = express()
      const router = express.Router()

      homeRoutes(router)
      app.use(router)

      // basic error handler so Express returns 500 instead of crashing
      app.use((err: any, _req: any, response: any, _next: any) => {
        response.status(500).json({ message: err.message })
      })

      const response = await request(app).get('/sentry-test-error')

      expect(response.status).toBe(500)
      expect(response.body.message).toBe('Sentry alert test (Express) - ignore')
    })
  })
})
