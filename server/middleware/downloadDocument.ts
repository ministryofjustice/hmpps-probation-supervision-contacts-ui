import type { RequestHandler } from 'express'
import JSZip from 'jszip'
import MasApiClient from '../data/masApiClient'

export const downloadDocument = (masApiClient: MasApiClient): RequestHandler => {
  return async (req, res) => {
    if (res.locals.flags?.enableEarlyTermination20261103Squad3 !== true) {
      return res.status(404)?.json({ error: 'Document not found' })
    }
    try {
      const { username } = res.locals.user
      const document = await masApiClient.getDocument(
        req.params.contactType as string,
        req.params.name as string,
        username,
      )
      if (!document?.body) {
        return res.status(404).json({ error: 'Document not found' })
      }
      const zip = await JSZip.loadAsync(document.body as unknown as ArrayBuffer)
      const contentTypesPath = '[Content_Types].xml'
      const contentTypesFile = zip.file(contentTypesPath)
      let contentTypesXml = await contentTypesFile.async('text')
      const dotxType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml'
      const docxType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml'
      if (contentTypesXml.includes(dotxType)) {
        contentTypesXml = contentTypesXml.replace(dotxType, docxType)
        zip.file(contentTypesPath, contentTypesXml)
      }
      const docxBuffer = await zip.generateAsync({ type: 'nodebuffer' })
      const newFilename = `${req.params.name}.docx`
      res.setHeader('Content-Disposition', `attachment; filename="${newFilename}"`)
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
      return res.send(docxBuffer)
    } catch (error) {
      return res.status(500)?.json({ error: error.message })
    }
  }
}
