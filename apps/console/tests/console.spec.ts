import { test, expect, Page, APIRequestContext } from '@playwright/test'

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

  const email = process.env.INTERNAL_EMAIL_TEST_USERNAME?.replace(/(\d)/, '6')
  if (!email) {
    throw new Error('INTERNAL_EMAIL_TEST_USERNAME is not set')
  }

  await page.fill('[id="email"]', email)
  await page.getByRole('button').filter({ hasText: 'Send Code' }).click()

  await page.waitForURL(/.*authenticate\/console\/email\/verify/, {
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

  await page.waitForURL(/.*dashboard/, {
    timeout: 10000,
    waitUntil: 'networkidle',
  })
  await expect(page).toHaveURL(/.*dashboard/)
  // TODO: this doesn't work and we still get a race condition.
  // const otpPromise = page.waitForResponse(/.*connect\/email\/otp/)
  // const otpStatRes = await otpPromise
  // console.debug('otpStatRes: ', otpStatRes.status(), otpStatRes.statusText())
  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Console/)

  await testConsoleAppCreation({ page, request })
})

const testConsoleAppCreation = async ({
  page,
  request,
}: {
  page: Page
  request: APIRequestContext
}) => {
  const appName = `test-app-${Date.now()}`

  await page.goto('/dashboard')

  await page.waitForURL(/.*dashboard/, {
    timeout: 10000,
    waitUntil: 'networkidle',
  })

  await page
    .getByRole('button')
    .filter({ hasText: 'Create Application' })
    .click()

  await page.waitForURL(/.*apps\/new/, {
    timeout: 10000,
    waitUntil: 'networkidle',
  })

  await page.waitForSelector('#client_name')

  await page.locator('#client_name').fill(appName)

  await page.getByRole('button').filter({ hasText: 'Create' }).click()

  await page.waitForURL(/.*apps\/.*/, {
    timeout: 5000,
    waitUntil: 'networkidle',
  })

  await page.waitForSelector('#oAuthAppId')

  const appId = await page.locator('#oAuthAppId').getAttribute('value')

  await page.getByRole('button').filter({ hasText: 'Complete Setup' }).click()

  await page.waitForURL(/.*apps\/.*\/auth/, {
    timeout: 5000,
    waitUntil: 'networkidle',
  })

  await page.locator('a', { hasText: 'Connect email address' }).click()

  await page.waitForURL(/.*apps\/.*\/team/, {
    timeout: 5000,
    waitUntil: 'networkidle',
  })

  await page
    .locator(
      'button[data-headlessui-state][type="button"][aria-haspopup="true"][aria-expanded="false"]'
    )
    .nth(2)
    .click()

  const emailSelectorVal = await page
    .locator('[role="option"]')
    .first()
    .innerText()
  await page.locator('[role="option"]').first().click()

  await expect(
    page
      .locator(
        'button[data-headlessui-state][type="button"][aria-haspopup="true"][aria-expanded="false"] p'
      )
      .nth(2)
  ).toHaveText(emailSelectorVal)

  await page.goto(`/apps/${appId}/auth`)

  await page.waitForURL(/.*apps\/.*\/auth/, {
    timeout: 5000,
    waitUntil: 'networkidle',
  })

  expect(page.locator('input[name="termsURL"]')).toBeTruthy()
  expect(page.locator('input[name="privacyURL"]')).toBeTruthy()
}
