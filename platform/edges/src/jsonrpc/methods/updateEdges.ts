import * as db from '../../db'
import { z } from 'zod'
import { Context } from '../../context'
import {
  AnyURNInput,
  EdgeTagInput,
} from '@kubelt/platform-middleware/inputValidators'
import { Edge } from '../../db/types'
import { AnyURN } from '@kubelt/urns'
import { EdgeURN } from '@kubelt/urns/edge'

export const UpdateEdgeMethodInput = z.array(
  z.object({
    src: AnyURNInput,
    dst: AnyURNInput,
    tag: EdgeTagInput,
  })
)

export const UpdateEdgeMethodOutput = z.object({
  edges: z.array(
    z.object({
      src: AnyURNInput,
      dst: AnyURNInput,
      tag: EdgeTagInput,
    })
  ),
})

export type MakeEdgeParams = z.infer<typeof UpdateEdgeMethodInput>

export const updateEdgeMethod = async ({
  input,
  ctx,
}: {
  input: MakeEdgeParams
  ctx: Context
}): Promise<{
  edge: {
    src: AnyURN
    dst: AnyURN
    tag: EdgeURN
  }
}> => {
  const edge = await db.link(ctx.graph, input.src, input.dst, input.tag)

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
