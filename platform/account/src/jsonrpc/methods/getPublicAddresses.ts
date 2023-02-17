import { z } from 'zod'
import { inputValidators } from '@kubelt/platform-middleware'
import { Context } from '../../context'

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

export const getPublicAddressesMethod = async ({
  input,
  ctx,
}: {
  input: GetAddressesParams
  ctx: Context
}): Promise<GetAddressesOutput> => {
  const query = {
    // We are only interested in edges that start at the account node and
    // terminate at the address node, assuming that account nodes link to
    // the address nodes that they own.
    src: { baseUrn: input.account },
    // We only want edges that link to address nodes.
    tag: EDGE_ADDRESS,

    dst: {
      // Only keep edges having the given node type. The node type is
      // specified as an r-component in node URNs.
      rc: {
        addr_type: input.filter?.type,
      },
      qc: {
        hidden: false,
      },
    },
  }
  // Return the list of edges between the account node and any address
  // nodes, filtered by address type if provided.
  return ctx.edges.getEdges
    .query({ query })
    .then((res) => res.edges.map((e) => e.dst))
}
