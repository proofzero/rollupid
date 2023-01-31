import { z } from 'zod'
import { inputValidators } from '@kubelt/platform-middleware'
import { Context } from '../../context'

import { Graph } from '@kubelt/types'
import { EDGE_ADDRESS } from '@kubelt/platform.address/src/constants'
import { Node } from '../../../../edges/src/jsonrpc/validators/node'
import { AccountURNInput } from '@kubelt/platform-middleware/inputValidators'
import { AccountURN } from '@kubelt/urns/account'

export const GetAliasAccountParams = z.object({
  alias: z.string(),
  provider: z.string(),
})

export type GetAliasAccountParams = z.infer<typeof GetAliasAccountParams>

export const GetAliasAccountOutput = z.array(AccountURNInput)
export type GetAliasAccountOutput = z.infer<typeof GetAliasAccountOutput>

export const getAccountByAlias = async ({
  input,
  ctx,
}: {
  input: GetAliasAccountParams
  ctx: Context
}): Promise<GetAliasAccountOutput> => {
  const query = {
    tag: EDGE_ADDRESS,
    dir: Graph.EdgeDirection.Outgoing,

    dst: {
      rc: {
        addr_type: input.provider,
      },
      qc: {
        //TODO: add hidden qcomp once visibility is implemented
        alias: input.alias,
      },
    },
  }
  return ctx.edges.getEdges
    .query({ query })
    .then((res) => res.edges.map((e) => e.src.urn as AccountURN))
}
