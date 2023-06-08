import fs from 'fs'
import path from 'path'

import { ethers } from 'ethers'

import { test as baseTest } from '@playwright/test'
import { AuthenticationScreenDefaults } from '@proofzero/design-system/src/templates/authentication/Authentication'

export const dappUrl = `${process.env.DAPP_SCHEMA}://${process.env.DAPP_HOST}:${process.env.DAPP_PORT}`

export const users = {
  invited: new ethers.Wallet(process.env.ETH_GOERLI_PK || ''),
  uninvited: ethers.Wallet.createRandom(),
}

export const invitedUsertest = baseTest.extend({
  storageState: async ({ browser }, use, testInfo) => {
    // Override storage state, use worker index to look up logged-in info and generate it lazily.
    const fileName = path.join(
      testInfo.project.outputDir,
      'storage-invitedUser.json'
    )
    if (!fs.existsSync(fileName)) {
      // Make sure we are not using any other storage state.
      const address = users.invited.address
      const nonceUrl = `${dappUrl}/auth/nonce/${address}?isTest=true`

      const page = await browser.newPage({ storageState: undefined })
      await page.goto(nonceUrl)

      // get nonce
      const signUrl = page.url()
      const url = new URL(signUrl)
      const nonce = url.searchParams.get('nonce') || ''

      // sign a login message
      const nonceMessage =
        AuthenticationScreenDefaults.defaultSignMessage.replace(
          '{{nonce}}',
          nonce
        )
      const signature = await users.invited.signMessage(nonceMessage)

      // get jwt
      await page.request.post(signUrl, {
        form: {
          nonce,
          signature,
        },
      })

      // Save signed-in state to 'storageState.json'.
      await page.context().storageState({ path: fileName })
      await page.close()
    }
    await use(fileName)
  },
})
