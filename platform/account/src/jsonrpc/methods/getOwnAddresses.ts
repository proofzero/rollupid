import { z } from 'zod'

import { router } from '@proofzero/platform.core'
import { inputValidators } from '@proofzero/platform-middleware'

import { EDGE_ADDRESS } from '@proofzero/platform.address/src/constants'
import { Context } from '../../context'
import { Node } from '../../../../edges/src/jsonrpc/validators/node'

export const GetAddressesInput = z.object({
  account: inputValidators.AccountURNInput,
  filter: z
    .object({
      type: inputValidators.CryptoAddressTypeInput.optional(),
    })
    .optional(),
})

export type GetAddressesParams = z.infer<typeof GetAddressesInput>

export const GetAddressesOutput = z.array(Node)
export type GetAddressesOutput = z.infer<typeof GetAddressesOutput>

export const getOwnAddressesMethod = async ({
  input,
  ctx,
}: {
  input: GetAddressesParams
  ctx: Context
}): Promise<GetAddressesOutput> => {
  // TODO: check scopes on jwt for now we will just use the accountURN to you get get your own addresses
  if (input.account !== ctx.accountURN) {
    throw Error('Invalid account input')
  }

  const query = {
    // We are only interested in edges that start at the account node and
    // terminate at the address node, assuming that account nodes link to
    // the address nodes that they own.
    src: {
      baseUrn: input.account,
    },

    // We only want edges that link to address nodes.
    tag: EDGE_ADDRESS,

    dst: {
      // Only keep edges having the given node type. The node type is
      // specified as an r-component in node URNs.
      rc: {
        addr_type: input.filter?.type,
      },
    },
  }

  // Return the list of edges between the account node and any address
  // nodes, filtered by address type if provided.
  const caller = router.createCaller(ctx)
  const { edges } = await caller.edges.getEdges({ query })

  return edges.map((e) => e.dst)
}
