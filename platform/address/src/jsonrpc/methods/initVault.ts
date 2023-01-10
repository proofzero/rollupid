import { z } from 'zod'
import { Wallet } from '@ethersproject/wallet'

import { AddressURN, AddressURNSpace } from '@kubelt/urns/address'
import { AddressURNInput } from '@kubelt/platform-middleware/inputValidators'

import { appRouter } from '../router'
import { Context } from '../../context'
import { initCryptoNodeByName } from '../../nodes'

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
  const vaultNode = await initCryptoNodeByName(
    AddressURNSpace.urn(vault.address),
    ctx.CryptoAddress
  )
  await vaultNode.storage.put('privateKey', vault.privateKey)

  const address3RN: AddressURN = `urn:threeid:address/${vault.address}?+node_type=crypto&addr_type=ethereum`
  const caller = appRouter.createCaller({
    ...ctx,
    address3RN,
  })

  caller.setAccount(account)
  caller.getAddressProfile()

  return address3RN
}
