import { z } from 'zod'
import { Wallet } from '@ethersproject/wallet'

import { AddressURN, AddressURNSpace } from '@kubelt/urns/address'
import { AddressURNInput } from '@kubelt/platform-middleware/inputValidators'

import { appRouter } from '../router'
import { Context } from '../../context'
import { initCryptoNodeByName } from '../../nodes'
import { IDRefURNSpace } from '@kubelt/urns/idref'
import { keccak256 } from '@ethersproject/keccak256'
import { CryptoAddressType } from '@kubelt/types/address'

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

  const vaultNode = await initCryptoNodeByName(
    AddressURNSpace.urn(hash),
    ctx.DefaultAddress,
    ctx.CryptoAddress
  )
  await vaultNode.storage.put('privateKey', vault.privateKey)

  const address3RN: AddressURN = `urn:threeid:address/${vault.address}?+node_type=crypto&addr_type=eth?=alias=${vault.address}&hidden=true`
  const caller = appRouter.createCaller({
    ...ctx,
    address3RN,
  })

  caller.setAccount(account)
  caller.getAddressProfile()

  return address3RN
}
