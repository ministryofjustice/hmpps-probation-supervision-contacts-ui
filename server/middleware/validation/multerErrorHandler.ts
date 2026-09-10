import { Request, Response, NextFunction } from 'express'
import multer, { MulterError } from 'multer'
import path from 'path'
import config from '../../config'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.maxFileSize as number,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const validMimeTypes = Object.values(config.validMimeTypes)

    if (!validMimeTypes.includes(file.mimetype)) {
      return cb(new MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname))
    }
    if (
      file.mimetype === config.validMimeTypes.jpeg &&
      path.extname(file.originalname).toLowerCase() !== config.validFileExtensions.jpeg
    ) {
      return cb(new MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname))
    }

    return cb(null, true)
  },
})

export const multerErrorHandler = (field: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    upload.single(field)(req, res, err => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          res.locals.errorMessages = {
            [field]: 'File size must be 5mb or under',
          }
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          res.locals.errorMessages = {
            [field]: 'Only PDF, Word or JPEG files are allowed',
          }
        }
      }
      return next()
    })
  }
}
