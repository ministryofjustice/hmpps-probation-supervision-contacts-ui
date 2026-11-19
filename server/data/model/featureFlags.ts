/* eslint-disable lines-between-class-members */
export class FeatureFlags {
  [index: string]: boolean
  enableSupervisionPackagePoPHeader?: boolean = undefined
  enablePersonHeader?: boolean = undefined
  enablePersonHeaderTierV3?: boolean = undefined
  enablePersonHeaderPhoto?: boolean = undefined
  enableNDeliusRosh?: boolean = undefined
  enableEarlyTermination20261103Squad3?: boolean = undefined
  earlyTerminationTemplatesAPI20261112Squad3?: boolean = undefined
  enableContactAccessLimitation20261116Squad3?: boolean = undefined
  enableCheckOutcomes20261124Squad3?: boolean = undefined
}
