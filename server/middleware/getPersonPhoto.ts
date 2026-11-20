import type { RequestHandler } from 'express'
import { pipeline } from 'node:stream/promises'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { MPoPComponents } from '@ministryofjustice/hmpps-mpop-frontend-components-lib'

export const personPhotoHref = (nomsNumber: string) => `/person-photo/${encodeURIComponent(nomsNumber)}`

export const getPersonPhoto = (
  hmppsAuthClient: AuthenticationClient,
  mpopComponents: MPoPComponents,
): RequestHandler => {
  return async function getPersonPhotoInner(req, res) {
    if (!res.locals.flags?.enablePersonHeader || !res.locals.flags?.enablePersonHeaderPhoto) {
      res.sendStatus(404)
      return
    }
    const token = await hmppsAuthClient.getToken(res.locals.user.username)
    const { photo } = await mpopComponents.getPersonPhoto(token, req.params.nomsNumber as string)

    if (!photo) {
      res.sendStatus(404)
      return
    }
    res.set('Cache-Control', 'private, max-age=86400')
    res.removeHeader('pragma')
    res.type('image/jpeg')
    await pipeline(photo, res)
  }
}
