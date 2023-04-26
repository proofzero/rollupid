import { z } from 'zod'
import { Wallet } from '@ethersproject/wallet'

import { AddressURNSpace } from '@proofzero/urns/address'
import { generateHashedIDRef } from '@proofzero/urns/idref'
import { AddressURNInput } from '@proofzero/platform-middleware/inputValidators'

import { appRouter } from '../router'
import { Context } from '../../context'
import { CryptoAddressType, NodeType } from '@proofzero/types/address'
import { initAddressNodeByName } from '../../nodes'
import createImageClient from '@proofzero/platform-clients/image'
import { getZeroDevSigner } from '@zerodevapp/sdk'

import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'

export const InitSmartContractWalletOutput = z.object({
  addressURN: AddressURNInput,
  walletAddress: z.string(),
})

type InitSmartContractWalletResult = z.infer<
  typeof InitSmartContractWalletOutput
>

export const initSmartContractWalletMethod = async ({
  ctx,
}: {
  ctx: Context
}): Promise<InitSmartContractWalletResult> => {
  const nodeClient = ctx.address
  const account = await nodeClient?.class.getAccount()

  if (!account) {
    throw new Error('missing account')
  }

  const owner = Wallet.createRandom()

  const smartContractWallet = await getZeroDevSigner({
    projectId: ctx.SECRET_ZERODEV_PROJECTID,
    owner,
    skipFetchSetup: true,
  })

  const smartContractWalletAddress = await smartContractWallet.getAddress()

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

  const imageClient = createImageClient(ctx.Images, {
    headers: generateTraceContextHeaders(ctx.traceSpan),
  })
  const gradient = await imageClient.getGradient.mutate({
    gradientSeed: smartContractWalletAddress,
  })
  await Promise.all([
    smartContractWalletNode.storage.put('privateKey', owner.privateKey),
    smartContractWalletNode.class.setAddress(smartContractWalletAddress),
    smartContractWalletNode.class.setNickname(smartContractWalletAddress),
    smartContractWalletNode.class.setNodeType(NodeType.Crypto),
    smartContractWalletNode.class.setType(CryptoAddressType.Wallet),
    smartContractWalletNode.class.setGradient(gradient),
  ])

  const caller = appRouter.createCaller({
    ...ctx,
    addressURN,
  })

  caller.setAccount(account)
  caller.getAddressProfile()

  return { addressURN, walletAddress: smartContractWalletAddress }
}
