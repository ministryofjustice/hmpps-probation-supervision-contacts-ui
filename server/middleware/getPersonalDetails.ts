import type { RequestHandler } from 'express'
import createError from 'http-errors'
import { ArnsComponents } from '@ministryofjustice/hmpps-arns-frontend-components-lib'
import { asUser } from '@ministryofjustice/hmpps-rest-client'
import { getStatusTag, MPoPComponents } from '@ministryofjustice/hmpps-mpop-frontend-components-lib'
import type { PersonHeaderPhoto } from '@ministryofjustice/hmpps-mpop-frontend-components-lib'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import MasApiClient from '../data/masApiClient'
import TierApiClient from '../data/tierApiClient'
import { personPhotoHref } from './getPersonPhoto'
import { tierLink } from '../utils/tierLink'
import type { PersonalDetailsCache } from '../@types/express'
import logger from '../../logger'

export const getPersonalDetails = (
  masApiClient: MasApiClient,
  tierApiClient: TierApiClient,
  arnsComponents: ArnsComponents,
  hmppsAuthClient: AuthenticationClient,
  mpopComponents: MPoPComponents,
): RequestHandler => {
  return async (req, res, next) => {
    const crn = req.params.crn as string
    const { username } = res.locals.user
    const enablePersonHeader = res.locals.flags?.enablePersonHeader === true
    const enablePersonHeaderPhoto = enablePersonHeader && res.locals.flags?.enablePersonHeaderPhoto === true
    let arnsUnavailable = false
    let photoUnavailable = false
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
      const { noms } = data.overview
      const fetchManagedBy = data.professionalContact === undefined
      let personHeaderPhoto: PersonHeaderPhoto | null = null
      if (fetchManagedBy || enablePersonHeaderPhoto) {
        const token = await hmppsAuthClient.getToken(username)
        const [professionalContact, photo] = await Promise.all([
          fetchManagedBy
            ? mpopComponents
                .getContacts(token, crn)
                .then(response => response.professionalContact as PersonalDetailsCache['professionalContact'])
            : data.professionalContact,
          enablePersonHeaderPhoto
            ? mpopComponents.getPersonHeaderPhoto(token, {
                crn,
                noms,
                prisonPhotoHref: personPhotoHref,
                hasPrisonPhoto: data.personPhotoSrc === undefined ? undefined : Boolean(data.personPhotoSrc),
              })
            : null,
        ])
        personHeaderPhoto = photo
        data = { ...data, professionalContact }
        if (photo?.hasPrisonPhoto !== undefined) {
          data = { ...data, personPhotoSrc: photo.hasPrisonPhoto ? personPhotoHref(noms) : null }
        }
        if (fetchManagedBy || photo?.hasPrisonPhoto !== undefined) {
          cache()
        }
      }

      res.locals.professionalContact = data.professionalContact ?? null
      res.locals.personPhotoSrc = personHeaderPhoto?.photo
      photoUnavailable = Boolean(personHeaderPhoto?.photoUnavailable)
      const roshAssessment = data.roshData?.assessment
      res.locals.risksWidget = roshAssessment?.overallRisk
        ? {
            overallRisk: roshAssessment.overallRisk,
            assessedOn: roshAssessment.completedDate ?? undefined,
            risks: roshAssessment.risks,
          }
        : { overallRisk: 'NOT_FOUND', assessedOn: undefined, risks: undefined }
      res.locals.arnsUnavailable = arnsUnavailable
      res.locals.photoUnavailable = photoUnavailable
    }

    const { overview } = data
    if (res.locals.flags?.enablePersonHeader) {
      if (overview.noms) {
        const token = await hmppsAuthClient.getToken(username)
        const { prisoner, error } = await mpopComponents.getPrisonerDetails(token, overview.noms)
        if (error) {
          logger.error(`Failed to get prisoner details for NOMS number: ${overview.noms} CRN: ${overview.crn}`, error)
        }
        res.locals.prisoner = prisoner ?? undefined
      }
      res.locals.personStatusTag = await getStatusTag(
        overview,
        res.locals.supervisionPackageDetails,
        res.locals.prisoner,
      )
      res.locals.statusUnavailable = !res.locals.personStatusTag && Boolean(res.locals.supervisionPackageUnavailable)
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

    if (data.overview.dateOfDeath) {
      res.locals.dateOfDeath = data.overview.dateOfDeath
    }

    return next()
  }
}
