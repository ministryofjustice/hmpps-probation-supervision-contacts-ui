import type { RequestHandler } from 'express'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { MPoPComponents } from '@ministryofjustice/hmpps-mpop-frontend-components-lib'

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
    await mpopComponents.sendPersonPhoto(token, req.params.nomsNumber as string, res)
  }
}
