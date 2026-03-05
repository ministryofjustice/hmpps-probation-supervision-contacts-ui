import { toPredictors } from './toPredictors'
import { riskScores as predictorScores } from './mocks'
import { RiskScoresDto, TimelineItem } from '../data/model/risk'

const getExpectedScores = (riskScore: RiskScoresDto) => {
  return {
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
}

describe('utils/toPredictors', () => {
  const expected: TimelineItem = { date: '7 Aug 2024 at 3:29pm', scores: getExpectedScores(predictorScores[0]) }
  it('should return the predictor scores in date order', () => {
    expect(toPredictors(predictorScores)).toStrictEqual(expected)
  })
})
