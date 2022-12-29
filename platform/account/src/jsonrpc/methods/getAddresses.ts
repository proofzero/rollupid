import { z } from 'zod'
import { listAddresses } from '@kubelt/graph/util'
import { CryptoAddressType } from '@kubelt/types'
import { inputValidators } from '@kubelt/platform-middleware'
import { Context } from '../../context'

import type { AccountURN } from '@kubelt/urns/account'
import type { AddressURN } from '@kubelt/urns/address'

export type GetAddressesParams = {
  account: AccountURN
  type?: CryptoAddressType
}

export const GetAddressesInput = z.object({
  account: inputValidators.AccountURNInput,
  type: inputValidators.CryptoAddressTypeInput.optional(),
})

export const AddressList = z.array(inputValidators.AddressURNInput)

// TODO move to types package
export type AddressList = z.infer<typeof AddressList>

export const getAddressesMethod = async ({
  input,
  ctx,
}: {
  input: GetAddressesParams
  ctx: Context
}) => {
  // Return the list of edges between the account node and any address
  // nodes, filtered by address type if provided.
  const edgeResult = await listAddresses(ctx.Edges, input.account, input?.type)

  if (Array.isArray(edgeResult)) {
    // The source nodes in the returned edges are the URNs of the
    // account nodes.
    const addresses = edgeResult.map((edge: Edge) => {
      return edge.dst.urn
    })

    return addresses
  }

  // Should this be a TRPCError?
  throw new Error(edgeResult.error.message)
}
