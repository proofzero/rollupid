import { Context } from '../../context'
import * as remove from '../../db/remove'
import { z } from 'zod'
import { AnyURNInput } from '@proofzero/platform-middleware/inputValidators'
import { BadRequestError, InternalServerError } from '@proofzero/errors'
import { AnyURN } from '@proofzero/urns'

export const DeleteNodeMethodInput = z.object({ urn: AnyURNInput })

export const DeleteNodeMethodOutput = z.object({ deleted: z.boolean() })

export const deleteNodeMethod = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof DeleteNodeMethodInput>
  ctx: Context
}): Promise<z.infer<typeof DeleteNodeMethodOutput>> => {
  const nodeUrn = input.urn
  if (!nodeUrn)
    throw new BadRequestError({
      message: 'No URN specified for deleteNode call',
    })
  const statement = remove.node(ctx.graph, nodeUrn)
  const deleted = await ctx.graph.db.batch([statement])

  return { deleted: deleted[0].meta.changes === 1 }
}
