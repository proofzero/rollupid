import * as db from '../../db'
import { z } from 'zod'
import { Context } from '../../context'
import {
  AnyURNInput,
  EdgeTagInput,
} from '@proofzero/platform-middleware/inputValidators'

export const RemoveEdgeMethodInput = z.object({
  src: AnyURNInput,
  dst: AnyURNInput,
  tag: EdgeTagInput,
})

export const RemoveEdgeMethodOutput = z.void()

export type RemoveEdgeParams = z.infer<typeof RemoveEdgeMethodInput>

export type RemoveEdgeMethodOutput = z.infer<typeof RemoveEdgeMethodOutput>

export const removeEdgeMethod = async ({
  input,
  ctx,
}: {
  input: RemoveEdgeParams
  ctx: Context
}): Promise<RemoveEdgeMethodOutput> => {
  await db.unlink(ctx.graph, input.src, input.dst, input.tag)

  console.log(`deleted edge: ${input.src} =[${input.tag}]=> ${input.dst}`)

  return
}
