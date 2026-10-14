import { test as testBase } from '@playwright/test'
import { addCoverageReport } from 'monocart-reporter'

export const test = testBase.extend({
  page: async ({ page }, use, testInfo) => {
    await page.coverage.startJSCoverage({
      resetOnNavigation: false,
    })

    await use(page)

    const coverage = await page.coverage.stopJSCoverage()
    if (coverage && coverage.length > 0) {
      await addCoverageReport(coverage, testInfo)
    }
  },
})
