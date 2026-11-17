import type { RequestHandler } from 'express'
import createError from 'http-errors'
import { ArnsComponents } from '@ministryofjustice/hmpps-arns-frontend-components-lib'
import { asUser } from '@ministryofjustice/hmpps-rest-client'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import MasApiClient from '../data/masApiClient'
import TierApiClient from '../data/tierApiClient'
import PrisonApiClient from '../data/prisonApiClient'
import { tierLink, tierUrlV3 } from '../utils/tierLink'
import { getManagedByDetails } from '../utils/getManagedByDetails'
import { getPrisonerDetails, getStatusTag } from '../utils/personStatusTag'
import type { PersonalDetailsCache } from '../@types/express'
import logger from '../../logger'

export const getPersonalDetails = (
  masApiClient: MasApiClient,
  tierApiClient: TierApiClient,
  arnsComponents: ArnsComponents,
  prisonApiClient: PrisonApiClient,
  hmppsAuthClient: AuthenticationClient,
): RequestHandler => {
  return async (req, res, next) => {
    const crn = req.params.crn as string
    const { username } = res.locals.user
    const enablePersonHeader = res.locals.flags?.enablePersonHeader === true
    const enablePersonHeaderPhoto = enablePersonHeader && res.locals.flags?.enablePersonHeaderPhoto === true
    let arnsUnavailable = false
    let prisonsUnavailable = false
    const isolateArnsFailure = <T>(promise: Promise<T>): Promise<T | null> =>
      enablePersonHeader
        ? promise.catch((): null => {
            arnsUnavailable = true
            return null
          })
        : promise

    const sessionData = req.session.data
    const personalDetails = sessionData?.personalDetails?.[crn]

    let data: PersonalDetailsCache

    logger.debug(
      {
        cache: personalDetails ? 'hit' : 'miss',
      },
      'Personal details cache',
    )

    const authOptions = asUser(res.locals.user.token)

    if (personalDetails?.riskData && personalDetails?.roshData) {
      data = personalDetails
    } else if (personalDetails) {
      const [riskData, roshData] = await Promise.all([
        personalDetails.riskData ?? isolateArnsFailure(arnsComponents.getRiskData(authOptions, 'crn', crn)),
        personalDetails.roshData ?? isolateArnsFailure(arnsComponents.getRoshData(authOptions, crn)),
      ])

      data = {
        ...personalDetails,
        riskData,
        roshData,
      }

      req.session.data = {
        ...(sessionData ?? {}),
        personalDetails: {
          ...(sessionData?.personalDetails ?? {}),
          [crn]: data,
        },
      }
    } else {
      const [overview, tierCalculation, riskData, roshData] = await Promise.all([
        masApiClient.getPersonalDetails(crn, username),
        tierApiClient.getCalculationDetails(crn, username),
        isolateArnsFailure(arnsComponents.getRiskData(authOptions, 'crn', crn)),
        isolateArnsFailure(arnsComponents.getRoshData(authOptions, crn)),
      ])

      if (!overview) {
        return next(createError(404, 'Not found'))
      }

      data = {
        overview,
        tierCalculation,
        riskData,
        roshData,
      }

      req.session.data = {
        ...(sessionData ?? {}),
        personalDetails: {
          ...(sessionData?.personalDetails ?? {}),
          [crn]: data,
        },
      }
    }

    if (enablePersonHeader) {
      const cache = () => {
        req.session.data = {
          ...(req.session.data ?? {}),
          personalDetails: {
            ...(req.session.data?.personalDetails ?? {}),
            [crn]: data,
          },
        }
      }

      if (data.riskData && data.riskData.httpStatus !== 200 && data.riskData.httpStatus !== 404) {
        arnsUnavailable = true
        data = { ...data, riskData: null }
        cache()
      }

      if (data.roshData && data.roshData.httpStatus !== 200 && data.roshData.httpStatus !== 404) {
        arnsUnavailable = true
        data = { ...data, roshData: null }
        cache()
      }

      // Managed by and the photo are only needed by the person-header, so fetch them once it is enabled.
      // The photo can be switched off on its own with enablePersonHeaderPhoto. No image is cached as null rather
      // than undefined, as undefined values are dropped when the session is serialised to JSON and the photo
      // would then be looked up again on every request.
      const fetchManagedBy = data.professionalContact === undefined
      const fetchPhoto = enablePersonHeaderPhoto && data.personPhotoSrc === undefined
      if (fetchManagedBy || fetchPhoto) {
        const { noms } = data.overview
        const [professionalContact, photoData] = await Promise.all([
          fetchManagedBy ? masApiClient.getContacts(crn, username).catch((): null => null) : data.professionalContact,
          fetchPhoto && noms
            ? prisonApiClient.getImageData(noms, username).catch((): null => {
                prisonsUnavailable = true
                return null
              })
            : null,
        ])
        photoData?.destroy()
        data = { ...data, professionalContact }
        if (fetchPhoto && !prisonsUnavailable) {
          data = {
            ...data,
            personPhotoSrc: photoData ? `/search/prisoner-image/${encodeURIComponent(noms)}` : null,
          }
        }
        cache()
      }

      res.locals.managedBy = getManagedByDetails(crn, data.professionalContact ?? null)
      res.locals.personPhotoSrc = (enablePersonHeaderPhoto && data.personPhotoSrc) || undefined
      const roshAssessment = data.roshData?.assessment
      res.locals.risksWidget = roshAssessment?.overallRisk
        ? {
            overallRisk: roshAssessment.overallRisk,
            assessedOn: roshAssessment.completedDate ?? undefined,
            risks: roshAssessment.risks,
          }
        : { overallRisk: 'NOT_FOUND', assessedOn: undefined, risks: undefined }
      res.locals.arnsUnavailable = arnsUnavailable
      res.locals.prisonsUnavailable = prisonsUnavailable
    }

    const { overview } = data
    if (res.locals.flags?.enablePersonHeader) {
      if (overview.noms) {
        const token = await hmppsAuthClient.getToken(username)
        res.locals.prisoner = await getPrisonerDetails(token, overview.noms, overview.crn)
      }
      res.locals.personStatusTag = await getStatusTag(
        overview,
        res.locals.supervisionPackageDetails,
        res.locals.prisoner,
      )
    }

    res.locals.case = data.overview
    res.locals.riskData = data.riskData
    res.locals.roshData = data.roshData
    res.locals.tierCalculation = data.tierCalculation
    res.locals.headerPersonName = {
      forename: data.overview.name.forename,
      surname: data.overview.name.surname,
    }
    res.locals.headerCRN = crn
    res.locals.headerDob = data.overview.dateOfBirth
    res.locals.headerTierLink = tierLink(crn)
    res.locals.headerTierUrlV3 = tierUrlV3(crn)

    if (data.overview.dateOfDeath) {
      res.locals.dateOfDeath = data.overview.dateOfDeath
    }

    return next()
  }
}
