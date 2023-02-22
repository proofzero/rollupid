import createEdgesClient from '@kubelt/platform-clients/edges'
import { Context } from '../context'
import { EDGE_AUTHORIZES } from '@kubelt/platform.access/src/constants'
// import { Graph } from '@kubelt/types'
// import { inputValidators } from '@kubelt/platform-middleware'
import { z } from 'zod'

// Input
// -----------------------------------------------------------------------------

export const GetAuthorizedAccountsMethodInput = z.object({
  client: z.string(),
  opt: z.object({
    offset: z.number(),
    limit: z.number(),
  }),
})

export type GetAuthorizedAccountsParams = z.infer<
  typeof GetAuthorizedAccountsMethodInput
>

// Output
// -----------------------------------------------------------------------------

export const GetAuthorizedAccountsMethodOutput = z.array(
  z.object({
    accountURN: z.string(),
    timestamp: z.number(),
    name: z.string(),
    imageURL: z.string(),
  })
)

// Method
// -----------------------------------------------------------------------------

export const getAuthorizedAccounts = async ({
  input,
  ctx,
}: {
  input: GetAuthorizedAccountsParams
  ctx: Context
}) => {
  const edgesClient = createEdgesClient(ctx.Edges)

  const edgesResult = await edgesClient.getEdges.query({
    query: {
      tag: EDGE_AUTHORIZES,
      dst: {
        rc: {
          client_id: input.client,
        },
      },
    },
    // set limit to not query the whole db
    opt: input.opt,
  })

  const mappedEdges = edgesResult.edges.map((edge) => {
    const timestamp = new Date(
      (edge.createdTimestamp as string) + ' UTC'
    ).getTime()
    const accountURN = edge.src.baseUrn
    return {
      accountURN,
      timestamp,
      name: edge.src.qc.name,
      imageURL: edge.src.qc.picture,
    }
  })

  console.log({ mappedEdges })

  return mappedEdges
}
