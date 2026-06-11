import { expect, Locator, Page } from '@playwright/test'

export default class UpdateContactPage {
  readonly page: Page

  readonly heading: Locator

  readonly contactDetailsCard: Locator

  readonly dateField: Locator

  readonly timeField: Locator

  readonly detailsField: Locator

  readonly fileUpload: Locator

  readonly sensitiveInformationRadios: Locator

  readonly sensitiveYesRadio: Locator

  readonly sensitiveNoRadio: Locator

  readonly saveUpdateButton: Locator

  readonly errorSummary: Locator

  readonly alertResponsibleQuestion: Locator

  readonly outcomeSection: Locator

  constructor(page: Page) {
    this.page = page

    this.heading = page.getByRole('heading', {
      name: /Update contact about/i,
    })

    this.contactDetailsCard = page.locator('[data-qa="contactDetailsCard"]')

    this.dateField = page.locator('#date')

    this.timeField = page.locator('#time')

    this.detailsField = page.locator('#details')

    this.fileUpload = page.locator('#fileUpload')

    this.sensitiveInformationRadios = page.locator('[data-qa="sensitiveInformation"]')

    this.sensitiveYesRadio = page.locator('#sensitivity')

    this.sensitiveNoRadio = page.locator('#sensitivity-2')

    this.saveUpdateButton = page.getByRole('button', {
      name: 'Save update',
    })

    this.errorSummary = page.locator('.govuk-error-summary')

    this.alertResponsibleQuestion = page.locator('[data-qa="alertResponsibleOfficer"]')

    this.outcomeSection = page.getByRole('group', { name: /outcome/i })
  }

  async expectPageVisible(): Promise<void> {
    await expect(this.heading).toBeVisible()
  }

  async expectContactDetailsVisible(): Promise<void> {
    await expect(this.contactDetailsCard).toBeVisible()
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

  async expectTimeVisible(): Promise<void> {
    await expect(this.timeField).toBeVisible()
  }

  async enterTime(time: string): Promise<void> {
    await this.timeField.fill(time)
  }

  async expectTimeValue(time: string): Promise<void> {
    await expect(this.timeField).toHaveValue(time)
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

  async expectFileUploadVisible(): Promise<void> {
    await expect(this.fileUpload).toBeVisible()
  }

  async selectSensitiveInformationYes(): Promise<void> {
    await this.page.getByLabel('Yes, it includes sensitive information').check()
  }

  async selectSensitiveInformationNo(): Promise<void> {
    await this.page.getByLabel('No, it is not sensitive').check()
  }

  async clickSaveUpdate(): Promise<void> {
    await this.saveUpdateButton.click()
  }

  async expectErrorSummaryVisible(): Promise<void> {
    await expect(this.errorSummary).toBeVisible()
  }

  async expectAlertResponsibleQuestionVisible(): Promise<void> {
    await expect(this.alertResponsibleQuestion).toBeVisible()
  }

  async expectOutcomeSectionVisible(): Promise<void> {
    await expect(this.outcomeSection).toBeVisible()
  }
}
