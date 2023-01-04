import * as db from '../../db'
import { z } from 'zod'
import { Context } from '../../context'
import {
  AnyURNInput,
  EdgeTagInput,
} from '@kubelt/platform-middleware/inputValidators'

export const MakeEdgeMethodInput = z.object({
  src: AnyURNInput,
  dst: AnyURNInput,
  tag: EdgeTagInput,
})

export const MakeEdgeMethodOutput = z.object({
  edge: z.object({
    src: AnyURNInput,
    dst: AnyURNInput,
    tag: EdgeTagInput,
  }),
})

export type MakeEdgeParams = z.infer<typeof MakeEdgeMethodInput>

export const makeEdgeMethod = async ({
  input,
  ctx,
}: {
  input: MakeEdgeParams
  ctx: Context
}): Promise<unknown> => {
  const edge = await db.link(ctx.graph, input.src, input.dst, input.tag)

  console.log(
    `created edge ${edge.id}: ${edge.srcUrn} =[${edge.tag}]=> ${edge.dstUrn}`
  )

  return {
    edge: {
      src: edge.srcUrn,
      dst: edge.dstUrn,
      tag: edge.tag,
    },
  }
}
