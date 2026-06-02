import { test, expect } from '@playwright/test'
import UpdateContactPage from '../pages/update-contact-page'
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
    masApi.stubGetContact(),
  ])
  await login(page)
})

test.afterEach(async () => {
  await resetStubs()
})

test('date, time and details fields are visible and writable', async ({ page }) => {
  const updateContactPage = new UpdateContactPage(page)

  await page.goto('/case/X123456/00001/update-contact')

  await updateContactPage.expectPageVisible()

  await updateContactPage.expectContactDetailsVisible()

  await updateContactPage.expectDateVisible()
  await updateContactPage.enterDate('17/5/2024')
  await updateContactPage.expectDateValue('17/5/2024')

  await updateContactPage.expectTimeVisible()
  await updateContactPage.enterTime('14:30')
  await updateContactPage.expectTimeValue('14:30')

  await updateContactPage.expectDetailsVisible()
  await updateContactPage.enterDetails('Updated communication details for testing')
  await updateContactPage.expectDetailsValue('Updated communication details for testing')

  await updateContactPage.expectFileUploadVisible()

  await updateContactPage.selectSensitiveInformationYes()

  await expect(updateContactPage.saveUpdateButton).toBeVisible()
})

test('shows validation errors when mandatory fields are empty', async ({ page }) => {
  const updateContactPage = new UpdateContactPage(page)

  await page.goto('/case/X123456/00001/update-contact')

  await updateContactPage.dateField.fill('')
  await updateContactPage.timeField.fill('')

  await updateContactPage.clickSaveUpdate()

  await updateContactPage.expectErrorSummaryVisible()
})

test('shows additional questions for a contact with outcomes', async ({ page }) => {
  const updateContactPage = new UpdateContactPage(page)

  await page.goto('/case/X123456/00002/update-contact')

  await updateContactPage.expectAlertResponsibleQuestionVisible()

  await updateContactPage.expectOutcomeSectionVisible()
})
