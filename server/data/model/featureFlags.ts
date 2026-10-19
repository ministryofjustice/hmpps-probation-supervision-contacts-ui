/* eslint-disable lines-between-class-members */
export class FeatureFlags {
  [index: string]: boolean
  enableEnforcementContacts?: boolean = undefined
  enableSupervisionPackagePoPHeader?: boolean = undefined
  enablePersonHeader?: boolean = undefined
  enablePersonHeaderTierV3?: boolean = undefined
  enablePersonHeaderPhoto?: boolean = undefined
  enableNDeliusRosh?: boolean = undefined
}
