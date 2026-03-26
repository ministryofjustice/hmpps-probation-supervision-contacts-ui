/* eslint-disable lines-between-class-members */
export class FeatureFlags {
  [index: string]: boolean
  enableContactLog?: boolean = undefined
  enableCreateContact?: boolean = undefined
  searchContactsByCategory?: boolean = undefined
}
