import { z } from 'zod'
import { AccountURNInput } from '@proofzero/platform-middleware/inputValidators'
import { Context } from '../../context'
import { RollupError, ERROR_CODES } from '@proofzero/errors'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { AccountURNSpace } from '@proofzero/urns/account'
import { AddressURN } from '@proofzero/urns/address'
import { getAddressReferenceTypes } from './getAddressReferenceTypes'
import getEdgesClient from '@proofzero/platform-clients/edges'

export const DeleteAddressNodeInput = z.object({
  accountURN: AccountURNInput,
  forceDelete: z.boolean().optional(),
})

type DeleteAddressNodeParams = z.infer<typeof DeleteAddressNodeInput>

export const deleteAddressNodeMethod = async ({
  input,
  ctx,
}: {
  input: DeleteAddressNodeParams
  ctx: Context
}) => {
  const { accountURN, forceDelete } = input

  const edgesClient = getEdgesClient(
    ctx.Edges,
    generateTraceContextHeaders(ctx.traceSpan)
  )
  const nodeClient = ctx.address

  const accountEdge = await edgesClient.findNode.query({
    baseUrn: accountURN,
  })

  if (!forceDelete) {
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

  // Remove the stored account in the node.
  await nodeClient?.class.unsetAccount()

  const { edges: addressEdges } = await edgesClient.getEdges.query({
    query: {
      dst: {
        baseUrn: address,
      },
    },
  })

  // Remove any edge that references the address node
  addressEdges.forEach(async (edge) => {
    await edgesClient.removeEdge.mutate({
      src: edge.src.baseUrn,
      dst: edge.dst.baseUrn,
      tag: edge.tag,
    })
  })

  await ctx.edges.deleteNode.mutate({
    urn: address,
  })

  return ctx.address?.storage.deleteAll()
}
