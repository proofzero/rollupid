import { z } from 'zod'

import { arrayify } from '@ethersproject/bytes'
import { BadRequestError } from '@proofzero/errors'

import { AddressURNSpace, type AddressURN } from '@proofzero/urns/address'
import { Wallet } from '@ethersproject/wallet'
import { AddressURNInput } from '@proofzero/platform-middleware/inputValidators'

import type { Context } from '../../context'
import { initAddressNodeByName } from '../../nodes'

export const RevokeWalletSessionKeyInput = z.object({
  publicSessionKey: z.string(),
  projectId: z.string(),
})

export const RevokeWalletSessionKeyBatchInput = z.object({
  projectId: z.string(),
  smartWalletSessionKeys: z.array(
    z.object({
      urn: AddressURNInput,
      publicSessionKey: z.string(),
    })
  ),
})

type RevokeWalletSessionKeyParams = z.infer<typeof RevokeWalletSessionKeyInput>
type RevokeWalletSessionKeyBatchParams = z.infer<
  typeof RevokeWalletSessionKeyBatchInput
>

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

  await revokeWalletSessionKey({
    smartContractWalletNode,
    projectId: input.projectId,
    publicSessionKey: input.publicSessionKey,
  })
}

export const revokeWalletSessionKeyBatchMethod = async ({
  input,
  ctx,
}: {
  input: RevokeWalletSessionKeyBatchParams
  ctx: Context
}) => {
  const resultPromises = []
  for (const smartWalletSessionKey of input.smartWalletSessionKeys) {
    const baseURN = AddressURNSpace.getBaseURN(smartWalletSessionKey.urn)
    const smartContractWalletNode = initAddressNodeByName(baseURN, ctx.Address)
    resultPromises.push(
      revokeWalletSessionKey({
        smartContractWalletNode,
        projectId: input.projectId,
        publicSessionKey: smartWalletSessionKey.publicSessionKey,
      })
    )
  }
  return await Promise.all(resultPromises)
}

const revokeWalletSessionKey = async ({
  smartContractWalletNode,
  projectId,
  publicSessionKey,
}: {
  smartContractWalletNode: any
  projectId: string
  publicSessionKey: string
}) => {
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
        projectId,
        publicSessionKey,
      }),
    }
  )

  const { userOp, userOpHash } =
    (await createRevokeSessionKeyUserOpResponse.json()) as {
      userOp: any
      userOpHash: string
    }

  const signedMessage = await signer.signMessage(arrayify(userOpHash))

  await fetch('https://zerodev-api.zobeir.workers.dev/send-userop', {
    ...requestInit,
    body: JSON.stringify({
      userOp: { ...userOp, signature: signedMessage },
      projectId,
    }),
  })
}
