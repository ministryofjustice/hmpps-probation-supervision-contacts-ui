import { PersonSummary } from './personalDetails'

/**
 * Represents the Person on Probation details needed for the Contact journey headers.
 * Extends PersonSummary to ensure compatibility with existing summary endpoints,
 * while adding specific fields used in the Contact view templates (e.g. Tier, Risk).
 */
export interface PersonOnProbation extends PersonSummary {
  tier?: string
  rosh?: string
  rsr?: string
  age?: number
}

/**
 * Represents a Frequently Used Contact Type or a specific Contact Type detail.
 */
export interface ContactType {
  code: string
  description: string
  isPersonLevelContact: boolean
}

/**
 * The payload structure for creating a new contact.
 * This matches the JSON body expected by the API.
 */
export interface DefaultUserDetails {
  staffCode?: string
  username: string
  homeArea: string
  team: string
}

export interface Team {
  description: string
  code: string
}

export interface UserProviders {
  defaultUserDetails: DefaultUserDetails
  teams: Team[]
}

export interface SentenceOrder {
  description: string
  startDate?: string
}

export interface Sentence {
  id: number
  order: SentenceOrder
}

export interface CreateContactRequest {
  date: string
  time: string
  staffCode: string
  teamCode: string
  type: string
  eventId?: number
  requirementId?: number | null
  description?: string
  notes?: string
  outcomeCode?: string
  alert: boolean
  sensitive: boolean
  visorReport: boolean
}

export interface UpdateContactWithNoOutcome {
  dateTime: string
  notes?: string
  sensitiveFlag: boolean
}

export interface UpdateContactWithOutcome {
  date: string
  time: string
  notes?: string
  sensitive: boolean
  outcomeCode: string
  alert: boolean
  enforcementActionCode: null
}

export interface CreateContactResponse {
  id: number
}

export interface Name {
  forename: string
  middleName?: string
  surname: string
  username?: string
}

export interface Note {
  id: number
  createdBy?: string
  createdByDate?: string
  note: string
  hasNotesBeenTruncated?: boolean
}
export interface Officer {
  code?: string
  name?: Name
  teamCode?: string
  providerCode?: string
  username?: string
}

export interface Address {
  code?: string
  providerCode?: string
  teamCode?: string
  officeName?: string
  buildingName?: string
  buildingNumber?: string
  streetName?: string
  district?: string
  town?: string
  county?: string
  postcode?: string
  ldu?: string
  telephoneNumber?: string
}

export interface Document {
  id: string
  name: string
  lastUpdated?: string
  createdAt?: string
}

export interface EnforcementAction {
  responseByDate: string
}

export interface PersonActivity {
  size: number
  page: number
  totalResults: number
  totalPages: number
  personSummary: PersonSummary
  activities: Activity[]
}

export interface Activity {
  id: string
  eventNumber?: string
  type: string
  displayName?: string
  startDateTime: string
  endDateTime?: string
  rarToolKit?: string
  appointmentNotes?: Note[]
  appointmentNote?: Note
  isSensitive?: boolean
  hasOutcome?: boolean
  wasAbsent?: boolean
  officer?: Officer
  isInitial?: boolean
  isNationalStandard?: boolean
  location?: Address
  rescheduled?: boolean
  rescheduledStaff?: boolean
  rescheduledPop?: boolean
  didTheyComply?: boolean
  absentWaitingEvidence?: boolean
  enforcementAction?: EnforcementAction
  rearrangeOrCancelReason?: string
  rescheduledBy?: Name
  repeating?: boolean
  nonComplianceReason?: string
  documents?: Document[]
  isRarRelated?: boolean
  rarCategory?: string
  acceptableAbsence?: boolean
  acceptableAbsenceReason?: string
  isAppointment?: boolean
  isCommunication?: boolean
  action?: string
  isSystemContact?: boolean
  isEmailOrTextFromPop?: boolean
  isPhoneCallFromPop?: boolean
  isEmailOrTextToPop?: boolean
  isPhoneCallToPop?: boolean
  isInPast?: boolean
  isPastAppointment?: boolean
  countsTowardsRAR?: boolean
  lastUpdated?: string
  lastUpdatedBy?: Name
  description?: string
  outcome?: string
  deliusManaged?: boolean
  isVisor?: boolean
  eventId?: number
  component?: SentenceComponent
  nsiId?: number
  esupervisionId?: string
  externalReference?: string
}

export interface PersonContact {
  personSummary: PersonSummary
  appointment: Activity
}
export interface PersonSchedule {
  size: number
  page: number
  totalResults: number
  totalPages: number
  appointments: Activity[]
}

export interface Schedule {
  personSummary: PersonSummary
  personSchedule: PersonSchedule
}

export interface SentenceComponent {
  id?: number
  description?: string
  type?: string
}
