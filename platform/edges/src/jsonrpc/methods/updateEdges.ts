import * as db from '../../db'
import { z } from 'zod'
import { Context } from '../../context'
import {
  AnyURNInput,
  EdgeTagInput,
} from '@kubelt/platform-middleware/inputValidators'

export const UpdateEdgesMethodInput = z.array(
  z.object({
    src: AnyURNInput,
    dst: AnyURNInput,
    tag: EdgeTagInput,
  })
)

export const UpdateEdgesMethodOutput = z.object({
  edges: z.array(
    z.object({
      src: AnyURNInput,
      dst: AnyURNInput,
      tag: EdgeTagInput,
    })
  ),
})

export type UpdateEdgesParams = z.infer<typeof UpdateEdgesMethodInput>
export type UpdateEdgesResult = z.infer<typeof UpdateEdgesMethodOutput>

export const updateEdgesMethod = async ({
  input,
  ctx,
}: {
  input: UpdateEdgesParams
  ctx: Context
}): Promise<UpdateEdgesResult> => {
  await db.batchUpsert(ctx.graph, input)

  return {
    edges: input,
  }
}
