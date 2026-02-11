import { expect, test } from '@playwright/test'

import { login, resetStubs } from '../testUtils'
import ExamplePage from '../pages/examplePage'

test.describe('Example', () => {
  test.afterEach(async () => {
    await resetStubs()
  })

  test('Time from exampleApi is visible on page', async ({ page }) => {
    await login(page)

    const examplePage = await ExamplePage.verifyOnPage(page)

    await expect(examplePage.timestamp).toContainText('The date and time is currently ')
  })
})
