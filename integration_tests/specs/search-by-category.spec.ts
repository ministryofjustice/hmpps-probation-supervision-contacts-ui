import { test, expect } from '@playwright/test'
import SearchByCategoryPage from '../pages/search-by-category'
import { login, resetStubs } from '../testUtils'
import masApi from '../mockApis/masApi'
import arnsApi from '../mockApis/arnsApi'
import tierApi from '../mockApis/tierApi'

const flagConfig = [{ key: 'searchContactsByCategory', enabled: true }]

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
  await login(page, { flags: flagConfig })
})

test.afterEach(async () => {
  await resetStubs()
})

test('user can search by category and see results', async ({ page }) => {
  const searchPage = new SearchByCategoryPage(page)

  await page.goto('/case/X123456/add-frequently-used-contact')
  await searchPage.openSearchByCategoryTab()

  await searchPage.selectCategory('Referrals')
  await searchPage.clickSearch()

  await expect(page.getByRole('heading', { name: 'Search results' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Health and well being referral' })).toBeVisible()
})

test('clear removes results and resets selections', async ({ page }) => {
  const searchPage = new SearchByCategoryPage(page)

  await page.goto('/case/X123456/add-frequently-used-contact')
  await searchPage.openSearchByCategoryTab()

  await searchPage.selectCategory('Referrals')
  await searchPage.clickSearch()

  await expect(page.getByRole('heading', { name: 'Search results' })).toBeVisible()

  await searchPage.clickClear()

  await expect(page.getByRole('heading', { name: 'Search results' })).toHaveCount(0)
  await expect(page.getByLabel('Referrals')).not.toBeChecked()
})

test('search without selection shows error summary', async ({ page }) => {
  const searchPage = new SearchByCategoryPage(page)

  await page.goto('/case/X123456/add-frequently-used-contact')
  await searchPage.openSearchByCategoryTab()

  await searchPage.clickSearch()

  await expect(page.getByText('There is a problem')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Select a category' })).toBeVisible()
  await expect(page.locator('#categories-error')).toBeVisible()
})
