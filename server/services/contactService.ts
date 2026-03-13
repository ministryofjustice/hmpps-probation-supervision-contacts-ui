import MasApiClient from '../data/masApiClient'
import { ContactType, CreateContactRequest, CreateContactResponse } from '../data/model/contacts'

export default class ContactService {
  constructor(private readonly masApiClient: MasApiClient) {}

  async getFrequentContactTypes(username: string): Promise<ContactType[]> {
    return this.masApiClient.getFrequentContactTypes(username)
  }

  async getContactType(code: string, username: string): Promise<ContactType> {
    return this.masApiClient.getContactType(code, username)
  }

  async isResponsibleOfficer(username: string, crn: string): Promise<boolean> {
    return this.masApiClient.isResponsibleOfficer(username, crn)
  }

  async createContact(crn: string, payload: CreateContactRequest, username: string): Promise<CreateContactResponse> {
    return this.masApiClient.createContact(crn, payload, username)
  }
}
