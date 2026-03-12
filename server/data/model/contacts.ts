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
  alert: boolean
  sensitive: boolean
  visorReport: boolean
}

export interface CreateContactResponse {
  id: number
}
