import { z } from 'zod'

import { getPrivateKeyOwner, getZeroDevSigner } from '@zerodevapp/sdk'
import { arrayify } from '@ethersproject/bytes'
import { JsonRpcProvider } from '@ethersproject/providers'
import { Context } from '../../context'
import { initAddressNodeByName } from '../../nodes'
import { BadRequestError } from '@proofzero/errors'

import type { AddressURN } from '@proofzero/urns/address'

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

  const owner = await smartContractWalletNode.storage.get('privateKey')

  if (!owner) {
    throw new BadRequestError({ message: 'missing private key for the user' })
  }

  const zdSigner = await getZeroDevSigner({
    projectId: input.projectId,
    owner: getPrivateKeyOwner(owner as string),
    skipFetchSetup: true,
    rpcProvider: new JsonRpcProvider({
      url: ctx.MUMBAI_PROVIDER_URL,
      skipFetchSetup: true,
    }),
  })

  const createRevokeSessionKeyUserOpResponse = await fetch(
    'https://zerodev-api.zobeir.workers.dev/create-revoke-session-key-user-op',
    {
      ...requestInit,
      body: JSON.stringify({
        address: input.publicSessionKey,
        projectId: input.projectId,
        publicSessionKey: input.publicSessionKey,
      }),
    }
  )

  //@ts-ignore
  const { userOp, userOpHash } =
    await createRevokeSessionKeyUserOpResponse.json()

  const signedMessage = await zdSigner.signMessage(arrayify(userOpHash))

  await fetch('https://zerodev-api.zobeir.workers.dev/send-userop', {
    ...requestInit,
    body: JSON.stringify({
      userOp: { ...userOp, signature: signedMessage },
      projectId: input.projectId,
    }),
  })
}
