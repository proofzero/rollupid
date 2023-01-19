import { z } from 'zod'
import { Wallet } from '@ethersproject/wallet'

import { AddressURN, AddressURNSpace } from '@kubelt/urns/address'
import { AddressURNInput } from '@kubelt/platform-middleware/inputValidators'

import { appRouter } from '../router'
import { Context } from '../../context'
import { IDRefURNSpace } from '@kubelt/urns/idref'
import { keccak256 } from '@ethersproject/keccak256'
import { CryptoAddressType, NodeType } from '@kubelt/types/address'
import { initAddressNodeByName } from '../../nodes'

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

  const idref = IDRefURNSpace(CryptoAddressType.ETH).urn(vault.address)
  const encoder = new TextEncoder()
  const hash = keccak256(encoder.encode(idref))
  const vaultUrn = AddressURNSpace.urn(hash)

  const vaultNode = await initAddressNodeByName(vaultUrn, ctx.Address)
  await Promise.all([
    vaultNode.storage.put('privateKey', vault.privateKey), // #TODO: vault class needed
    vaultNode.class.setAddress(vaultUrn),
    vaultNode.class.setNodeType(NodeType.Vault),
    vaultNode.class.setType(CryptoAddressType.ETH),
  ])

  const address3RN: AddressURN = `${vaultUrn}?+node_type=${NodeType.Vault}&addr_type=${CryptoAddressType.ETH}?=alias=${vault.address}&hidden=true`
  const caller = appRouter.createCaller({
    ...ctx,
    address3RN,
  })

  caller.setAccount(account)
  caller.getAddressProfile()

  return address3RN
}
