import { Request, Response, NextFunction } from 'express'
import multer, { MulterError } from 'multer'
import config from '../../config'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    if (!Object.values(config.validMimeTypes).includes(file.mimetype)) {
      return cb(new MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname))
    }

    return cb(null, true)
  },
})

export const multerErrorHandler = (field: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    upload.single(field)(req, res, err => {
      if (err) {
        const existing = (res.locals.errorMessages || {}) as Record<string, string>

        if (err instanceof MulterError && err.code === 'LIMIT_UNEXPECTED_FILE') {
          res.locals.errorMessages = {
            ...existing,
            [field]: 'Only PDF or Word files are allowed',
          }

          return next()
        }

        return next(err)
      }

      return next()
    })
  }
}
