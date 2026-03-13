import type { Request, RequestHandler } from 'express'
import MasApiClient from '../data/masApiClient'
import { ContactType } from '../data/model/contacts'

const ALLOWED_FREQUENT_CODES = ['CM3A', 'CM3B', 'CMOA', 'CMOB', 'C326', 'C204', 'CT3A', 'CT3B', 'CTOA', 'CTOB']

/**
 * Fetches frequent contact types from MasApiClient.
 * Filters and orders the contact types to match the UI design exactly.
 */
export const getFrequentContactTypes = async (
  req: Request,
  masApiClient: MasApiClient,
  username: string,
): Promise<ContactType[]> => {
  const response = await masApiClient.getFrequentContactTypes(username)
  const allContactTypes: ContactType[] = Array.isArray(response) ? response : (response as any)?.contactTypes || []

  /**
   * Map over ordered ALLOWED_FREQUENT_CODES to guarantee the output follows that sequence.
   */
  return ALLOWED_FREQUENT_CODES.map(code => allContactTypes.find(contact => contact.code === code)).filter(
    contact => contact !== undefined,
  ) as ContactType[]
}
