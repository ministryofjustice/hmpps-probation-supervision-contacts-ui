import { test, expect } from '@playwright/test'
import AddContactPage from '../pages/add-contact'
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

test('details and date fields are visible and writable', async ({ page }) => {
  const addContactPage = new AddContactPage(page)

  await page.goto('/case/X123456/contacts/add-internal-communications')

  await expect(page.locator('[data-qa="alertResponsibleOfficer"]')).toContainText('Jane Doe')

  await addContactPage.expectDetailsVisible()
  await addContactPage.enterDetails('This is a simple test contact note')
  await addContactPage.expectDetailsValue('This is a simple test contact note')

  await addContactPage.expectDateVisible()
  await addContactPage.enterDate('17/05/2024')
  await addContactPage.expectDateValue('17/05/2024')
})

test('shows 404 page when CRN is not found', async ({ page }) => {
  await masApi.stubGetPersonalDetailsNotFound()

  await page.goto('/case/X999999/contacts/add-internal-communications')

  await expect(page.locator('h1')).toContainText('Page not found')
})

test('selected contact relation radio remains checked after validation error', async ({ page }) => {
  const addContactPage = new AddContactPage(page)

  await page.goto('/case/X123456/contacts/add-internal-communications')

  await addContactPage.selectPersonLevelContact()
  await addContactPage.clickContinue()
  await addContactPage.expectErrorSummaryVisible()
  await addContactPage.expectPersonLevelContactChecked()
})

test('shows guidance and appends it to details for guidance-enabled contacts', async ({ page }) => {
  const addContactPage = new AddContactPage(page)

  await page.goto('/case/X123456/contacts/add-mappa-level-setting-process')

  await addContactPage.expectRelatesToVisible()
  await addContactPage.expectGuidanceVisible()
  await addContactPage.expectDetailsLabel('Add further details (optional)')
  await expect(page.getByText('Add details of the contact')).toHaveCount(0)

  await addContactPage.addGuidanceToDetails()
  await addContactPage.expectDetailsValue(
    "You must notify the prison of the MAPPA level, and record that you've done this.",
  )
})

test('shows the person inset and hides the relates to question for person-only contacts', async ({ page }) => {
  const addContactPage = new AddContactPage(page)

  await page.goto('/case/X123456/contacts/add-accommodation-evidence')

  await addContactPage.expectRelatesToHidden()
  await addContactPage.expectPersonInsetText('This contact will be logged against the person.')
  await addContactPage.expectGuidanceHidden()
  await addContactPage.expectDetailsLabel('Add details of the contact')
})

test('shows event sentence options and no guidance for event-only contacts', async ({ page }) => {
  const addContactPage = new AddContactPage(page)

  await page.goto('/case/X123456/contacts/add-case-discussion')

  await addContactPage.expectRelatesToVisible()
  await expect(page.getByText('ORA Community Order')).toBeVisible()
  await addContactPage.expectPersonLevelContactHidden()
  await addContactPage.expectGuidanceHidden()
  await addContactPage.expectDetailsLabel('Add details of the contact')
  await expect(page.getByText('Add further details (optional)')).toHaveCount(0)
})

test('shows mandatory outcome radios for management oversight', async ({ page }) => {
  const addContactPage = new AddContactPage(page)

  await page.goto('/case/X123456/contacts/add-management-oversight')

  await addContactPage.expectRelatesToHidden()
  await addContactPage.expectPersonInsetText('This contact will be logged against the person.')
  await addContactPage.expectOutcomeLegend('Select an outcome')
  await addContactPage.expectOutcomeOptionsCount(6)
  await addContactPage.expectOutcomeOption('Management oversight decision')
})

test('shows optional checkbox outcome for arrest incident', async ({ page }) => {
  const addContactPage = new AddContactPage(page)

  await page.goto('/case/X123456/contacts/add-arrest-incident')

  await addContactPage.expectRelatesToVisible()
  await addContactPage.expectOutcomeLegend('Select an outcome (optional)')
  await addContactPage.expectOutcomeOptionsCount(1)
  await addContactPage.expectOutcomeOption("Set the outcome to 'Risk review'")
})

test('shows MO8 guidance and optional radio outcomes', async ({ page }) => {
  const addContactPage = new AddContactPage(page)

  await page.goto('/case/X123456/contacts/add-management-oversight-home-visit-risk-assessment')

  await addContactPage.expectRelatesToHidden()
  await addContactPage.expectGuidanceVisible()
  await addContactPage.expectOutcomeLegend('Select an outcome (optional)')
  await addContactPage.expectOutcomeOptionsCount(4)
  await addContactPage.expectOutcomeOption('Home visit approved')
  await addContactPage.addGuidanceToDetails()
  await addContactPage.expectDetailsContaining('If you are the responsible officer, you must include:')
})
