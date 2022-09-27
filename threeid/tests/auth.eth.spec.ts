import { 
  test,
  expect,
} from '@playwright/test';

import { 
  invitedUsertest,
  users,
 } from './helpers'


test.describe('Auth Gateway', () => {

  test("Landing page apiRequestContextredirects to /auth", async ({ page }) => {
    const response = await page.goto("/");
    const request = response.request()

    expect(request.redirectedFrom().redirectedTo() === request)
    await expect(page).toHaveURL(/.*auth/);
  });

  test("Nonce page apiRequestContext redirects to /auth", async ({ page }) => {
    const address = users.invited.address
    const nonceUrl = `/auth/nonce/${address}`
    await page.goto(nonceUrl);
    await expect(page).toHaveURL(/.*auth/);
  });

  test("Sign page redirects back to /auth if no nonce present", async ({ page }) => {
    const address = users.invited.address
    const signUrl = `/auth/sign/${address}`
    await page.goto(signUrl);
    // goes back to get nonce
    await expect(page).toHaveURL(/.*auth/);
  });

  test("Sign page loads with nonce present", async ({ page }) => {
    const address = users.invited.address
    const signUrl = `/auth/sign/${address}?nonce=fakeNonce&isTest=true`
    await page.goto(signUrl);
    await expect(page).toHaveURL(/.*auth\/.*sign\/.*\?nonce=?/);

  });

  test("Gate page redirects back to /auth if not connected", async ({ page }) => {
    const address = users.invited.address
    const signUrl = `/auth/gate/${address}`
    await page.goto(signUrl);
    await expect(page).toHaveURL(/.*auth\?redirectTo=?/);
  });

});

test.describe('ETH Auth Flow', () => {

  invitedUsertest("Login to dapp with eth account", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/.*account/);
  });

});

