import type { RequestHandler } from 'express'
import path from 'node:path'
import MasApiClient from '../data/masApiClient'

export const downloadDocument = (masApiClient: MasApiClient): RequestHandler => {
  return async (req, res) => {
    try {
      const { username } = res.locals.user
      const document = await masApiClient.getDocument(
        req.params.contactType as string,
        req.params.name as string,
        username,
      )
      const originalName = path.parse(document.originalname).name
      const newFilename = `${originalName}.docx`
      res.setHeader('Content-Disposition', `attachment; filename="${newFilename}"`)
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
      res.send(document.buffer)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
}
