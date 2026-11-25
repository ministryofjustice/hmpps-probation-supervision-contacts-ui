export interface CaseAccess {
  crn: string
  userExcluded?: boolean
  userRestricted?: boolean
  exclusionMessage?: string
  restrictionMessage?: string
}
