import { z } from 'zod'
import { toBytes } from 'viem'

import { BadRequestError } from '@proofzero/errors'

import { AccountURNSpace, type AccountURN } from '@proofzero/urns/account'
import { Wallet } from '@ethersproject/wallet'
import { AccountURNInput } from '@proofzero/platform-middleware/inputValidators'

import type { Context } from '../../context'
import { initAccountNodeByName } from '../../nodes'

export const RevokeWalletSessionKeyInput = z.object({
  publicSessionKey: z.string(),
  projectId: z.string(),
})

export const RevokeWalletSessionKeyBatchInput = z.object({
  projectId: z.string(),
  smartWalletSessionKeys: z.array(
    z.object({
      urn: AccountURNInput,
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
  const smartContractWalletNode = initAccountNodeByName(
    ctx.accountURN as AccountURN,
    ctx.env.Account
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
    const baseURN = AccountURNSpace.getBaseURN(smartWalletSessionKey.urn)
    const smartContractWalletNode = initAccountNodeByName(
      baseURN,
      ctx.env.Account
    )
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
  )) as '0x${string}'

  if (!owner) {
    throw new BadRequestError({ message: 'missing private key for the user' })
  }

  const signer = new Wallet(owner)

  const createRevokeSessionKeyUserOpResponse = await fetch(
    'https://zerodev-api.zobeir.workers.dev/create-revoke-session-key-user-op',
    {
      ...requestInit,
      body: JSON.stringify({
        address: await signer.getAddress(),
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

  const signedMessage = await signer.signMessage(toBytes(userOpHash))

  await fetch('https://zerodev-api.zobeir.workers.dev/send-userop', {
    ...requestInit,
    body: JSON.stringify({
      userOp: { ...userOp, signature: signedMessage },
      projectId,
    }),
  })
}
