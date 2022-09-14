import { chromium, FullConfig } from '@playwright/test';
import { ethers } from "ethers";

import { 
    dappUrl,
    signMessageTemp,
} from './helpers'

const pk: string = process.env.ETH_GOERLI_PK || "";
const goerliInviteWallet = new ethers.Wallet(pk);

async function globalSetup(config: FullConfig) {
    
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    await page.goto(dappUrl);

    const address = goerliInviteWallet.address
    const nonceUrl = `${dappUrl}/auth/nonce/${address}?isTest=true`
    await page.goto(nonceUrl);

    // get nonce
    const signUrl = page.url()
    const url = new URL(signUrl);
    const nonce = url.searchParams.get("nonce") || ''

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

    // Save signed-in state to 'storageState.json'.
    await page.context().storageState({ path: 'storageState.json' });
    await browser.close();
}

export default globalSetup;