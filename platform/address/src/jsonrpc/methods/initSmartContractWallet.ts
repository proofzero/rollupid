import { z } from 'zod'
import { Wallet } from '@ethersproject/wallet'

import { AddressURNSpace } from '@proofzero/urns/address'
import { generateHashedIDRef } from '@proofzero/urns/idref'
import { AddressURNInput } from '@proofzero/platform-middleware/inputValidators'

import { appRouter } from '../router'
import { Context } from '../../context'
import {
  ContractAddressType,
  CryptoAddressType,
  NodeType,
} from '@proofzero/types/address'
import { initAddressNodeByName } from '../../nodes'
import createImageClient from '@proofzero/platform-clients/image'
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

  const owner = Wallet.createRandom()

  const address3RN = AddressURNSpace.componentizedUrn(
    generateHashedIDRef(CryptoAddressType.ETH, owner.address),
    {
      node_type: NodeType.SmartContract,
      addr_type: ContractAddressType.ETHWallet,
    },
    { alias: owner.address, hidden: 'true' }
  )
  const baseAddressURN = AddressURNSpace.getBaseURN(address3RN)
  const ownerNode = initAddressNodeByName(baseAddressURN, ctx.Address)
  const imageClient = createImageClient(ctx.Images, {
    headers: generateTraceContextHeaders(ctx.traceSpan),
  })
  const gradient = await imageClient.getGradient.mutate({
    gradientSeed: owner.address,
  })
  await Promise.all([
    ownerNode.storage.put('privateKey', owner.privateKey), // #TODO: vault class needed
    ownerNode.class.setAddress(owner.address),
    ownerNode.class.setNodeType(NodeType.SmartContract),
    ownerNode.class.setType(CryptoAddressType.ETH),
    ownerNode.class.setGradient(gradient),
  ])

  const caller = appRouter.createCaller({
    ...ctx,
    address3RN,
  })

  caller.setAccount(account)
  caller.getAddressProfile()

  return address3RN
}
