import { NodeFilterInput } from '@kubelt/platform-middleware/inputValidators'
import { Context } from '../../context'
import { Node as NodeSchema } from '../validators/node'
import * as db from '../../db'
import { Node, NodeFilter } from '../../db/types'

export const FindNodeMethodInput = NodeFilterInput

export const FindNodeMethodOutput = NodeSchema.optional()

export const findNodeMethod = async ({
  input,
  ctx,
}: {
  input: NodeFilter
  ctx: Context
}): Promise<Node | undefined> => {
  const node = await db.node(ctx.graph, input)

  return node
}
