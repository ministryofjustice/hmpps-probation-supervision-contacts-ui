import { Page, Locator } from '@playwright/test'

export default class AddFrequentContactPage {
  readonly page: Page

  readonly continueButton: Locator

  constructor(page: Page) {
    this.page = page
    this.continueButton = page.locator('[data-qa="continue-button"]')
  }

  contactRadio(value: string): Locator {
    return this.page.locator(`input[name="contactType"][value="${value}"]`)
  }

  async selectContact(value: string): Promise<void> {
    await this.contactRadio(value).check()
  }

  async clickContinue(): Promise<void> {
    await this.continueButton.click()
  }
}
