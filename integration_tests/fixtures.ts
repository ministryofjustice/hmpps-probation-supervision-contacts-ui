import { test as testBase } from '@playwright/test'
import { addCoverageReport } from 'monocart-reporter'

export const test = testBase.extend({
  page: async ({ page }, use, testInfo) => {
    try {
      await page.coverage.startJSCoverage({
        resetOnNavigation: false,
      })
    } catch (error) {
      // Ignore if it's already enabled, rethrow any other unexpected error
      if (error instanceof Error && !error.message.includes('JSCoverage is already enabled')) {
        throw error
      }
    }

    await use(page)

    const coverage = await page.coverage.stopJSCoverage()
    if (coverage && coverage.length > 0) {
      await addCoverageReport(coverage, testInfo)
    }
  },
})
