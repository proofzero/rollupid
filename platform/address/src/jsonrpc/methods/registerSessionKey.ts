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
import { BadRequestError, InternalServerError } from '@proofzero/errors'

export const RegisterSessionKeyInput = z.object({
  sessionPublicKey: z.string(),
  smartContractWalletAddress: z.string(),
  paymaster: PaymasterSchema,
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
  // This method is being called only from galaxy
  // All authorization checks are done in galaxy

  const { paymaster, smartContractWalletAddress, sessionPublicKey } = input

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

    // We need a 90 days in Unix time from now
    // 90 days * 24 hours * 60 minutes * 60 seconds * 1000 milliseconds
    const truncatedValidUntil =
      Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60 * 1000

    try {
      sessionKey = await createSessionKey(
        zdSigner,
        [],
        truncatedValidUntil,
        sessionPublicKey
      )
    } catch (e) {
      throw new InternalServerError({ message: 'Failed to create session key' })
    }
  }

  return sessionKey
}
