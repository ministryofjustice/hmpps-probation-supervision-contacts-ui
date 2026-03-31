import { test, expect } from '@playwright/test'
import AddFrequentContactPage from '../pages/add-frequently-contact'
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

test('user can select appointment contact', async ({ page }) => {
  const addContactPage = new AddFrequentContactPage(page)

  await page.goto('/case/X123456/add-frequently-used-contact')

  await addContactPage.selectContact('C326')
  await addContactPage.clickContinue()

  await expect(page).toHaveURL('/case/X123456/contacts/add-internal-communications')
})

test('keeps selected contact when using browser back from step 2', async ({ page }) => {
  const addContactPage = new AddFrequentContactPage(page)

  await page.goto('/case/X123456/add-frequently-used-contact')

  await addContactPage.selectContact('C326')
  await addContactPage.clickContinue()

  await page.goBack()

  await expect(page.locator('input[value="C326"]')).toBeChecked()
})

test('clears selected contact when navigating away and returning', async ({ page }) => {
  const addContactPage = new AddFrequentContactPage(page)

  await page.goto('/case/X123456/add-frequently-used-contact')

  await addContactPage.selectContact('C326')
  await addContactPage.clickContinue()

  await page.goto('/case/X123456')

  await page.goto('/case/X123456/add-frequently-used-contact')

  await expect(page.locator('input[value="C326"]')).not.toBeChecked()
})
