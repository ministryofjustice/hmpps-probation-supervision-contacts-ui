import { test, expect } from '@playwright/test'
import AddFrequentContactPage from '../pages/add-frequently-contact'
import { login, resetStubs } from '../testUtils'
import masApi from '../mockApis/masApi'
import arnsApi from '../mockApis/arnsApi'
import tierApi from '../mockApis/tierApi'
import featureFlags from '../mockApis/fliptApi'

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
  await featureFlags.stubSnapshot([{ key: 'searchContactsByCategory', enabled: false }])

  await page.goto('/case/X123456/add-frequently-used-contact')

  await expect(page).toHaveTitle('Add a frequently used contact')
})

test('user can select appointment contact', async ({ page }) => {
  await featureFlags.stubSnapshot([{ key: 'searchContactsByCategory', enabled: false }])
  const addContactPage = new AddFrequentContactPage(page)

  await page.goto('/case/X123456/add-frequently-used-contact')

  await addContactPage.selectContact('C326')
  await addContactPage.clickContinue()

  await expect(page).toHaveURL('/case/X123456/contacts/add-internal-communications')
})

test('keeps selected contact when using browser back from step 2', async ({ page }) => {
  await featureFlags.stubSnapshot([{ key: 'searchContactsByCategory', enabled: false }])
  const addContactPage = new AddFrequentContactPage(page)

  await page.goto('/case/X123456/add-frequently-used-contact')

  await addContactPage.selectContact('C326')
  await addContactPage.clickContinue()

  await page.goBack()

  await expect(page.locator('input[value="C326"]')).toBeChecked()
})

test('clears selected contact when navigating away and returning', async ({ page }) => {
  await featureFlags.stubSnapshot([{ key: 'searchContactsByCategory', enabled: false }])
  const addContactPage = new AddFrequentContactPage(page)

  await page.goto('/case/X123456/add-frequently-used-contact')

  await addContactPage.selectContact('C326')
  await addContactPage.clickContinue()

  await page.goto('/case/X123456')

  await page.goto('/case/X123456/add-frequently-used-contact')

  await expect(page.locator('input[value="C326"]')).not.toBeChecked()
})

test('user can open NDelius in new tab and redirect back to activity log', async ({ page }) => {
  await featureFlags.stubSnapshot([{ key: 'searchContactsByCategory', enabled: false }])

  await page.goto('/case/X123456/add-frequently-used-contact')

  const [newTab] = await Promise.all([
    page.waitForEvent('popup'),
    page.getByRole('link', { name: 'use NDelius (opens in new tab)' }).click(),
  ])

  await expect(newTab).toBeTruthy()
  await expect(page).toHaveURL(url => url.pathname.includes('/case/X123456/activity-log'))
})

test('Selects correct contact when feature flag searchContactsByCategory is true', async ({ page }) => {
  await featureFlags.stubSnapshot([{ key: 'searchContactsByCategory', enabled: true }])

  await page.goto('/case/X123456/add-frequently-used-contact')

  await page.locator('a[href*="add-internal-communications"]').click()

  await expect(page.url()).toContain('add-internal-communications')
})
