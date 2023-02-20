import { AnyURNInput } from '@kubelt/platform-middleware/inputValidators'
import { z } from 'zod'
import { Context } from '../../context'
import * as db from '../../db'
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
  const result = await update.node(ctx.graph, nodeUrn)
}
