import { z } from 'zod'

import { router } from '@proofzero/platform.core'

import { inputValidators } from '@proofzero/platform-middleware'
import { EDGE_ACCOUNT } from '@proofzero/platform.account/src/constants'

import { Context } from '../../context'
import { Node } from '@proofzero/platform.edges/src/jsonrpc/validators/node'

export const GetAccountsInput = z.object({
  identity: inputValidators.IdentityURNInput,
  filter: z
    .object({
      type: inputValidators.CryptoAccountTypeInput.optional(),
      hidden: z.boolean().optional(),
    })
    .optional(),
})

export type GetAccountsParams = z.infer<typeof GetAccountsInput>

export const GetAccountsOutput = z.array(Node)
export type GetAccountsOutput = z.infer<typeof GetAccountsOutput>

export const getPublicAccountsMethod = async ({
  input,
  ctx,
}: {
  input: GetAccountsParams
  ctx: Context
}): Promise<GetAccountsOutput> => {
  const query = {
    // We are only interested in edges that start at the identity node and
    // terminate at the account node, assuming that identity nodes link to
    // the account nodes that they own.
    src: { baseUrn: input.identity },
    // We only want edges that link to account nodes.
    tag: EDGE_ACCOUNT,

    dst: {
      // Only keep edges having the given node type. The node type is
      // specified as an r-component in node URNs.
      rc: {
        addr_type: input.filter?.type,
      },
    },
  }

  const caller = router.createCaller(ctx)

  // Return the list of edges between the identity node and any account
  // nodes, filtered by account type if provided.
  return caller.edges
    .getEdges({ query })
    .then((res) => res.edges.map((e) => e.dst))
}
