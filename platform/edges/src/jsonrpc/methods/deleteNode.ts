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

  if (
    deleted.length > 1 ||
    (deleted.length === 1 && deleted[0].meta && deleted[0].meta.changes > 1)
  )
    //This should never happen, but adding just in case
    throw new InternalServerError({
      message: 'Node deletion returned more than one result.',
    })
  return { deleted: deleted[0].meta.changes === 1 }
}
