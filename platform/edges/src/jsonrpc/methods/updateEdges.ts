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
export type UpdateEdhesResult = z.infer<typeof UpdateEdgesMethodOutput>

export const updateEdgesMethod = async ({
  input,
  ctx,
}: {
  input: UpdateEdgesParams
  ctx: Context
}): Promise<UpdateEdhesResult> => {
  const edges = await db.link(ctx.graph, input.src, input.dst, input.tag)

  console.log(
    `created edge ${edge.id}: ${edge.src} =[${edge.tag}]=> ${edge.dst}`
  )

  return {
    edge: {
      src: edge.src,
      dst: edge.dst,
      tag: edge.tag,
    },
  }
}
