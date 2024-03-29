import { z } from 'zod'

import { router } from '@proofzero/platform.core'
import { inputValidators } from '@proofzero/platform-middleware'

import { EDGE_ACCOUNT } from '@proofzero/platform.account/src/constants'

import { Context } from '../../context'
import { AccountSchema } from '../validators/profile'

export const GetAccountsInput = z.object({
  URN: inputValidators.AnyURNInput,
  filter: z
    .object({
      type: inputValidators.CryptoAccountTypeInput.optional(),
    })
    .optional(),
})

export type GetAccountsParams = z.infer<typeof GetAccountsInput>

export const GetAccountsOutput = z.array(AccountSchema)
export type GetAccountsOutput = z.infer<typeof GetAccountsOutput>

export const getOwnAccountsMethod = async ({
  input,
  ctx,
}: {
  input: GetAccountsParams
  ctx: Context
}): Promise<GetAccountsOutput> => {
  // TODO: check scopes on jwt for now we will just use the identityURN to you get get your own accounts
  if (input.URN !== ctx.identityURN) {
    throw Error('Invalid identity input')
  }

  const query = {
    // We are only interested in edges that start at the identity node and
    // terminate at the account node, assuming that identity nodes link to
    // the account nodes that they own.
    src: {
      baseUrn: input.URN,
    },

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

  // Return the list of edges between the identity node and any account
  // nodes, filtered by account type if provided.
  const caller = router.createCaller(ctx)
  const { edges } = await caller.edges.getEdges({ query })
  return edges.map((e) => e.dst) as GetAccountsOutput
}
