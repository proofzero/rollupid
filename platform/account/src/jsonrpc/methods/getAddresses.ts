import { z } from 'zod'
import { inputValidators } from '@kubelt/platform-middleware'
import { Context } from '../../context'

import { Graph } from '@kubelt/types'
import { EDGE_ADDRESS } from '@kubelt/platform.address/src/constants'
import { Node } from '../../../../edges/src/jsonrpc/validators/node'

export const GetAddressesInput = z.object({
  account: inputValidators.AccountURNInput,
  filter: z
    .object({
      type: inputValidators.CryptoAddressTypeInput.optional(),
      hidden: z.boolean().optional(),
    })
    .optional(),
})

export type GetAddressesParams = z.infer<typeof GetAddressesInput>

export const GetAddressesOutput = z.array(Node)
export type GetAddressesOutput = z.infer<typeof GetAddressesOutput>

export const getAddressesMethod = async ({
  input,
  ctx,
}: {
  input: GetAddressesParams
  ctx: Context
}): Promise<GetAddressesOutput> => {
  // TODO: check scopes on jwt for now we will just use the accountURN to you get get your own addresses
  const accountURN = ctx.accountURN as string

  if (input.account !== accountURN) {
    return []
  }

  const query = {
    // We are only interested in edges that start at the account node and
    // terminate at the address node, assuming that account nodes link to
    // the address nodes that they own.
    id: input.account,
    // We only want edges that link to address nodes.
    tag: EDGE_ADDRESS,
    // Account -> Address edges indicate ownership.
    dir: Graph.EdgeDirection.Outgoing,

    dst: {
      // Only keep edges having the given node type. The node type is
      // specified as an r-component in node URNs.
      rc: {
        addr_type: input.filter?.type,
      },
      qc: {
        hidden: input.filter?.hidden || false,
      },
    },
  }
  // Return the list of edges between the account node and any address
  // nodes, filtered by address type if provided.
  return ctx.edges.getEdges
    .query({ query })
    .then((res) => res.edges.map((e) => e.dst))
}
