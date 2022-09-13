import { test, expect } from '@playwright/test';
import { ethers } from "ethers";

let goerliInviteWallet: ethers.Wallet;
const dappUrl = `${process.env.DAPP_SCHEMA}://${process.env.DAPP_HOST}:${process.env.DAPP_PORT}`

test.describe('Auth Gateway', () => {

  test("Landing page redirects to /auth", async ({ page }) => {
    const response = await page.goto(dappUrl);
    const request = response.request()

    expect(request.redirectedFrom().redirectedTo() === request)
    await expect(page).toHaveURL(/.*auth/);
  });

});

test.describe('ETH Auth Flow', () => {

  test.beforeAll(async () => {
    // Setup goerli eth account
    const pk: string = process.env.ETH_GOERLI_PK || "";
    console.log("ETH_GOERLI_PK", pk);
    goerliInviteWallet = new ethers.Wallet(pk);
  });

  test("Login to dapp with eth account", async ({ page }) => {
    // sign a login message
    const signature = goerliInviteWallet.signMessage("hello")
    console.log("signature", signature)
  });

});

