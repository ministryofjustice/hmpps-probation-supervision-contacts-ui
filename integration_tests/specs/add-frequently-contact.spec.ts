import { test, expect } from '@playwright/test'
import { login, resetStubs } from '../testUtils'
import masApi from '../mockApis/masApi'
import arnsApi from '../mockApis/arnsApi'
import tierApi from '../mockApis/tierApi'

test.beforeEach(async ({ page }) => {
  await Promise.all([
    masApi.stubGetPersonalDetails('X123456'),
    arnsApi.stubGetRisks(),
    tierApi.stubGetCalculationDetails(),
    arnsApi.stubGetPredictorsAll(),
    masApi.stubGetProbationPractitioner(),
    masApi.stubGetSentences(),
    masApi.stubGetOverview(),
  ])
  await login(page)
})

test.afterEach(async () => {
  await resetStubs()
})

test('has the correct page title', async ({ page }) => {
  await page.goto('/case/X123456/add-frequently-used-contact')

  await expect(page).toHaveTitle('Find a contact to add - frequently used contacts')
})

test('user can select a frequently used contact from the list', async ({ page }) => {
  await page.goto('/case/X123456/add-frequently-used-contact')

  await page.locator('a[href*="add-internal-communications"]').click()

  await expect(page.url()).toContain('add-internal-communications')
})
