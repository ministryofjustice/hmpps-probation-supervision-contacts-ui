import { test, expect } from '@playwright/test'
import { login, resetStubs } from '../testUtils'
import masApi from '../mockApis/masApi'
import arnsApi from '../mockApis/arnsApi'
import tierApi from '../mockApis/tierApi'

test.beforeEach(async () => {
  await Promise.all([
    masApi.stubGetPersonalDetails('X123456'),
    arnsApi.stubGetRisks(),
    tierApi.stubGetCalculationDetails(),
    tierApi.stubGetTierDetailsV3('A1'),
    arnsApi.stubGetPredictorsAll(),
    masApi.stubGetProbationPractitioner(),
    masApi.stubGetSentences(),
    masApi.stubGetOverview(),
  ])
})

test.afterEach(async () => {
  await resetStubs()
})

test('shows the new pop header when enableSupervisionPackagePoPHeader flag is enabled', async ({ page }) => {
  await login(page, { flags: [{ key: 'enableSupervisionPackagePoPHeader', enabled: true }] })

  await page.goto('/case/X123456/add-frequently-used-contact')

  const newHeader = page.locator('[data-qa="new-pop-header"]')
  await expect(newHeader).toBeVisible()
  await expect(newHeader.locator('[data-qa="crn"]')).toHaveText('X123456')
  await expect(newHeader.locator('[data-qa="headerDateOfBirthValue"]')).toHaveText('1 January 1990')
  await expect(newHeader.getByRole('link', { name: /Tier: A1/ })).toHaveAttribute('href', /\/v3\/case\/X123456/)
})

test('shows the fallback header when enableSupervisionPackagePoPHeader flag is disabled', async ({ page }) => {
  await login(page, { flags: [{ key: 'enableSupervisionPackagePoPHeader', enabled: false }] })

  await page.goto('/case/X123456/add-frequently-used-contact')

  await expect(page.locator('[data-qa="new-pop-header"]')).toHaveCount(0)
  await expect(page.locator('[data-qa="crn"]')).toHaveText('X123456')
})
