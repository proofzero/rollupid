import * as db from '../../db'
import { z } from 'zod'
import { Context } from '../../context'
import {
  EdgeQueryInput,
  EdgeQueryOptionsInput,
  EdgeQueryResultsOutput,
} from '../validators/edge'
import type { EdgeQueryResults } from '../../db/types'

export const GetEdgesMethodInput = z.object({
  query: EdgeQueryInput,
  opt: EdgeQueryOptionsInput,
})

export const GetEdgesMethodOutput = EdgeQueryResultsOutput
export type GetEdgesMethodOutput = z.infer<typeof GetEdgesMethodOutput>

export type GetEdgesParams = z.infer<typeof GetEdgesMethodInput>

export const getEdgesMethod = async ({
  input,
  ctx,
}: {
  input: GetEdgesParams
  ctx: Context
}): Promise<EdgeQueryResults> => {
  // Get the list of the edges selected by the query, modifying the
  // result as per any options.
  const edges = await db.edges(ctx.graph, input.query, input.opt)

  return edges
}
