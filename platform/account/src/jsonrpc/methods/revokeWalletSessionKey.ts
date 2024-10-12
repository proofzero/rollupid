import { z } from 'zod'
import { createPublicClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { polygonMumbai as chain } from 'viem/chains'
import { signerToEcdsaValidator } from '@zerodev/ecdsa-validator'
import {
  createKernelAccount,
  createKernelAccountClient,
  createZeroDevPaymasterClient,
} from '@zerodev/sdk'
import { revokeSessionKey } from '@zerodev/session-key'

import { BadRequestError } from '@proofzero/errors'

import { AccountURNSpace } from '@proofzero/urns/account'
import { AccountURNInput } from '@proofzero/platform-middleware/inputValidators'

import { Hex } from '../validators/wallet'
import type { Context } from '../../context'
import { type AccountNode, initAccountNodeByName } from '../../nodes'
import { generateSmartWalletAccountUrn } from '../../utils'

export const RevokeWalletSessionKeyInput = z.object({
  projectId: z.string(),
  sessionKeyAddress: Hex,
  smartContractWalletAddress: Hex,
})

export const RevokeWalletSessionKeyBatchInput = z.object({
  projectId: z.string(),
  smartWalletSessionKeys: z.array(
    z.object({
      urn: AccountURNInput,
      sessionKeyAddress: Hex,
    })
  ),
})

type RevokeWalletSessionKeyParams = z.infer<typeof RevokeWalletSessionKeyInput>
type RevokeWalletSessionKeyBatchParams = z.infer<
  typeof RevokeWalletSessionKeyBatchInput
>

export const revokeWalletSessionKeyMethod = async ({
  input,
  ctx,
}: {
  input: RevokeWalletSessionKeyParams
  ctx: Context
}): Promise<void> => {
  const { baseAccountURN } = generateSmartWalletAccountUrn(
    input.smartContractWalletAddress,
    ''
  )

  const smartContractWalletNode = initAccountNodeByName(
    baseAccountURN,
    ctx.env.Account
  )

  await revokeWalletSessionKey({
    projectId: input.projectId,
    sessionKeyAddress: input.sessionKeyAddress,
    smartContractWalletNode,
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
        sessionKeyAddress: smartWalletSessionKey.sessionKeyAddress,
      })
    )
  }
  return await Promise.all(resultPromises)
}

const revokeWalletSessionKey = async ({
  projectId,
  sessionKeyAddress,
  smartContractWalletNode,
}: {
  smartContractWalletNode: AccountNode
  projectId: string
  sessionKeyAddress: Hex
}) => {
  const privateKey = await smartContractWalletNode.storage.get<Hex>(
    'privateKey'
  )

  if (!privateKey) {
    throw new BadRequestError({ message: 'missing private key for the user' })
  }

  const publicClient = createPublicClient({ chain, transport: http() })

  const account = await createKernelAccount(publicClient, {
    plugins: {
      validator: await signerToEcdsaValidator(publicClient, {
        signer: privateKeyToAccount(privateKey),
      }),
    },
  })

  const kernelClient = createKernelAccountClient({
    account,
    chain,
    transport: http(`https://rpc.zerodev.app/api/v2/bundler/${projectId}`),
    sponsorUserOperation: async ({ userOperation }) => {
      const zerodevPaymaster = createZeroDevPaymasterClient({
        chain: chain,
        transport: http(
          `https://rpc.zerodev.app/api/v2/paymaster/${projectId}`
        ),
      })
      return zerodevPaymaster.sponsorUserOperation({
        userOperation,
      })
    },
  })

  const hash = await revokeSessionKey(kernelClient, sessionKeyAddress)
  await publicClient.waitForTransactionReceipt({ hash })
}
