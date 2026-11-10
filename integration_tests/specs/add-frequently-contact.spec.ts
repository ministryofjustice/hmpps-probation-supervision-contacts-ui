import { test, expect } from '@playwright/test'
import { login, resetStubs } from '../testUtils'
import masApi from '../mockApis/masApi'
import arnsApi from '../mockApis/arnsApi'
import tierApi from '../mockApis/tierApi'
import FrequentlyUsedContactsPage from '../pages/frequentlyUsedContactsPage'
import AddContactPage from '../pages/add-contact'

let flags: Array<{ key: string; enabled?: boolean }> = []

test.beforeEach(async ({ page }) => {
  await Promise.all([
    masApi.stubGetPersonalDetails('X123456'),
    arnsApi.stubGetRisks(),
    masApi.stubGetPersonRiskFlags(),
    tierApi.stubGetCalculationDetails(),
    arnsApi.stubGetPredictorsAll(),
    masApi.stubGetProbationPractitioner(),
    masApi.stubGetSentences(),
    masApi.stubGetOverview(),
  ])
  await login(page, { flags })
})

test.afterEach(async () => {
  await resetStubs()
})

test('has the correct page title', async ({ page }) => {
  const frequentlyUsedContactsPage = new FrequentlyUsedContactsPage(page, 'X123456')
  await frequentlyUsedContactsPage.goto()

  await expect(page).toHaveTitle('Find a contact to add - frequently used contacts')
})

test('user can select a frequently used contact from the list', async ({ page }) => {
  const frequentlyUsedContactsPage = new FrequentlyUsedContactsPage(page, 'X123456')
  await frequentlyUsedContactsPage.goto()

  await page.locator('a[href*="add-internal-communications"]').click()

  await expect(page.url()).toContain('add-internal-communications')
})

test.describe('Adding request early termination', async () => {
  test.beforeAll(() => {
    flags = [{ key: 'enableEarlyTermination20261103Squad3', enabled: true }]
  })
  test('user can select request early termination from the list', async ({ page }) => {
    const frequentlyUsedContactsPage = new FrequentlyUsedContactsPage(page, 'X123456')

    await frequentlyUsedContactsPage.goto()
    await expect(frequentlyUsedContactsPage.pageHeading).toBeVisible()
    await frequentlyUsedContactsPage.frequentlyUsedContactList
      .getByRole('link', { name: 'Request early termination' })
      .click()

    const addContactPage = new AddContactPage(page, 'Request early termination')
    await expect(addContactPage.pageHeading).toBeVisible()

    // TODO continue with filling out the add contact form and submitting it
  })
})
