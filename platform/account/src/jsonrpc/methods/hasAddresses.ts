import * as set from 'ts-set-utils'
import { z } from 'zod'
import { inputValidators } from '@proofzero/platform-middleware'
import { Context } from '../../context'
import { AddressURNSpace } from '@proofzero/urns/address'

import type { AddressList } from '../../types'
import type { AccountURN } from '@proofzero/urns/account'
import { EDGE_ADDRESS } from '@proofzero/platform.address/src/constants'

// Should this live in @proofzero/platform-middlewares/inputValidators?
export const AddressListInput = z.custom<AddressList>((input) => {
  if (!Array.isArray(input)) {
    throw new Error('address list must be an array')
  }
  input.forEach((address) => {
    if (!AddressURNSpace.is(address)) {
      throw new Error(`invalid address provided: ${address}`)
    }
  })
  return input as AddressList
})

export type HasAddressesParams = {
  account: AccountURN
  addresses: AddressList
}

export const HasAddressesInput = z.object({
  account: inputValidators.AccountURNInput,
  addresses: AddressListInput,
})

export const hasAddressesMethod = async ({
  input,
  ctx,
}: {
  input: HasAddressesParams
  ctx: Context
}) => {
  if (input.account !== ctx.accountURN) {
    throw Error('Invalid account input')
  }
  // Return the list of edges between the account node and any address
  // nodes. Don't filter the addresses by type, we want them all (the
  // total number is normally going to be small).
  const query = {
    // We are only interested in edges that start at the account node and
    // terminate at the address node, assuming that account nodes link to
    // the address nodes that they own.
    src: { baseUrn: input.account },
    // We only want edges that link to address nodes.
    tag: EDGE_ADDRESS,

    qc: {
      hidden: input.account === ctx.accountURN,
    },
  }
  const edgesResult = await ctx.edges.getEdges.query({ query })
  const edgeList = edgesResult.edges

  // A set of the addresses owned by the account.
  const ownedAddresses = new Set(
    edgeList.map((edge) => {
      return edge.dst.baseUrn
    })
  )
  // The input set of addresses to check.
  const inputAddresses = new Set(input.addresses)

  // Determine if set B is a subset of set A. A set B is a subset of A
  // if all elements of B are in set
  return set.subset(ownedAddresses, inputAddresses)
}
