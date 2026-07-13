import { test, expect } from '@playwright/test'
import SearchByKeywordPage from '../pages/search-by-keyword'
import SearchByCategoryPage from '../pages/search-by-category'
import { login, resetStubs } from '../testUtils'
import masApi from '../mockApis/masApi'
import arnsApi from '../mockApis/arnsApi'
import tierApi from '../mockApis/tierApi'

const crn = 'X123456'

test.beforeEach(async ({ page }) => {
  await Promise.all([
    masApi.stubGetPersonalDetails(crn),
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

test.describe('search by keyword tab', () => {
  let keywordPage: SearchByKeywordPage

  test.beforeEach(async ({ page }) => {
    keywordPage = new SearchByKeywordPage(page)
    await page.goto(`/case/${crn}/add-frequently-used-contact`)
    await keywordPage.openSearchByKeywordTab()
  })

  test('has the correct page title', async ({ page }) => {
    await expect(page).toHaveTitle('Find a contact to add - search by keyword')
  })

  test('tab is visible after clicking', async ({ page }) => {
    await expect(page.locator('#search-by-keyword')).not.toHaveClass(/govuk-tabs__panel--hidden/)
    await expect(keywordPage.searchButton).toBeVisible()
  })

  test('submitting an empty keyword shows a validation error', async ({ page }) => {
    await keywordPage.clickSearch()

    await expect(page.locator('#keyword-error')).toBeVisible()
    await expect(page.locator('#keyword-error')).toContainText('Enter a keyword or phrase')
  })

  test('submitting an invalid character shows a validation error', async ({ page }) => {
    await keywordPage.search('police!')

    await expect(page.locator('#keyword-error')).toBeVisible()
    await expect(page.locator('#keyword-error')).toContainText(
      'You can only search using letters, numbers, hyphens or dashes',
    )
  })

  test('valid keyword search returns results', async ({ page }) => {
    await keywordPage.search('police liaison')

    await expect(page.locator('[data-qa="keywordResultList"]')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Police liaison' })).toBeVisible()
  })

  test('keyword search with no matches shows zero results', async ({ page }) => {
    await keywordPage.search('zzznomatch')

    await expect(page.locator('[data-qa="keywordResultList"]')).toHaveCount(0)
  })
})

test('category tab error does not show on keyword tab', async ({ page }) => {
  const categoryPage = new SearchByCategoryPage(page)
  const keywordPage = new SearchByKeywordPage(page)

  await page.goto(`/case/${crn}/add-frequently-used-contact`)
  await categoryPage.openSearchByCategoryTab()
  await categoryPage.clickSearch()

  await expect(page.getByRole('link', { name: 'Select a category' })).toBeVisible()

  await keywordPage.openSearchByKeywordTab()

  await expect(page.locator('#search-by-keyword').getByText('Select a category')).toHaveCount(0)
})
