import { z } from 'zod'
import { listAddresses } from '@kubelt/graph/util'
import { inputValidators } from '@kubelt/platform-middleware'
import { Context } from '../../context'
import { AddressURNSpace } from '@kubelt/urns/address'

import type { Edge } from '@kubelt/graph'

import type { AddressURN } from '@kubelt/urns/address'

import type { AddressList } from '../middlewares/addressList'

export const GetAddressesInput = z.object({
  account: inputValidators.AccountURNInput,
  type: inputValidators.CryptoAddressTypeInput.optional(),
})

export type GetAddressesParams = z.infer<typeof GetAddressesInput>

export const getAddressesMethod = async ({
  input,
  ctx,
}: {
  input: GetAddressesParams
  ctx: Context
}): Promise<AddressList> => {
  // Return the list of edges between the account node and any address
  // nodes, filtered by address type if provided.
  const edgeResult = await listAddresses(ctx.Edges, input.account, input?.type)

  if (!Array.isArray(edgeResult)) {
    // Should this be a TRPCError?
    throw new Error(edgeResult.message)
  }

  // The source nodes in the returned edges are the URNs of the
  // account nodes.
  const addresses: AddressList = edgeResult.reduce(
    (acc: AddressURN[], edge: Edge) => {
      if (!AddressURNSpace.is(edge.dst.urn)) {
        return acc
      }
      const urn = edge.dst.urn as AddressURN
      acc.push(urn)
      return acc
    },
    []
  )

  return addresses
}
