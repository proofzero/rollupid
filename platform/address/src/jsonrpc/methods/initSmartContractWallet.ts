import { z } from 'zod'
import { Wallet } from '@ethersproject/wallet'

import { AddressURNInput } from '@proofzero/platform-middleware/inputValidators'
import { JsonRpcProvider } from '@ethersproject/providers'

import createEdgesClient from '@proofzero/platform-clients/edges'
import { Context } from '../../context'
import { CryptoAddressType, NodeType } from '@proofzero/types/address'
import { initAddressNodeByName } from '../../nodes'
import createImageClient from '@proofzero/platform-clients/image'
import { getZeroDevSigner } from '@zerodevapp/sdk'
import { EDGE_ADDRESS } from '@proofzero/platform.address/src/constants'

import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { generateSmartWalletAddressUrn } from '@proofzero/platform.address/src/utils'

export const InitSmartContractWalletInput = z.object({
  nickname: z.string(),
})

type InitSmartContractWalletInput = z.infer<typeof InitSmartContractWalletInput>

export const InitSmartContractWalletOutput = z.object({
  addressURN: AddressURNInput,
  walletAddress: z.string(),
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
  const nodeClient = ctx.address
  const account = await nodeClient?.class.getAccount()

  if (!account) {
    throw new Error('missing account')
  }

  const owner = Wallet.createRandom()

  const projectInfoRes = await fetch(
    `https://prod-api.zerodev.app/projects/${ctx.SECRET_ZERODEV_PROJECTID}`,
    { headers: { accept: 'application/json' } }
  )

  const projectInfo = (await projectInfoRes.json()) as {
    id: string
    name: string
    chainId: string
  }

  let ALCHEMY_PROVIDER_URL = ctx.ALCHEMY_MUMBAI_PROVIDER_URL // by default

  switch (projectInfo.chainId) {
    case '1':
      ALCHEMY_PROVIDER_URL = ctx.ALCHEMY_ETH_PROVIDER_URL
      break
    case '5':
      ALCHEMY_PROVIDER_URL = ctx.ALCHEMY_GOERLI_PROVIDER_URL
      break
    case '137':
      ALCHEMY_PROVIDER_URL = ctx.ALCHEMY_POLYGON_PROVIDER_URL
      break
    case '80001':
      ALCHEMY_PROVIDER_URL = ctx.ALCHEMY_MUMBAI_PROVIDER_URL
  }

  const smartContractWallet = await getZeroDevSigner({
    skipFetchSetup: true,
    rpcProvider: new JsonRpcProvider({
      url: ALCHEMY_PROVIDER_URL,
      skipFetchSetup: true,
    }),
    projectId: ctx.SECRET_ZERODEV_PROJECTID,
    owner,
  })

  const smartContractWalletAddress = await smartContractWallet.getAddress()

  const { addressURN, baseAddressURN } = generateSmartWalletAddressUrn(
    smartContractWalletAddress,
    input.nickname
  )

  const smartContractWalletNode = initAddressNodeByName(
    baseAddressURN,
    ctx.Address
  )

  const imageClient = createImageClient(ctx.Images, {
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
    smartContractWalletNode.class.setType(CryptoAddressType.Wallet),
    smartContractWalletNode.class.setGradient(gradient),
  ])

  // Store the owning account for the address node in the node itself.
  await smartContractWalletNode.class.setAccount(account)

  const edgesClient = createEdgesClient(ctx.Edges, {
    ...generateTraceContextHeaders(ctx.traceSpan),
  })
  await edgesClient.makeEdge.mutate({
    src: account,
    dst: addressURN,
    tag: EDGE_ADDRESS,
  })

  return { addressURN, walletAddress: smartContractWalletAddress }
}
