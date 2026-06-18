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
  await addContactPage.expectDetailsLabel('Add details of the contact')

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

test('shows pre-selected inset outcome for arrest incident', async ({ page }) => {
  const addContactPage = new AddContactPage(page)

  await page.goto('/case/X123456/contacts/add-arrest-incident')

  await addContactPage.expectRelatesToVisible()
  await addContactPage.expectOutcomeInsetText("The outcome for this contact will be set to 'Risk review'.")
  await addContactPage.expectOutcomeOptionsCount(0)
})

test('shows MO8 guidance and radio outcomes', async ({ page }) => {
  const addContactPage = new AddContactPage(page)

  await page.goto('/case/X123456/contacts/add-management-oversight-home-visit-risk-assessment')

  await addContactPage.expectRelatesToHidden()
  await addContactPage.expectGuidanceVisible()
  await addContactPage.expectOutcomeLegend('Select an outcome')
  await addContactPage.expectOutcomeOptionsCount(4)
  await addContactPage.expectOutcomeOption('Home visit approved')
  await addContactPage.addGuidanceToDetails()
  await addContactPage.expectDetailsContaining('If you are the responsible officer, you must include:')
})

test('shows an error when a future date and time are entered', async ({ page }) => {
  const addContactPage = new AddContactPage(page)

  await page.goto('/case/X123456/contacts/add-internal-communications')

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  const futureDate = tomorrow.toLocaleDateString('en-GB')

  await addContactPage.enterDate(futureDate)
  await page.locator('#time').fill('13:00')

  await page.getByRole('button', { name: 'Create contact' }).click()

  await expect(page.locator('.govuk-error-summary')).toContainText(
    'The time of the contact must be the current time or in the past',
  )
})

test('shows an error on the time field only when today is selected and the time is in the future', async ({ page }) => {
  const addContactPage = new AddContactPage(page)

  await page.goto('/case/X123456/contacts/add-internal-communications')

  const now = new Date()

  const today = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`

  const futureTime = new Date(now.getTime() + 60 * 60 * 1000)

  const hours = String(futureTime.getHours()).padStart(2, '0')
  const minutes = String(futureTime.getMinutes()).padStart(2, '0')

  await addContactPage.enterDate(today)
  await page.locator('#time').fill(`${hours}:${minutes}`)

  await page.getByRole('button', { name: 'Create contact' }).click()

  await expect(page.locator('.govuk-error-summary')).toContainText(
    'The time of the contact must be the current time or in the past',
  )

  await expect(page.locator('.govuk-error-summary')).not.toContainText(
    'The date of the contact must be today or in the past',
  )
})
