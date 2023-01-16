import * as db from '../../db'
import { z } from 'zod'
import { Context } from '../../context'
import {
  AnyURNInput,
  EdgeTagInput,
} from '@kubelt/platform-middleware/inputValidators'

export const RemoveEdgeMethodInput = z.object({
  src: AnyURNInput,
  dst: AnyURNInput,
  tag: EdgeTagInput,
})

export const RemoveEdgeMethodOutput = z.object({
  removed: z.number(),
})

export type RemoveEdgeParams = z.infer<typeof RemoveEdgeMethodInput>

export const removeEdgeMethod = async ({
  input,
  ctx,
}: {
  input: RemoveEdgeParams
  ctx: Context
}): Promise<{
  removed: number
}> => {
  const edgeId = await db.unlink(ctx.db, input.src, input.dst, input.tag)

  console.log(
    `deleted edge ${edgeId}: ${input.src} =[${input.tag}]=> ${input.dst}`
  )

  return {
    removed: edgeId,
  }
}
