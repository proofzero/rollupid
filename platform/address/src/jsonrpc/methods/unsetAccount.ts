import getEdgesClient from '@kubelt/platform-clients/edges'
import type { AddressURN } from '@kubelt/urns/address'
import { AccountURNSpace } from '@kubelt/urns/account'
import { Context } from '../../context'
import { EDGE_ADDRESS } from '@kubelt/platform.address/src/constants'
import { z } from 'zod'

import {
  AccountURNInput,
  AddressURNInput,
} from '@kubelt/platform-middleware/inputValidators'

export const UnsetAccountInput = AccountURNInput

export const UnsetAccountOutput = z.object({
  unset: z.object({
    account: AccountURNInput,
    address: AddressURNInput,
  }),
})

type UnsetAccountParams = z.infer<typeof UnsetAccountInput>
type UnsetAccountResult = z.infer<typeof UnsetAccountOutput>

export const unsetAccountMethod = async ({
  input,
  ctx,
}: {
  input: UnsetAccountParams
  ctx: Context
}): Promise<UnsetAccountResult> => {
  // TODO replace with usage of InjectEdges middleware
  const edgesClient = getEdgesClient(ctx.Edges)
  const nodeClient = ctx.address

  // Get the address associated with the PlatformJWTAssertionHeader included in the request.
  const address = ctx.addressURN as AddressURN

  const account = input
  if (!AccountURNSpace.is(account)) {
    throw new Error('Invalid account URN')
  }

  // Remove the stored account in the node.
  await nodeClient?.class.unsetAccount()

  // Unlink the address and account nodes, removing the "account" edge.
  await edgesClient.removeEdge.mutate({
    src: account,
    dst: address,
    tag: EDGE_ADDRESS,
  })

  return {
    unset: {
      account: account,
      address: address,
    },
  }
}
