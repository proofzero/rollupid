import { z } from 'zod'
import { Wallet } from '@ethersproject/wallet'

import { AddressURNSpace } from '@kubelt/urns/address'
import { generateHashedIDRef } from '@kubelt/urns/idref'
import { AddressURNInput } from '@kubelt/platform-middleware/inputValidators'

import { appRouter } from '../router'
import { Context } from '../../context'
import { CryptoAddressType, NodeType } from '@kubelt/types/address'
import { initAddressNodeByName } from '../../nodes'
import createImageClient from '@kubelt/platform-clients/image'

export const InitVaultOutput = AddressURNInput

type InitVaultResult = z.infer<typeof InitVaultOutput>

export const initVaultMethod = async ({
  input,
  ctx,
}: {
  input: unknown
  ctx: Context
}): Promise<InitVaultResult> => {
  const nodeClient = ctx.address
  const account = await nodeClient?.class.getAccount()

  if (!account) {
    throw new Error('missing account')
  }

  const vault = Wallet.createRandom()

  const address3RN = AddressURNSpace.componentizedUrn(
    generateHashedIDRef(CryptoAddressType.ETH, vault.address),
    { node_type: NodeType.Vault, addr_type: CryptoAddressType.ETH },
    { alias: vault.address, hidden: 'true' }
  )
  const baseAddressURN = AddressURNSpace.getBaseURN(address3RN)
  const vaultNode = initAddressNodeByName(baseAddressURN, ctx.Address)
  const imageClient = createImageClient(ctx.Images)
  const gradient = await imageClient.getGradient.mutate({
    gradientSeed: vault.address,
  })
  await Promise.all([
    vaultNode.storage.put('privateKey', vault.privateKey), // #TODO: vault class needed
    vaultNode.class.setAddress(vault.address),
    vaultNode.class.setNodeType(NodeType.Vault),
    vaultNode.class.setType(CryptoAddressType.ETH),
    vaultNode.class.setGradient(gradient),
  ])

  const caller = appRouter.createCaller({
    ...ctx,
    address3RN,
  })

  caller.setAccount(account)
  caller.getAddressProfile()

  return address3RN
}
