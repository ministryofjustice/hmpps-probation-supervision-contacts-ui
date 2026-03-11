import { Request, Response, NextFunction } from 'express'
import multer, { MulterError } from 'multer'
import config from '../../config'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.maxFileSize as number,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    if (
      !Object.entries(config.validMimeTypes)
        .map(([_k, v]) => v)
        .includes(file.mimetype)
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
            [field]: 'Only PDF or Word files are allowed',
          }
        }
      }
      return next()
    })
  }
}
