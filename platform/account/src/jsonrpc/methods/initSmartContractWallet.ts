import { z } from 'zod'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { polygonMumbai as chain } from 'viem/chains'
import { createEcdsaKernelAccountClient } from '@zerodev/presets/zerodev'

import { router } from '@proofzero/platform.core'
import { AccountURNInput } from '@proofzero/platform-middleware/inputValidators'

import { Hex } from '../validators/wallet'
import { Context } from '../../context'
import { CryptoAccountType, NodeType } from '@proofzero/types/account'
import { initAccountNodeByName } from '../../nodes'

import createImageClient from '@proofzero/platform-clients/image'
import { EDGE_ACCOUNT } from '@proofzero/platform.account/src/constants'

import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { generateSmartWalletAccountUrn } from '@proofzero/platform.account/src/utils'

export const InitSmartContractWalletInput = z.object({
  nickname: z.string(),
})

type InitSmartContractWalletInput = z.infer<typeof InitSmartContractWalletInput>

export const InitSmartContractWalletOutput = z.object({
  accountURN: AccountURNInput,
  walletAccount: Hex,
})

type InitSmartContractWalletResult = z.infer<
  typeof InitSmartContractWalletOutput
>

export const initSmartContractWalletMethod = async ({
  input,
  ctx,
}: {
  input: InitSmartContractWalletInput
  ctx: Context
}): Promise<InitSmartContractWalletResult> => {
  const nodeClient = ctx.account

  const identity = await nodeClient?.class.getIdentity()
  if (!identity) {
    throw new Error('missing identity')
  }

  const projectId = ctx.env.SECRET_ZERODEV_PROJECTID

  const privateKey = generatePrivateKey()
  const signer = privateKeyToAccount(privateKey)

  const kernelClient = await createEcdsaKernelAccountClient({
    chain,
    projectId,
    signer,
  })

  const smartContractWalletAddress = kernelClient.account.address

  const { accountURN, baseAccountURN } = generateSmartWalletAccountUrn(
    smartContractWalletAddress,
    input.nickname
  )

  const smartContractWalletNode = initAccountNodeByName(
    baseAccountURN,
    ctx.env.Account
  )

  const imageClient = createImageClient(ctx.env.Images, {
    headers: generateTraceContextHeaders(ctx.traceSpan),
  })
  const gradient = await imageClient.getGradient.mutate({
    gradientSeed: smartContractWalletAddress,
  })
  await Promise.all([
    smartContractWalletNode.storage.put('privateKey', privateKey),
    smartContractWalletNode.class.setAddress(smartContractWalletAddress),
    smartContractWalletNode.class.setNickname(input.nickname),
    smartContractWalletNode.class.setNodeType(NodeType.Crypto),
    smartContractWalletNode.class.setType(CryptoAccountType.Wallet),
    smartContractWalletNode.class.setGradient(gradient),
  ])

  // Store the owning identity for the account node in the node
  // itself.
  await smartContractWalletNode.class.setIdentity(identity)

  const caller = router.createCaller(ctx)
  await caller.edges.makeEdge({
    src: identity,
    dst: accountURN,
    tag: EDGE_ACCOUNT,
  })

  return { accountURN, walletAccount: smartContractWalletAddress }
}
