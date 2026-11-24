import { test, expect } from '@playwright/test'
import { login, resetStubs } from '../testUtils'
import masApi from '../mockApis/masApi'
import arnsApi from '../mockApis/arnsApi'
import tierApi from '../mockApis/tierApi'
import FrequentlyUsedContactsPage from '../pages/frequentlyUsedContactsPage'

const restrictionMessage = 'This is a restricted record. Please contact a system administrator'
const exclusionMessage = 'You are excluded from viewing this case'
const laoHeading = 'You are restricted from viewing this case'

test.beforeEach(async ({ page }) => {
  await Promise.all([
    masApi.stubGetPersonalDetails('X000001'),
    arnsApi.stubGetRisks(),
    masApi.stubGetPersonRiskFlags(),
    tierApi.stubGetCalculationDetails(),
    arnsApi.stubGetPredictorsAll(),
    masApi.stubGetProbationPractitioner(),
    masApi.stubGetSentences(),
    masApi.stubGetOverview(),
    masApi.stubGetUserAccess({ crn: 'X000001', userExcluded: false, userRestricted: false }),
    masApi.stubGetUserAccess({ crn: 'X778160', userExcluded: false, userRestricted: true, restrictionMessage }),
    masApi.stubGetUserAccess({ crn: 'X808126', userExcluded: true, userRestricted: false, exclusionMessage }),
    masApi.stubGetUserAccess({ crn: 'X900001', userExcluded: true, userRestricted: false }),
  ])
  await login(page)
})

test.afterEach(async () => {
  await resetStubs()
})

test('shows the case page when the user has access', async ({ page }) => {
  const frequentlyUsedContactsPage = new FrequentlyUsedContactsPage(page, 'X000001')
  await frequentlyUsedContactsPage.goto()

  await expect(frequentlyUsedContactsPage.pageHeading).toBeVisible()
  await expect(page.getByRole('heading', { name: laoHeading })).toHaveCount(0)
})

test('shows the restriction message when the user is restricted', async ({ page }) => {
  await page.goto('/case/X778160/add-frequently-used-contact')

  await expect(page.getByRole('heading', { level: 1 })).toHaveText(laoHeading)
  await expect(page.getByText(restrictionMessage)).toBeVisible()
})

test('shows the exclusion message when the user is excluded', async ({ page }) => {
  await page.goto('/case/X808126/add-frequently-used-contact')

  await expect(page.getByRole('heading', { level: 1 })).toHaveText(laoHeading)
  await expect(page.getByText(exclusionMessage)).toBeVisible()
})

test('shows a default message when the user is excluded without a message', async ({ page }) => {
  await page.goto('/case/X900001/add-frequently-used-contact')

  await expect(page.getByRole('heading', { level: 1 })).toHaveText(laoHeading)
  await expect(page.getByText('You are not authorised to view this case.')).toBeVisible()
})

test('restricts every page under the case', async ({ page }) => {
  await page.goto('/case/X778160/contacts/add-internal-communications')

  await expect(page.getByRole('heading', { level: 1 })).toHaveText(laoHeading)
})

test('shows a back link when a backUrl is provided', async ({ page }) => {
  await page.goto('/case/X778160/add-frequently-used-contact?backUrl=/previous-page')

  await expect(page.getByRole('link', { name: 'Back', exact: true })).toHaveAttribute('href', '/previous-page')
})

test('does not show a back link when no backUrl is provided', async ({ page }) => {
  await page.goto('/case/X778160/add-frequently-used-contact')

  await expect(page.getByRole('link', { name: 'Back', exact: true })).toHaveCount(0)
})

test('shows the not found page for an invalid crn', async ({ page }) => {
  await page.goto('/case/INVALID/add-frequently-used-contact')

  await expect(page.locator('h1')).toContainText('Page not found')
})
