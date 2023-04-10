import getEdgesClient from '@proofzero/platform-clients/edges'
import type { AddressURN } from '@proofzero/urns/address'
import { AccountURNSpace } from '@proofzero/urns/account'
import { Context } from '../../context'
import { EDGE_ADDRESS } from '@proofzero/platform.address/src/constants'
import { z } from 'zod'

import {
  AccountURNInput,
  AddressURNInput,
} from '@proofzero/platform-middleware/inputValidators'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { ERROR_CODES, RollupError } from '@proofzero/errors'

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
  const edgesClient = getEdgesClient(
    ctx.Edges,
    generateTraceContextHeaders(ctx.traceSpan)
  )
  const nodeClient = ctx.address

  const accountEdge = await edgesClient.findNode.query({
    baseUrn: input,
  })

  const primaryAddressURN = accountEdge?.qc.primaryAddressURN

  if (primaryAddressURN === ctx.addressURN) {
    throw new RollupError({
      code: ERROR_CODES.BAD_REQUEST,
      message: 'Cannot disconnect primary address',
    })
  }

  // Get the address associated with the authorization header included in the request.
  const address = ctx.addressURN as AddressURN

  const account = input
  if (!AccountURNSpace.is(account)) {
    throw new Error('Invalid account URN')
  }

  await Promise.all([
    // Remove the stored account in the node.
    nodeClient?.class.unsetAccount(),

    // Unlink the address and account nodes, removing the "account" edge.
    edgesClient.removeEdge.mutate({
      src: account,
      dst: address,
      tag: EDGE_ADDRESS,
    }),
  ])

  return {
    unset: {
      account: account,
      address: address,
    },
  }
}
