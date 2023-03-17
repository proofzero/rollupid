import * as db from '../../db'
import { z } from 'zod'
import { Context } from '../../context'
import {
  AnyURNInput,
  EdgeTagInput,
} from '@proofzero/platform-middleware/inputValidators'
import { AnyURN } from '@proofzero/urns'
import { EdgeURN } from '@proofzero/urns/edge'

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
  await db.link(ctx.graph, input.src, input.dst, input.tag)

  console.log(`created edge ${input.src} =[${input.tag}]=> ${input.dst}`)

  return {
    edge: {
      src: input.src,
      dst: input.dst,
      tag: input.tag,
    },
  }
}
