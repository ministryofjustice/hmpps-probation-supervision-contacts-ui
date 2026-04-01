import { test } from '@playwright/test'
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

  await addContactPage.expectDetailsVisible()
  await addContactPage.enterDetails('This is a simple test contact note')
  await addContactPage.expectDetailsValue('This is a simple test contact note')

  await addContactPage.expectDateVisible()
  await addContactPage.enterDate('17/05/2024')
  await addContactPage.expectDateValue('17/05/2024')
})

test('selected contact relation radio remains checked after validation error', async ({ page }) => {
  const addContactPage = new AddContactPage(page)

  await page.goto('/case/X123456/contacts/add-internal-communications')

  await addContactPage.selectPersonLevelContact()
  await addContactPage.clickContinue()
  await addContactPage.expectErrorSummaryVisible()
  await addContactPage.expectPersonLevelContactChecked()
})
