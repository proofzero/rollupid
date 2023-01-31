import * as db from '../../db'
import { z } from 'zod'
import { Context } from '../../context'
import { Edge as EdgeInput, EdgeQueryInput } from '../validators/edge'
import { Edge } from '../../db/types'

export const GetEdgesMethodInput = z.object({
  query: EdgeQueryInput,
  opt: z
    .object({
      limit: z.number().optional(),
      offset: z.number().optional(),
    })
    .optional(),
})

export const GetEdgesMethodOutput = z.object({
  id: z.string().optional(),
  edges: z.array(EdgeInput),
})

export type GetEdgesParams = z.infer<typeof GetEdgesMethodInput>

export const getEdgesMethod = async ({
  input,
  ctx,
}: {
  input: GetEdgesParams
  ctx: Context
}): Promise<z.infer<typeof GetEdgesMethodOutput>> => {
  const nodeId = input.query.id || undefined

  // Get the list of the edges selected by the query, modifying the
  // result as per any options.
  const edges = await db.edges(ctx.graph, input.query, input.opt)

  return {
    id: nodeId,
    edges,
  }
}
