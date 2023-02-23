import { AnyURNInput } from '@kubelt/platform-middleware/inputValidators'
import { parseUrnForEdge } from '@kubelt/urns/edge'
import { z } from 'zod'
import { Context } from '../../context'
import * as update from '../../db/update'

export const UpdateNodeCompsMethodInput = z.object({
  urnOfNode: AnyURNInput,
})
export type UpdateNodeCompsParam = z.infer<typeof UpdateNodeCompsMethodInput>

export const UpdateNodeCompsMethodOutput = z.void()

export type UpdateNodeCompsResult = z.infer<typeof UpdateNodeCompsMethodOutput>

export const updateNodeCompsMethod = async ({
  input,
  ctx,
}: {
  input: UpdateNodeCompsParam
  ctx: Context
}): Promise<UpdateNodeCompsResult> => {
  const nodeUrn = input.urnOfNode
  if (!nodeUrn) throw new Error('updateNodeCompsParam: No urn provided')

  const parsedUrn = parseUrnForEdge(nodeUrn)
  const stmts = update.node(ctx.graph, parsedUrn)
  await ctx.graph.db.batch(stmts)

  return
}
