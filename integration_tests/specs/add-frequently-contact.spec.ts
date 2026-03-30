import { test, expect } from '@playwright/test'
import AddFrequentContactPage from '../pages/add-frequently-contact'

test('user can select appointment contact', async ({ page }) => {
  const addContactPage = new AddFrequentContactPage(page)

  await page.goto('/case/X123456/add-frequently-used-contact')

  await addContactPage.selectContact('C326')
  await addContactPage.clickContinue()

  await expect(page).toHaveURL('case/X123456/contacts/add-internal-communications')
})
