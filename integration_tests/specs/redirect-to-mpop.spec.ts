import { test, expect } from '@playwright/test'
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

test('crn page redirects to page in MPOP', async ({ page }) => {
  await page.goto('/case/X123456')
  expect(page.url()).toBe('http://localhost:9091/case/X123456')
})

test('case page redirects to page in MPOP', async ({ page }) => {
  await page.goto('/case')
  expect(page.url()).toBe('http://localhost:9091/case')
})
