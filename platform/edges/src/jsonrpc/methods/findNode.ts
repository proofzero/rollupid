import { NodeFilterInput } from '@proofzero/platform-middleware/inputValidators'
import { Context } from '../../context'
import { Node as NodeSchema } from '../validators/node'
import * as db from '../../db'
import { Node, NodeFilter } from '../../db/types'
import { z } from 'zod'

export const FindNodeMethodInput = NodeFilterInput

export const FindNodeMethodOutput = NodeSchema.optional()
export const FindNodeBatchMethodInput = z.array(NodeFilterInput)
export const FindNodeBatchMethodOutput = z.array(FindNodeMethodOutput)

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

export const findNodeBatchMethod = async ({
  input,
  ctx,
}: {
  input: NodeFilter[]
  ctx: Context
}): Promise<(Node | undefined)[]> => {
  const nodes = await db.nodeBatch(ctx.graph, input)
  return nodes
}
