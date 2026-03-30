import { test } from '@playwright/test'
import AddContactPage from '../pages/add-contact'

test('details and date fields are visible and writable', async ({ page }) => {
  const addContactPage = new AddContactPage(page)

  await page.goto('/case/X123456/contacts/add-internal-communications')

  await addContactPage.expectDetailsVisible()
  await addContactPage.enterDetails('This is a simple test contact note')
  await addContactPage.expectDetailsValue('This is a simple test contact note')

  await addContactPage.expectDateVisible()
  await addContactPage.enterDate('17/05/2024')
  await addContactPage.expectDateValue('17/05/2024')
})
