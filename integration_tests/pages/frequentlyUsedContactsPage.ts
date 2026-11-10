import { Page, Locator } from '@playwright/test'

export default class FrequentlyUsedContactsPage {
  readonly page: Page

  readonly pageHeading: Locator

  readonly frequentlyUsedContactList: Locator

  readonly crn: string

  constructor(page: Page, crn: string) {
    this.page = page
    this.crn = crn
    this.pageHeading = page.getByRole('heading', { level: 2, name: 'Find a contact to add' })
    this.frequentlyUsedContactList = page.locator('[data-qa="frequentlyUsedContactList"]')
  }

  async goto() {
    await this.page.goto(`/case/${this.crn}/add-frequently-used-contact`)
  }

  async selectFrequentlyUsedContact(contactName: string) {
    await this.frequentlyUsedContactList.getByRole('link', { name: contactName }).click()
  }
}
