import { Page, Locator } from '@playwright/test'

export default class SearchByCategoryPage {
  readonly page: Page

  readonly searchButton: Locator

  readonly clearButton: Locator

  constructor(page: Page) {
    this.page = page
    this.searchButton = page.locator('[data-qa="category-search-button"]')
    this.clearButton = page.locator('[data-qa="category-clear-button"]')
  }

  async openSearchByCategoryTab(): Promise<void> {
    await this.page.locator('[data-qa="search-by-category-tab"]').click()
  }

  async selectCategory(label: string): Promise<void> {
    await this.page.getByLabel(label).check()
  }

  async unselectCategory(label: string): Promise<void> {
    await this.page.getByLabel(label).uncheck()
  }

  async clickSearch(): Promise<void> {
    await this.searchButton.click()
  }

  async clickClear(): Promise<void> {
    await this.clearButton.click()
  }
}
