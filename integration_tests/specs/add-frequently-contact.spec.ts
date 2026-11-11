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
    masApi.stubGetTemplates(),
    masApi.stubDownloadDocument(),
  ])
  await login(page, { flags })
})

test.afterEach(async () => {
  await resetStubs()
})

test('has the correct page title', async ({ page }) => {
  const frequentlyUsedContactsPage = new FrequentlyUsedContactsPage(page, 'X123456')
  await frequentlyUsedContactsPage.goto()

  await expect(frequentlyUsedContactsPage.pageHeading).toBeVisible()
  await expect(page).toHaveTitle('Find a contact to add - frequently used contacts')
})

test('user can select a frequently used contact from the list', async ({ page }) => {
  const frequentlyUsedContactsPage = new FrequentlyUsedContactsPage(page, 'X123456')
  await frequentlyUsedContactsPage.goto()

  await frequentlyUsedContactsPage.selectFrequentlyUsedContact('Internal communications')

  const addContactPage = new AddContactPage(page, 'Internal communications')
  await expect(addContactPage.pageHeading).toBeVisible()
})

test.describe('Adding request early termination', async () => {
  test.beforeAll(() => {
    flags = [{ key: 'enableEarlyTermination20261103Squad3', enabled: true }]
  })
  test('user can select request early termination from the list and download the template file', async ({ page }) => {
    const frequentlyUsedContactsPage = new FrequentlyUsedContactsPage(page, 'X123456')

    await frequentlyUsedContactsPage.goto()
    await expect(frequentlyUsedContactsPage.pageHeading).toBeVisible()
    await frequentlyUsedContactsPage.selectFrequentlyUsedContact('Request early termination')

    const addContactPage = new AddContactPage(page, 'Request early termination')
    await expect(addContactPage.pageHeading).toBeVisible()

    const downloadPromise = page.waitForEvent('download')
    await page.getByText('NAT_ET_Checklist_template').click()
    const download = await downloadPromise

    expect(download.suggestedFilename()).toBe('NAT_ET_Checklist_template.docx')
  })
})
