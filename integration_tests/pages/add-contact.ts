import { Page, Locator, expect } from '@playwright/test'

export default class AddContactPage {
  readonly page: Page

  readonly detailsField: Locator

  readonly dateField: Locator

  constructor(page: Page) {
    this.page = page
    this.detailsField = page.locator('#details')
    this.dateField = page.locator('#date')
  }

  async expectDetailsVisible(): Promise<void> {
    await expect(this.detailsField).toBeVisible()
  }

  async enterDetails(text: string): Promise<void> {
    await this.detailsField.fill(text)
  }

  async expectDetailsValue(text: string): Promise<void> {
    await expect(this.detailsField).toHaveValue(text)
  }

  async expectDateVisible(): Promise<void> {
    await expect(this.dateField).toBeVisible()
  }

  async enterDate(date: string): Promise<void> {
    await this.dateField.fill(date)
  }

  async expectDateValue(date: string): Promise<void> {
    await expect(this.dateField).toHaveValue(date)
  }
}
