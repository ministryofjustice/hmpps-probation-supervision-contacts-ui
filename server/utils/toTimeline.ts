import { RiskScoresDto, TimelineItem } from '../data/model/risk'
import { dateWithYearShortMonthAndTime } from './dateWithYearShortMonthAndTime'
import { toDate } from './toDate'

export const toTimeline = (riskScores: RiskScoresDto[]): TimelineItem[] => {
  const sorted = [...riskScores].sort((a, b) => +toDate(b.completedDate) - +toDate(a.completedDate))
  return sorted.map(riskScore => {
    const scores = {
      RSR: {
        type: 'RSR',
        level: riskScore.output?.riskOfSeriousRecidivismScore?.scoreLevel,
        score: riskScore.output?.riskOfSeriousRecidivismScore?.percentageScore,
      },
      OGP: {
        type: 'OGP',
        level: riskScore.output?.generalPredictorScore?.ogpRisk,
        score: riskScore.output?.generalPredictorScore?.ogp1Year,
      },
      OSPC: {
        type: 'OSP/C',
        level:
          riskScore.output?.sexualPredictorScore?.ospContactScoreLevel ||
          riskScore.output?.sexualPredictorScore?.ospDirectContactScoreLevel,
        score:
          riskScore.output?.sexualPredictorScore?.ospContactPercentageScore ||
          riskScore.output?.sexualPredictorScore?.ospDirectContactPercentageScore,
      },
      OSPI: {
        type: 'OSP/I',
        level:
          riskScore.output?.sexualPredictorScore?.ospIndecentScoreLevel ||
          riskScore.output?.sexualPredictorScore?.ospIndirectImageScoreLevel,
        score:
          riskScore.output?.sexualPredictorScore?.ospIndecentPercentageScore ||
          riskScore.output?.sexualPredictorScore?.ospIndirectImagePercentageScore,
      },
      OGRS: {
        type: 'OGRS',
        level: riskScore.output?.groupReconvictionScore?.scoreLevel,
        score: riskScore.output?.groupReconvictionScore?.oneYear,
      },
      OVP: {
        type: 'OVP',
        level: riskScore.output?.violencePredictorScore?.ovpRisk,
        score: riskScore.output?.violencePredictorScore?.oneYear,
      },
    }
    return { date: dateWithYearShortMonthAndTime(riskScore.completedDate), scores }
  })
}
