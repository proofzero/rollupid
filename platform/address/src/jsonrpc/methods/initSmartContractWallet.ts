import { z } from 'zod'
import { Wallet } from '@ethersproject/wallet'

import { AddressURNSpace } from '@proofzero/urns/address'
import { generateHashedIDRef } from '@proofzero/urns/idref'
import { AddressURNInput } from '@proofzero/platform-middleware/inputValidators'

import { appRouter } from '../router'
import { Context } from '../../context'
import { ContractAddressType, NodeType } from '@proofzero/types/address'
import { initAddressNodeByName } from '../../nodes'
import createImageClient from '@proofzero/platform-clients/image'
import { getZeroDevSigner } from '@zerodevapp/sdk'

import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'

export const InitSmartContractWalletOutput = AddressURNInput

type InitSmartContractWalletResult = z.infer<
  typeof InitSmartContractWalletOutput
>

export const initSmartContractWalletMethod = async ({
  input,
  ctx,
}: {
  input: unknown
  ctx: Context
}): Promise<InitSmartContractWalletResult> => {
  const nodeClient = ctx.address
  const account = await nodeClient?.class.getAccount()

  if (!account) {
    throw new Error('missing account')
  }

  const smartContractWallet = Wallet.createRandom()

  const address3RN = AddressURNSpace.componentizedUrn(
    generateHashedIDRef(
      ContractAddressType.ETHWallet,
      smartContractWallet.address
    ),
    {
      node_type: NodeType.Crypto,
      addr_type: ContractAddressType.ETHWallet,
    },
    { alias: smartContractWallet.address, hidden: 'true' }
  )
  const baseAddressURN = AddressURNSpace.getBaseURN(address3RN)
  const smartContractWalletNode = initAddressNodeByName(
    baseAddressURN,
    ctx.Address
  )
  const imageClient = createImageClient(ctx.Images, {
    headers: generateTraceContextHeaders(ctx.traceSpan),
  })
  const gradient = await imageClient.getGradient.mutate({
    gradientSeed: smartContractWallet.address,
  })
  await Promise.all([
    smartContractWalletNode.storage.put(
      'privateKey',
      smartContractWallet.privateKey
    ), // #TODO: vault class needed
    smartContractWalletNode.class.setAddress(smartContractWallet.address),
    smartContractWalletNode.class.setNodeType(NodeType.Crypto),
    smartContractWalletNode.class.setType(ContractAddressType.ETHWallet),
    smartContractWalletNode.class.setGradient(gradient),
  ])

  const caller = appRouter.createCaller({
    ...ctx,
    address3RN,
  })

  caller.setAccount(account)
  caller.getAddressProfile()

  return address3RN
}
