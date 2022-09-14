import { 
  test,
  expect,
} from '@playwright/test';
import { ethers } from "ethers";

import { 
  invitedUsertest,
 } from './helpers'


 let goerliInviteWallet: ethers.Wallet;


test.describe('Auth Gateway', () => {

  test.beforeAll(async () => {
    // Setup goerli eth account
    const pk: string = process.env.ETH_GOERLI_PK || "";
    goerliInviteWallet = new ethers.Wallet(pk);
  });

  test("Landing page apiRequestContextredirects to /auth", async ({ page }) => {
    const response = await page.goto("/");
    const request = response.request()

    expect(request.redirectedFrom().redirectedTo() === request)
    await expect(page).toHaveURL(/.*auth/);
  });

  test("Nonce page apiRequestContextredirects to /auth/sign/:address", async ({ page }) => {
    const address = goerliInviteWallet.address
    const nonceUrl = `/auth/nonce/${address}?isTest=true`
    // const signUrl = `${dappUrl}/auth/sign/${address}`
    await page.goto(nonceUrl);
    // await expect(page).toHaveURL(/.*auth/);

    await expect(page).toHaveURL(/.*auth\/.*sign\/.*\?nonce=?/);
  });

  test("Sign page redirects back to /auth/nonce/:address if no nonce present", async ({ page }) => {
    const address = goerliInviteWallet.address
    const signUrl = `/auth/sign/${address}?isTest=true`
    await page.goto(signUrl);
    // goes back to get nonce
    await expect(page).toHaveURL(/.*auth\/.*sign\/.*\?nonce=?/);
  });

  test("Sign page loads with nonce present", async ({ page }) => {
    const address = goerliInviteWallet.address
    const signUrl = `/auth/sign/${address}?nonce=fakeNonce&isTest=true`
    await page.goto(signUrl);
    await expect(page).toHaveURL(/.*auth\/.*sign\/.*\?nonce=?/);

  });

  test("Gate page redirects back to /auth if not connected", async ({ page }) => {
    const address = goerliInviteWallet.address
    const signUrl = `/auth/gate/${address}`
    await page.goto(signUrl);
    await expect(page).toHaveURL(`/auth`);
  });

});
  // test.beforeEach(async ({ page }) => {
  //   //logout
  //   page.context().storageState({ path: undefined });
  // });
test.describe('ETH Auth Flow', () => {

  test.beforeAll(async () => {
    // Setup goerli eth ac count
    const pk: string = process.env.ETH_GOERLI_PK || "";
    goerliInviteWallet = new ethers.Wallet(pk);
  });

  invitedUsertest("Login to dapp with eth account", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/.*account/);
  });

});

