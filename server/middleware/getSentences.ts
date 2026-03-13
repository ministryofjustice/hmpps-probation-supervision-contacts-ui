import type { RequestHandler } from 'express'
import MasApiClient from '../data/masApiClient'
import { Sentence } from '../data/model/contacts'

export const getSentences = (masApiClient: MasApiClient): RequestHandler => {
  return async (req, res, next) => {
    try {
      const number = (req?.query?.number as string) || ''
      const crn = req.params.crn as string
      const { username } = res.locals.user
      const includeRarRequirements = false
      let sentences: Sentence[]
      const sessionData = (req.session as any).data
      if (!sessionData?.sentences?.[crn]) {
        sentences = await masApiClient.getSentences(crn, username, number, includeRarRequirements)
        ;(req.session as any).data = {
          ...(sessionData ?? {}),
          sentences: { ...(sessionData?.sentences ?? {}), [crn]: sentences },
        }
      } else {
        sentences = sessionData.sentences[crn]
      }
      res.locals.sentences = sentences
      next()
    } catch (error) {
      next(error)
    }
  }
}
