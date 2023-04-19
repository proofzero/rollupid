import { test, expect } from '@playwright/test'

test('has title', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Passport/)
})

test('login to passport using Twitter', async ({ page }) => {
  await page.goto('/')

  // Expects the URL to contain intro.
  await expect(page).toHaveURL(/.*authenticate\/passport/)

  // Login with Twitter
  await page.getByRole('button', { name: 'twitter' }).click()
  await page.waitForURL(/.*api\.twitter\.com\/oauth\/authenticate/, {
    timeout: 10000,
    waitUntil: 'networkidle',
  })
  await page
    .getByPlaceholder('Username or email')
    .fill(process.env.INTERNAL_TWITTER_TEST_USERNAME)
  await page
    .getByPlaceholder('Password')
    .fill(process.env.SECRET_TWITTER_TEST_USER_PASSWORD)
  await page.getByRole('button').filter({ hasText: 'Sign In' }).click()
  await page.waitForURL(/.*settings\/dashboard/, {
    timeout: 10000,
    waitUntil: 'networkidle',
  })
  await expect(page).toHaveURL(/.*settings\/dashboard/)
})
