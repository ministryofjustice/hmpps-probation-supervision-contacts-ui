export type TierV3Response = {
  calculation: TierV3 | null
  httpStatus: number
  error?: Error | null
}

export type TierV3 = {
  tierScore: string
  calculationId: string
  calculationDate: string
  changeReason: string
  provisional: boolean
  tag: {
    text: 'Missing' | 'Provisional' | 'Unavailable' | null
    color: 'red' | 'orange' | 'grey' | null
  }
}
