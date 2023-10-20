import { z } from 'zod'
import { Wallet } from '@ethersproject/wallet'

import { router } from '@proofzero/platform.core'
import { AccountURNInput } from '@proofzero/platform-middleware/inputValidators'

import { Context } from '../../context'
import { CryptoAccountType, NodeType } from '@proofzero/types/account'
import { initAccountNodeByName } from '../../nodes'
import createImageClient from '@proofzero/platform-clients/image'
import { getZeroDevSigner } from '@zerodevapp/sdk'
import { EDGE_ACCOUNT } from '@proofzero/platform.account/src/constants'

import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { generateSmartWalletAccountUrn } from '@proofzero/platform.account/src/utils'

export const InitSmartContractWalletInput = z.object({
  nickname: z.string(),
})

type InitSmartContractWalletInput = z.infer<typeof InitSmartContractWalletInput>

export const InitSmartContractWalletOutput = z.object({
  accountURN: AccountURNInput,
  walletAccount: z.string(),
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

  const owner = Wallet.createRandom()

  const smartContractWallet = await getZeroDevSigner({
    skipFetchSetup: true,
    projectId: ctx.env.SECRET_ZERODEV_PROJECTID,
    owner,
  })

  const smartContractWalletAddress = await smartContractWallet.getAddress()

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
    smartContractWalletNode.storage.put('privateKey', owner.privateKey),
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
