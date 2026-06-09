import { Page, Locator } from '@playwright/test'

export default class SearchByKeywordPage {
  readonly page: Page

  readonly searchButton: Locator

  constructor(page: Page) {
    this.page = page
    this.searchButton = page.locator('[data-qa="keyword-search-button"]')
  }

  async openSearchByKeywordTab(): Promise<void> {
    await this.page.locator('[data-qa="search-by-keyword-tab"]').click()
  }

  async fillKeyword(value: string): Promise<void> {
    const input = this.page.locator('#keyword')
    await input.fill(value)
  }

  async clickSearch(): Promise<void> {
    await this.searchButton.click()
  }

  async search(keyword: string): Promise<void> {
    await this.fillKeyword(keyword)
    await this.clickSearch()
  }
}
