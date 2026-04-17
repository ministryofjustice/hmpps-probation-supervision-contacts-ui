import { Page, Locator, expect } from '@playwright/test'

export default class AddContactPage {
  readonly page: Page

  readonly detailsField: Locator

  readonly dateField: Locator

  readonly detailsGuidance: Locator

  readonly addGuidanceButton: Locator

  readonly detailsGuidanceSummary: Locator

  readonly detailsLabel: Locator

  readonly personInsetText: Locator

  readonly relatesToHeading: Locator

  readonly personLevelContactOption: Locator

  readonly continueButton: Locator

  readonly personLevelContactRadio: Locator

  readonly errorSummary: Locator

  constructor(page: Page) {
    this.page = page
    this.detailsField = page.locator('#details')
    this.dateField = page.locator('#date')
    this.detailsGuidance = page.locator('[data-qa="detailsGuidance"]')
    this.detailsGuidanceSummary = this.detailsGuidance.locator('.govuk-details__summary')
    this.addGuidanceButton = page.locator('[data-qa="add-guidance-button"]')
    this.detailsLabel = page.locator('label[for="details"]')
    this.personInsetText = page.locator('.govuk-inset-text')
    this.relatesToHeading = page.getByText('What is the contact related to?')
    this.personLevelContactOption = page.locator('[data-qa="personLevelContact"]')
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

  async expectDetailsLabel(text: string): Promise<void> {
    await expect(this.detailsLabel).toHaveText(text)
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

  async expectGuidanceVisible(): Promise<void> {
    await expect(this.detailsGuidance).toBeVisible()
  }

  async expectGuidanceHidden(): Promise<void> {
    await expect(this.detailsGuidance).toHaveCount(0)
  }

  async addGuidanceToDetails(): Promise<void> {
    await this.detailsGuidanceSummary.click()
    await this.addGuidanceButton.click()
  }

  async expectPersonInsetText(text: string): Promise<void> {
    await expect(this.personInsetText).toContainText(text)
  }

  async expectRelatesToVisible(): Promise<void> {
    await expect(this.relatesToHeading).toBeVisible()
  }

  async expectRelatesToHidden(): Promise<void> {
    await expect(this.relatesToHeading).toHaveCount(0)
  }

  async expectPersonLevelContactHidden(): Promise<void> {
    await expect(this.personLevelContactOption).toHaveCount(0)
  }
}
