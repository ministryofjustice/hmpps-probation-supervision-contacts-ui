import { test, expect } from '@playwright/test'
import SearchByKeywordPage from '../pages/search-by-keyword'
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

test('user can open the search by keyword tab', async ({ page }) => {
  const keywordPage = new SearchByKeywordPage(page)

  await page.goto('/case/X123456/add-frequently-used-contact')
  await keywordPage.openSearchByKeywordTab()

  await expect(page.locator('#search-by-keyword')).not.toHaveClass(/govuk-tabs__panel--hidden/)
  await expect(page.locator('[data-qa="keyword-search-button"]')).toBeVisible()
})

test('submitting an empty keyword shows a validation error', async ({ page }) => {
  const keywordPage = new SearchByKeywordPage(page)

  await page.goto('/case/X123456/add-frequently-used-contact')
  await keywordPage.openSearchByKeywordTab()
  await keywordPage.clickSearch()

  await expect(page.getByText('There is a problem')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Enter a keyword or phrase' })).toBeVisible()
})

test('submitting an invalid character shows a validation error', async ({ page }) => {
  const keywordPage = new SearchByKeywordPage(page)

  await page.goto('/case/X123456/add-frequently-used-contact')
  await keywordPage.openSearchByKeywordTab()
  await keywordPage.search('police!')

  await expect(page.getByText('There is a problem')).toBeVisible()
  await expect(page.getByRole('link', { name: 'You can only search using letters, numbers or hyphens' })).toBeVisible()
})

test('valid keyword search returns results', async ({ page }) => {
  const keywordPage = new SearchByKeywordPage(page)

  await page.goto('/case/X123456/add-frequently-used-contact')
  await keywordPage.openSearchByKeywordTab()
  await keywordPage.search('police liaison')

  await expect(page.locator('[data-qa="keywordResultList"]')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Police liaison' })).toBeVisible()
})

test('keyword search with no matches shows no results message', async ({ page }) => {
  const keywordPage = new SearchByKeywordPage(page)

  await page.goto('/case/X123456/add-frequently-used-contact')
  await keywordPage.openSearchByKeywordTab()
  await keywordPage.search('zzznomatch')

  await expect(page.locator('[data-qa="keywordResultList"]')).toBeVisible()
  await expect(page.getByText('0 results')).toBeVisible()
})

test('category tab error does not show on keyword tab', async ({ page }) => {
  const categoryPage = new SearchByCategoryPage(page)
  const keywordPage = new SearchByKeywordPage(page)

  await page.goto('/case/X123456/add-frequently-used-contact')
  await categoryPage.openSearchByCategoryTab()
  await categoryPage.clickSearch()

  await expect(page.getByRole('link', { name: 'Select a category' })).toBeVisible()

  await keywordPage.openSearchByKeywordTab()

  await expect(page.locator('#search-by-keyword').getByText('Select a category')).toHaveCount(0)
})
