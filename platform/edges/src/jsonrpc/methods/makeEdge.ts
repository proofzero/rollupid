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
}): Promise<{
  edge: {
    src: AnyURN
    dst: AnyURN
    tag: EdgeURN
  }
}> => {
  const edge = await db.link(ctx.db, input.src, input.dst, input.tag)

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
