import createEdgesClient from '@proofzero/platform-clients/edges'
import type { AccountURN } from '@proofzero/urns/account'
import type { AddressURN } from '@proofzero/urns/address'
import {
  AccountURNInput,
  AddressURNInput,
} from '@proofzero/platform-middleware/inputValidators'
import { AccountURNSpace } from '@proofzero/urns/account'
import { Context } from '../../context'
import { EDGE_ADDRESS } from '@proofzero/platform.address/src/constants'
import { z } from 'zod'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'

export const SetAccountInput = AccountURNInput
export const SetAccountOutput = z.object({
  set: z.object({
    account: AccountURNInput,
    address: AddressURNInput,
  }),
})

type SetAccountParams = z.infer<typeof SetAccountInput>
type SetAccountResult = z.infer<typeof SetAccountOutput>

export const setAccountMethod = async ({
  input,
  ctx,
}: {
  input: SetAccountParams
  ctx: Context
}): Promise<SetAccountResult> => {
  const nodeClient = ctx.address

  const address = ctx.addressURN as AddressURN

  const account = input
  if (!AccountURNSpace.is(account)) {
    throw new Error('Invalid account URN')
  }

  // Store the owning account for the address node in the node itself.
  await nodeClient?.class.setAccount(account)

  const edgesClient = createEdgesClient(ctx.Edges, {
    ...generateTraceContextHeaders(ctx.traceSpan),
  })
  const linkResult = await edgesClient.makeEdge.mutate({
    src: account,
    dst: address,
    tag: EDGE_ADDRESS,
  })

  const edge = linkResult.edge
  return {
    set: {
      account: edge.src as AccountURN,
      address: edge.dst as AddressURN,
    },
  }
}
