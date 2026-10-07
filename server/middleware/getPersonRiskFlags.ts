import type { RequestHandler } from 'express'
import MasApiClient from '../data/masApiClient'
import { PersonRiskFlags, RiskFlag, RiskFlagLevel, RiskScore } from '../data/model/risk'
import { getRiskBadgeGroups, RiskBadgeData } from '../utils/personRiskFlagSorter'
import { setDataValue } from '../utils/setDataValue'
import { findReplace } from '../utils/findReplace'
import { getStaffRisk, getProbationRisk } from '../utils/getStaffRisk'

export const getPersonRiskFlags = (masApiClient: MasApiClient): RequestHandler => {
  return async function getPersonRiskFlagsInner(req, res, next) {
    if (!res.locals?.flags?.enableNDeliusRosh) {
      return next()
    }
    const { crn } = req.params as Record<string, string>
    const { username } = res.locals.user
    let personRisks: PersonRiskFlags
    let riskBadgeData: RiskBadgeData
    if (!req.session?.data?.risks?.[crn]) {
      personRisks = await masApiClient.getPersonRiskFlags(crn, username)

      if (personRisks.riskFlags) {
        riskBadgeData = getRiskBadgeGroups(personRisks.riskFlags)
      }

      const term = 'RoSH'
      ;['riskFlags', 'removedRiskFlags'].forEach(path => {
        personRisks = findReplace<PersonRiskFlags, RiskFlag>({
          data: personRisks,
          path: [path],
          key: 'description',
          find: term,
          replace: term.toUpperCase(),
        })
      })
      const { data } = req.session
      setDataValue(data, ['risks', crn], personRisks)
      setDataValue(data, ['riskBadgeData', crn], riskBadgeData)
    } else {
      personRisks = req.session.data.risks[crn]
      riskBadgeData = req.session.data.riskBadgeData?.[crn] ?? getRiskBadgeGroups(personRisks.riskFlags ?? [])
    }
    const riskToStaff = getStaffRisk(personRisks.riskFlags)
    const riskToProbationStaff = getProbationRisk(personRisks.riskFlags)
    let riskToStaffLevel = riskToStaff?.levelDescription ?? riskToStaff?.level
    if (riskToStaffLevel?.toUpperCase() === 'VERY HIGH') {
      riskToStaffLevel = 'VERY_HIGH'
    }
    const level =
      riskToStaffLevel && ['VERY_HIGH', 'HIGH', 'MEDIUM'].includes(riskToStaffLevel.toUpperCase())
        ? (riskToStaffLevel.toUpperCase() as RiskScore)
        : null
    res.locals.riskToProbationStaff = riskToProbationStaff ? { id: riskToProbationStaff?.id } : undefined
    res.locals.riskToStaff = riskToStaff ? { id: riskToStaff?.id, level } : undefined
    personRisks.riskFlags = personRisks?.riskFlags?.map(item => {
      if (item.description === 'Risk to Probation Staff') {
        return {
          ...item,
          level: undefined,
        }
      }
      return item
    })

    const riskScore = personRisks.riskFlags
      ?.find(riskFlag => riskFlag.description.toLowerCase().includes('rosh'))
      ?.description?.toLowerCase()
      .replace('rosh', '')
      .trim()
      .toUpperCase() as RiskFlagLevel
    res.locals.rosh = {
      level: riskScore,
    }
    res.locals.personRisks = personRisks
    res.locals.riskBadgeData = riskBadgeData

    return next()
  }
}
