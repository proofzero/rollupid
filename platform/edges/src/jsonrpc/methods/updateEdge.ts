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

export const UpdateEdgeMethodInput = z.object({
  src: AnyURNInput,
  dst: AnyURNInput,
  tag: EdgeTagInput,
})

export const UpdateEdgeMethodOutput = z.object({
  edge: z.object({
    src: AnyURNInput,
    dst: AnyURNInput,
    tag: EdgeTagInput,
  }),
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
  await db.upsert(ctx.graph, input.src, input.dst, input.tag)

  console.log(`created edge ${input.src} =[${input.tag}]=> ${input.dst}`)

  return {
    edge: {
      src: input.src,
      dst: input.dst,
      tag: input.tag,
    },
  }
}
