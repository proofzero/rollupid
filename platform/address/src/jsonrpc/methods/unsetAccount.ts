import getEdgesClient from '@proofzero/platform-clients/edges'
import type { AddressURN } from '@proofzero/urns/address'
import { AccountURNSpace } from '@proofzero/urns/account'
import { Context } from '../../context'
import { z } from 'zod'

import {
  AccountURNInput,
  AddressURNInput,
} from '@proofzero/platform-middleware/inputValidators'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { ERROR_CODES, RollupError } from '@proofzero/errors'
import { getAddressReferenceTypes } from './getAddressReferenceTypes'

export const UnsetAccountInput = z.object({
  accountURN: AccountURNInput,
  purge: z.boolean().optional(),
})

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
  const { accountURN, purge } = input
  // TODO replace with usage of InjectEdges middleware
  const edgesClient = getEdgesClient(
    ctx.Edges,
    generateTraceContextHeaders(ctx.traceSpan)
  )
  const nodeClient = ctx.address

  const accountEdge = await edgesClient.findNode.query({
    baseUrn: accountURN,
  })

  if (!purge) {
    const primaryAddressURN = accountEdge?.qc.primaryAddressURN
    if (primaryAddressURN === ctx.addressURN) {
      throw new RollupError({
        code: ERROR_CODES.BAD_REQUEST,
        message: 'Cannot disconnect primary address',
      })
    }

    const addressUsage = await getAddressReferenceTypes({ ctx })
    if (addressUsage.length > 0) {
      throw new RollupError({
        code: ERROR_CODES.BAD_REQUEST,
        message: `Cannot disconnect active address (${addressUsage.join(
          ', '
        )})`,
      })
    }
  }

  // Get the address associated with the authorization header included in the request.
  const address = ctx.addressURN as AddressURN

  if (!AccountURNSpace.is(accountURN)) {
    throw new Error('Invalid account URN')
  }

  const { edges: addressEdges } = await edgesClient.getEdges.query({
    query: {
      dst: {
        baseUrn: address,
      },
    },
  })

  await Promise.all([
    // Remove the stored account in the node.
    nodeClient?.class.unsetAccount(),

    // Remove any edge that references the address node
    addressEdges.forEach(async (edge) => {
      edgesClient.removeEdge.mutate({
        src: edge.src.baseUrn,
        dst: edge.dst.baseUrn,
        tag: edge.tag,
      })
    }),
  ])

  return {
    unset: {
      account: accountURN,
      address: address,
    },
  }
}
