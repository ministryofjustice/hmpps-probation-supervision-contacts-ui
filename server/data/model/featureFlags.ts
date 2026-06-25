/* eslint-disable lines-between-class-members */
export class FeatureFlags {
  [index: string]: boolean
  searchContactsByCategory?: boolean = undefined
  enableEnforcementContacts?: boolean = undefined
}
