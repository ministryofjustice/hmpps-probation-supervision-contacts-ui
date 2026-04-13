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

test('all required validation errors are shown when fields are empty', async ({ page }) => {
  const addContactPage = new AddContactPage(page)

  await page.goto('/case/X123456/contacts/add-internal-communications')

  await addContactPage.clickContinue()
  await addContactPage.expectErrorSummaryVisible()

  await addContactPage.expectSentenceErrorShown()
  await addContactPage.expectDateErrorShown()
  await addContactPage.expectTimeErrorShown()
  await addContactPage.expectSensitivityErrorShown()
  await addContactPage.expectAlertResponsibleOfficerErrorShown()
})

test('navigates to the activity log page with a success banner after filling add contacts form', async ({ page }) => {
  const addContactPage = new AddContactPage(page)

  await page.goto('/case/X123456/contacts/add-internal-communications')

  await addContactPage.selectPersonLevelContact()
  await addContactPage.enterDate('10/4/2026')
  await addContactPage.enterTime('15:30')
  await addContactPage.enterDetails('This is a test contact note')
  await addContactPage.selectSensitivityNo()
  await addContactPage.selectAlertResponsibleOfficerNo()

  await addContactPage.clickContinue()

  await addContactPage.expectUrlToBe('case/X123456/activity-log?showSuccessBanner=true')
})
