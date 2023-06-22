import { defineConfig, devices } from '@playwright/test'
import * as dotenv from 'dotenv'

dotenv.config()

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  testMatch: [/.*gui\.(js|ts|mjs)/],
  /**
   * Run tests in files in parallel -- doesn't work for GuardianUI
   * https://docs.guardianui.com/platform/guardiantest/getting-started/installation
   */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /**
   * Opt out of parallel tests on CI. -- doesn't work for GuardianUI
   * https://docs.guardianui.com/platform/guardiantest/getting-started/installation
   */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: `${
      process.env.INTERNAL_PLAYWRIGHT_BASE_URL || 'http://localhost:10001'
    }`,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  timeout: 120000, 

  // TODO: path to the global setup files.
  // globalSetup: require.resolve('./global-setup'),

  // TODO: path to the global teardown files.
  // globalTeardown: require.resolve('./global-teardown'),

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // TODO: turn on when we have a parallelizable test suite
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // TODO: turn on when we have a parallelizable test suite
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // TODO: turn on when we have a parallelizable test suite
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // TODO: turn on when we have a parallelizable test suite
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ..devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
})
