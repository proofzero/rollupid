import { z } from 'zod'

import { arrayify } from '@ethersproject/bytes'
import { Context } from '../../context'
import { initAddressNodeByName } from '../../nodes'
import { BadRequestError } from '@proofzero/errors'

import type { AddressURN } from '@proofzero/urns/address'
import { Wallet } from '@ethersproject/wallet'

export const RevokeWalletSessionKeyInput = z.object({
  publicSessionKey: z.string(),
  projectId: z.string(),
})

type RevokeWalletSessionKeyParams = z.infer<typeof RevokeWalletSessionKeyInput>
//
const requestInit = {
  method: 'post',
  headers: {
    'content-type': 'application/json;charset=UTF-8',
  },
}

export const revokeWalletSessionKeyMethod = async ({
  input,
  ctx,
}: {
  input: RevokeWalletSessionKeyParams
  ctx: Context
}): Promise<void> => {
  const smartContractWalletNode = initAddressNodeByName(
    ctx.addressURN as AddressURN,
    ctx.Address
  )

  const owner = (await smartContractWalletNode.storage.get(
    'privateKey'
  )) as string

  if (!owner) {
    throw new BadRequestError({ message: 'missing private key for the user' })
  }

  const signer = new Wallet(owner)

  const address = await signer.getAddress()

  const createRevokeSessionKeyUserOpResponse = await fetch(
    'https://zerodev-api.zobeir.workers.dev/create-revoke-session-key-user-op',
    {
      ...requestInit,
      body: JSON.stringify({
        address,
        projectId: input.projectId,
        publicSessionKey: input.publicSessionKey,
      }),
    }
  )

  //@ts-ignore
  const { userOp, userOpHash } =
    await createRevokeSessionKeyUserOpResponse.json()

  const signedMessage = await signer.signMessage(arrayify(userOpHash))

  await fetch('https://zerodev-api.zobeir.workers.dev/send-userop', {
    ...requestInit,
    body: JSON.stringify({
      userOp: { ...userOp, signature: signedMessage },
      projectId: input.projectId,
    }),
  })
}
