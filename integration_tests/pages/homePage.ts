import { type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class HomePage extends AbstractPage {
  private constructor(page: Page) {
    super(page)
  }

  static async verifyOnPage(page: Page): Promise<HomePage> {
    return new HomePage(page)
  }
}
