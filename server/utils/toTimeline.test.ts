import { toTimeline } from './toTimeline'
import { riskScores } from './mocks'
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
describe('utils/toTimeline', () => {
  it('should return the date sorted risk scores', () => {
    const expected: TimelineItem[] = [
      { date: '7 Aug 2024 at 3:29pm', scores: getExpectedScores(riskScores[0]) },
      { date: '1 Jun 2024 at 10am', scores: getExpectedScores(riskScores[1]) },
    ]
    expect(toTimeline(riskScores)).toStrictEqual(expected)
  })
  it('should return the date sorted risk scores for all conditional values', () => {
    const mock = [
      {
        ...riskScores[0],
        output: {
          ...riskScores[0].output,
          sexualPredictorScore: {
            ospContactScoreLevel: null,
            ospDirectContactScoreLevel: 'NOT_APPLICABLE',
            ospContactPercentageScore: null,
            ospDirectContactPercentageScore: 0,
            ospIndecentScoreLevel: null,
            ospIndirectImageScoreLevel: 'NOT_APPLICABLE',
            ospIndecentPercentageScore: null,
            ospIndirectImagePercentageScore: 0,
          },
        },
      },
      { ...riskScores[1] },
    ] as RiskScoresDto[]
    const expected: TimelineItem[] = [
      { date: '7 Aug 2024 at 3:29pm', scores: getExpectedScores(mock[0]) },
      { date: '1 Jun 2024 at 10am', scores: getExpectedScores(mock[1]) },
    ]
    expect(toTimeline(mock)).toStrictEqual(expected)
  })
})
