import { test, expect } from '@playwright/test'

test('login to console using Email', async ({ page, request }) => {
  await page.goto('/')

  // Expects the URL to contain intro.
  await expect(page).toHaveURL(/.*authenticate\/console/)

  // Login with Email
  await page.getByRole('button', { name: 'email' }).click()
  await page.waitForURL(/.*authenticate\/console\/email/, {
    timeout: 5000,
    waitUntil: 'networkidle',
  })

  const email = process.env.INTERNAL_EMAIL_TEST_USERNAME?.replace(/(\d)/, '1')
  console.debug({ email })
  if (!email) {
    throw new Error('INTERNAL_EMAIL_TEST_USERNAME is not set')
  }

  await page.fill('[id="email"]', email)

  const otpPromise = page.waitForResponse(/.*connect\/email\/otp/)
  await page.getByRole('button').filter({ hasText: 'Send Code' }).click()
  await page.waitForURL(/.*authenticate\/console\/email\/verify/, {
    timeout: 5000,
    waitUntil: 'networkidle',
  })
  await page.waitForTimeout(5000)
  const otpStatRes = await otpPromise
  console.debug('otpStatRes: ', otpStatRes.status(), otpStatRes.statusText())
  const state = await otpStatRes.json()
  console.debug({ state })
})
