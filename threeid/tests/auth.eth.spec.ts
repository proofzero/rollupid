import { 
  test,
  expect,
} from '@playwright/test';
import { ethers } from "ethers";

export const signMessageTemp = `Welcome to 3ID!

Click "Sign" to sign in and accept the 3ID Terms of Service (https://threeid.xyz/tos), no password needed!

This will not trigger a blockchain transaction or cost any gas fees.

You will remain connected until you sign out.

{{nonce}}
`;

let goerliInviteWallet: ethers.Wallet;

const dappUrl = `${process.env.DAPP_SCHEMA}://${process.env.DAPP_HOST}:${process.env.DAPP_PORT}`
const oortUrl = `${process.env.OORT_SCHEMA}://${process.env.OORT_HOST}:${process.env.OORT_PORT}`

test.describe('Auth Gateway', () => {

  test.beforeAll(async () => {
    // Setup goerli eth account
    const pk: string = process.env.ETH_GOERLI_PK || "";
    goerliInviteWallet = new ethers.Wallet(pk);
  });

  test("Landing page apiRequestContextredirects to /auth", async ({ page }) => {
    const response = await page.goto(dappUrl);
    const request = response.request()

    expect(request.redirectedFrom().redirectedTo() === request)
    await expect(page).toHaveURL(/.*auth/);
  });

  test("Nonce page apiRequestContextredirects to /auth/sign/:address", async ({ page }) => {
    const address = goerliInviteWallet.address
    const nonceUrl = `${dappUrl}/auth/nonce/${address}?isTest=true`
    // const signUrl = `${dappUrl}/auth/sign/${address}`
    await page.goto(nonceUrl);
    // await expect(page).toHaveURL(/.*auth/);

    await expect(page).toHaveURL(/.*auth\/.*sign\/.*\?nonce=?/);
  });

  test("Sign page redirects back to /auth/nonce/:address if no nonce present", async ({ page }) => {
    const address = goerliInviteWallet.address
    const signUrl = `${dappUrl}/auth/sign/${address}?isTest=true`
    await page.goto(signUrl);
    // goes back to get nonce
    await expect(page).toHaveURL(/.*auth\/.*sign\/.*\?nonce=?/);
  });

  test("Sign page loads with nonce present", async ({ page }) => {
    const address = goerliInviteWallet.address
    const signUrl = `${dappUrl}/auth/sign/${address}?nonce=fakeNonce&isTest=true`
    await page.goto(signUrl);
    await expect(page).toHaveURL(/.*auth\/.*sign\/.*\?nonce=?/);

  });

  test("Gate page redirects back to /auth if not connected", async ({ page }) => {
    const address = goerliInviteWallet.address
    const signUrl = `${dappUrl}/auth/gate/${address}`
    await page.goto(signUrl);
    await expect(page).toHaveURL(`${dappUrl}/auth`);
  });

});

test.describe('ETH Auth Flow', () => {

  test.beforeAll(async () => {
    // Setup goerli eth ac count
    const pk: string = process.env.ETH_GOERLI_PK || "";
    console.log("ETH_GOERLI_PK", pk);
    goerliInviteWallet = new ethers.Wallet(pk);
  });

  test("Login to dapp with eth account", async ({ page }) => {
    await page.goto(dappUrl);

    const address = goerliInviteWallet.address
    const nonceUrl = `${dappUrl}/auth/nonce/${address}?isTest=true`
    await page.goto(nonceUrl);

    // get nonce
    const signUrl = page.url()
    const url = new URL(signUrl);
    const nonce = url.searchParams.get("nonce") || ''

    expect(nonce).toBeTruthy()

    // sign a login message
    const nonceMessage = signMessageTemp.replace("{{nonce}}", nonce);
    const signature = await goerliInviteWallet.signMessage(nonceMessage)
    
    // get jwt
    const jwtRes = await page.request.post(signUrl, {
      form: {
        nonce,
        signature,
      },
    })
    page.reload()

    await expect(page).toHaveURL(`${dappUrl}/account`);
  });

});

