import { test, expect } from '@playwright/test'

test('has title', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Passport/)
})

test('login to passport using Email', async ({ page, request }) => {
  await page.goto('/')

  // Expects the URL to contain intro.
  await expect(page).toHaveURL(/.*authenticate\/passport/)

  // Login with Twitter
  await page.getByRole('button', { name: 'email' }).click()
  await page.waitForURL(/.*authenticate\/passport\/email/, {
    timeout: 5000,
    waitUntil: 'networkidle',
  })

  const email = process.env.INTERNAL_EMAIL_TEST_USERNAME?.replace(/(\d)/, '1')
  if (!email) {
    throw new Error('INTERNAL_EMAIL_TEST_USERNAME is not set')
  }

  await page.fill('[id="email"]', email)
  await page.getByRole('button').filter({ hasText: 'Send Code' }).click()

  await page.waitForURL(/.*authenticate\/passport\/email\/verify/, {
    timeout: 5000,
    waitUntil: 'networkidle',
  })

  await page.waitForTimeout(5000)

  const otpRes = await request.fetch(
    `${process.env.INTERNAL_PLAYWRIGHT_TEST_URL}/otp/${email}`,
    {
      method: 'GET',
      headers: {
        Authentication: `Bearer ${process.env.SECRET_TEST_API_TOKEN}`,
      },
    }
  )
  expect(otpRes.status()).toBe(200)
  const otp = await otpRes.text()
  const otpSplit = otp.split('')
  await page.locator(`#code_0`).fill(otpSplit[0])
  await page.locator(`#code_1`).fill(otpSplit[1])
  await page.locator(`#code_2`).fill(otpSplit[2])
  await page.locator(`#code_3`).fill(otpSplit[3])
  await page.locator(`#code_4`).fill(otpSplit[4])
  await page.locator(`#code_5`).fill(otpSplit[5])
  await page.getByRole('button').filter({ hasText: 'Verify' }).click()

  await page.waitForURL(/.*settings\/dashboard/, {
    timeout: 10000,
    waitUntil: 'networkidle',
  })
  await expect(page).toHaveURL(/.*settings\/dashboard/)
})
