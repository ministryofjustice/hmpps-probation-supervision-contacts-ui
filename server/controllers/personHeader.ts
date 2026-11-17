import type { RequestHandler } from 'express'
import { Readable } from 'stream'
import { pipeline } from 'stream/promises'
import PrisonApiClient from '../data/prisonApiClient'

const personHeaderController = {
  getPhoto: (prisonApiClient: PrisonApiClient): RequestHandler => {
    return async (req, res) => {
      let data: Readable | null = null
      const { prisonerId } = req.params as Record<string, string>
      if (prisonerId && res.locals.flags?.enablePersonHeader && res.locals.flags?.enablePersonHeaderPhoto) {
        data = await prisonApiClient.getImageData(prisonerId, res.locals.user.username)
      }

      if (data) {
        res.set('Cache-Control', 'private, max-age=86400')
        res.removeHeader('pragma')
        res.type('image/jpeg')
        await pipeline(data, res)
      } else {
        // No placeholder - the header doesn't show a photo when there isn't one or it's switched off
        res.sendStatus(404)
      }
    }
  },
}

export default personHeaderController
