import * as db from '../../db'
import { z } from 'zod'
import { Context } from '../../context'
import { Edge, EdgeQueryInput } from '../middleware/validators'
import { Edge as EdgeType } from '../../db/types'

export const GetEdgesMethodInput = z.object({
  query: EdgeQueryInput,
  opt: z.any().optional(),
})

export const GetEdgesMethodOutput = z.object({
  id: z.string(),
  edges: z.array(Edge),
})

export type GetEdgesParams = z.infer<typeof GetEdgesMethodInput>

export const getEdgesMethod = async ({
  input,
  ctx,
}: {
  input: GetEdgesParams
  ctx: Context
}): Promise<{
  id: string
  edges: EdgeType[]
}> => {
  const nodeId = input.query.id

  // Get the list of the edges selected by the query, modifying the
  // result as per any options.
  const edges = await db.edges(ctx.graph, input.query, input.opt)

  return {
    id: nodeId,
    edges,
  }
}
