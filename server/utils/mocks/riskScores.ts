import { RiskScoresDto } from '../../data/model/risk'

export const riskScores: RiskScoresDto[] = [
  {
    completedDate: '2024-08-07T15:29:09',
    status: 'COMPLETE',
    assessmentType: 'LAYER3',
    outputVersion: '1',
    output: {
      groupReconvictionScore: {
        oneYear: 11,
        twoYears: 21,
        scoreLevel: 'LOW',
      },
      violencePredictorScore: {
        ovpStaticWeightedScore: 21,
        oneYear: 4,
        twoYears: 10,
        ovpRisk: 'MEDIUM',
      },
      generalPredictorScore: {
        ogpStaticWeightedScore: 13,
        ogp1Year: 5,
        ogp2Year: 28,
        ogpRisk: 'HIGH',
      },
      riskOfSeriousRecidivismScore: {
        percentageScore: 0.77,
        staticOrDynamic: 'STATIC',
        source: 'OASYS',
        algorithmVersion: '5',
        scoreLevel: 'LOW',
      },
      sexualPredictorScore: {
        ospIndirectImagePercentageScore: 0,
        ospDirectContactPercentageScore: 0,
        ospIndirectImageScoreLevel: 'NOT_APPLICABLE',
        ospDirectContactScoreLevel: 'NOT_APPLICABLE',
      },
    },
  },
  {
    completedDate: '2024-06-01T10:00:00',
    status: 'COMPLETE',
    assessmentType: 'LAYER3',
    outputVersion: '1',
    output: {
      groupReconvictionScore: {
        oneYear: 5,
        twoYears: 10,
        scoreLevel: 'LOW',
      },
      violencePredictorScore: {
        ovpStaticWeightedScore: 15,
        oneYear: 0,
        twoYears: 0,
        ovpRisk: 'LOW',
      },
      generalPredictorScore: {
        ogpStaticWeightedScore: 10,
        ogp1Year: 3,
        ogp2Year: 20,
        ogpRisk: 'MEDIUM',
      },
      riskOfSeriousRecidivismScore: {
        percentageScore: 0.55,
        staticOrDynamic: 'STATIC',
        source: 'OASYS',
        algorithmVersion: '5',
        scoreLevel: 'LOW',
      },
      sexualPredictorScore: {
        ospIndirectImagePercentageScore: 0,
        ospDirectContactPercentageScore: 0,
        ospIndirectImageScoreLevel: 'NOT_APPLICABLE',
        ospDirectContactScoreLevel: 'NOT_APPLICABLE',
      },
    },
  },
]
