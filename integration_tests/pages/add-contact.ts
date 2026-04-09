import { Page, Locator, expect } from '@playwright/test'

export default class AddContactPage {
  readonly page: Page

  readonly detailsField: Locator

  readonly dateField: Locator

  readonly continueButton: Locator

  readonly personLevelContactRadio: Locator

  readonly errorSummary: Locator

  constructor(page: Page) {
    this.page = page
    this.detailsField = page.locator('#details')
    this.dateField = page.locator('#date')
    this.personLevelContactRadio = page.locator('#sentence')
    this.continueButton = page.getByRole('button', { name: 'Create contact' })
    this.errorSummary = page.locator('.govuk-error-summary')
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

  async selectPersonLevelContact(): Promise<void> {
    await this.personLevelContactRadio.check()
  }

  async clickContinue(): Promise<void> {
    await this.continueButton.click()
  }

  async expectErrorSummaryVisible(): Promise<void> {
    await expect(this.errorSummary).toBeVisible()
  }

  async expectPersonLevelContactChecked(): Promise<void> {
    await expect(this.personLevelContactRadio).toBeChecked()
  }

  async expectSentenceErrorShown() {
    await expect(this.page.locator('.govuk-error-summary')).toContainText('Select what the contact is related to')
  }

  async expectDateErrorShown() {
    await expect(this.page.locator('#date-error')).toContainText('Enter or select a date')
  }

  async expectTimeErrorShown() {
    await expect(this.page.locator('#time-error')).toContainText(
      'Enter a time in the 24-hour format, for example 16:30',
    )
  }

  async expectSensitivityErrorShown() {
    await expect(this.page.locator('.govuk-error-summary')).toContainText(
      'Select if the contact includes sensitive information',
    )
  }

  async expectAlertResponsibleOfficerErrorShown() {
    await expect(this.page.locator('.govuk-error-summary')).toContainText(
      'Select if you want to alert the responsible officer',
    )
  }

  async enterTime(value: string) {
    await this.page.locator('#time').fill(value)
  }

  async selectSensitivityNo() {
    await this.page.getByLabel('No, it is not sensitive').check()
  }

  async selectAlertResponsibleOfficerNo() {
    await this.page.getByLabel('No').last().check()
  }

  async expectNoErrorSummaryVisible() {
    await expect(this.page.locator('.govuk-error-summary')).not.toBeVisible()
  }

  async expectUrlToBe(url: string) {
    await expect(this.page.url()).toContain(url)
  }
}
