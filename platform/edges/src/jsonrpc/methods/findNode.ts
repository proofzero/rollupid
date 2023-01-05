import { z } from 'zod'
import { Context } from '../../context'

export const FindNodeMethodInput = z.any()

export const FindNodeMethodOutput = z.any()

export type FindNodeParams = z.infer<typeof FindNodeMethodInput>

export const findNodeMethod = async ({
  input,
  ctx,
}: {
  input: FindNodeParams
  ctx: Context
}): Promise<unknown> => {
  throw 'findNode Method Not implemented'
}
