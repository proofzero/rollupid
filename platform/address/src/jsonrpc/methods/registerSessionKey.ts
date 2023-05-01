import { z } from 'zod'

import { AddressURNSpace } from '@proofzero/urns/address'
import { generateHashedIDRef } from '@proofzero/urns/idref'

import { Context } from '../../context'
import { CryptoAddressType, NodeType } from '@proofzero/types/address'
import { initAddressNodeByName } from '../../nodes'
import {
  createSessionKey,
  getZeroDevSigner,
  getPrivateKeyOwner,
} from '@zerodevapp/sdk'

import { PaymasterSchema } from '@proofzero/platform/starbase/src/jsonrpc/validators/app'
import { BadRequestError } from '@proofzero/errors'

export const WhitelistSchema = z.array(
  z.object({
    to: z.string(),
    selectors: z.array(z.string()),
  })
)

export type WhitelistType = z.infer<typeof WhitelistSchema>

export const RegisterSessionKeyInput = z.object({
  sessionPublicKey: z.string(),
  smartContractWalletAddress: z.string(),
  paymaster: PaymasterSchema,
  validUntil: z.number(),
  whitelist: WhitelistSchema,
})

export const RegisterSessionKeyOutput = z.string()

type RegisterSessionKeyParams = z.infer<typeof RegisterSessionKeyInput>

type RegisterSessionKeyResult = z.infer<typeof RegisterSessionKeyOutput>

export const registerSessionKeyMethod = async ({
  input,
  ctx,
}: {
  input: RegisterSessionKeyParams
  ctx: Context
}): Promise<RegisterSessionKeyResult> => {
  const {
    paymaster,
    smartContractWalletAddress,
    sessionPublicKey,
    validUntil,
    whitelist,
  } = input

  const addressURN = AddressURNSpace.componentizedUrn(
    generateHashedIDRef(CryptoAddressType.Wallet, smartContractWalletAddress),
    {
      node_type: NodeType.Crypto,
      addr_type: CryptoAddressType.Wallet,
    },
    { alias: smartContractWalletAddress, hidden: 'true' }
  )

  const baseAddressURN = AddressURNSpace.getBaseURN(addressURN)
  const smartContractWalletNode = initAddressNodeByName(
    baseAddressURN,
    ctx.Address
  )

  const ownerPrivateKey = (await smartContractWalletNode.storage.get(
    'privateKey'
  )) as string

  if (!ownerPrivateKey) {
    throw new BadRequestError({ message: 'missing private key for the user' })
  }

  let sessionKey = ''

  if (paymaster!.provider === 'zerodev') {
    const zdSigner = await getZeroDevSigner({
      projectId: paymaster!.secret, // dev project id
      owner: getPrivateKeyOwner(ownerPrivateKey), // owner private key
      skipFetchSetup: true,
    })

    const truncatedValidUntil =
      Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60 * 1000
        ? Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60 * 1000
        : validUntil

    sessionKey = await createSessionKey(
      zdSigner,
      whitelist,
      truncatedValidUntil,
      sessionPublicKey
    )
  }

  return sessionKey
}
