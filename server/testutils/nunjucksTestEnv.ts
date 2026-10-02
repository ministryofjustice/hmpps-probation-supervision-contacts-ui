import nunjucks from 'nunjucks'
import path from 'path'
import { Request, Response } from 'express-serve-static-core'
import { arnsNunjucksSetup } from '@ministryofjustice/hmpps-arns-frontend-components-lib'
import { mpopNunjucksSetup } from '@ministryofjustice/hmpps-mpop-frontend-components-lib'
import { convertToTitleCase } from '../utils/convertToTitleCase'
import { dateWithYear } from '../utils/dateWithYear'
import { deliusDeepLinkUrl } from '../utils/deliusDeepLinkUrl'
import { govukTime } from '../utils/govukTime'
import { toSentenceCase } from '../utils/toSentenceCase'
import { yearsSince } from '../utils/yearsSince'
import { dateWithDayAndWithYear } from '../utils/dateWithDayAndWithYear'

export const createNunjucksTestEnv = (req?: Request, res?: Response) => {
  const env = nunjucks.configure(
    [
      path.join(__dirname, '../views'),
      'node_modules/govuk-frontend/dist',
      'node_modules/govuk-frontend/dist/components',
      'node_modules/@ministryofjustice/frontend',
      'node_modules/@ministryofjustice/frontend/moj/components',
      'node_modules/@ministryofjustice/probation-search-frontend/components',
      'node_modules/@ministryofjustice/hmpps-arns-frontend-components-lib/dist',
      'node_modules/@ministryofjustice/hmpps-mpop-frontend-components-lib/dist',
    ],
    {
      autoescape: true,
      noCache: true,
    },
  )

  env.addGlobal('deliusDeepLinkUrl', deliusDeepLinkUrl)
  env.addFilter('dateWithYear', dateWithYear)
  env.addFilter('dateWithDayAndWithYear', dateWithDayAndWithYear)
  env.addFilter('yearsSince', yearsSince)
  env.addFilter('toSentenceCase', toSentenceCase)
  env.addFilter('govukTime', govukTime)
  env.addFilter('convertToTitleCase', convertToTitleCase)
  arnsNunjucksSetup(env)
  mpopNunjucksSetup(env)
  return env
}
