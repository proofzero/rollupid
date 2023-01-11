// @kubelt/platform.access:src/jsonrpc/methods/getSession.ts

import { z } from 'zod'
import { Context } from '../../context'
import { AccessURNInput } from '@kubelt/platform-middleware/inputValidators'

export const GetSessionMethodInput = AccessURNInput

// NB: zod has added z.string().datetime() to support UTC dates, but
// doesn't yet appear in released version.
export const GetSessionMethodOutput = z.object({
  expired: z.boolean().optional(),
  expiry: z.string().optional(),
  creation: z.string().optional(),
})

export type GetSessionParams = z.infer<typeof GetSessionMethodInput>

export const getSessionMethod = async ({
  ctx,
}: {
  input: GetSessionParams
  ctx: Context
}) => {
  // The InjectAccessNode middleware injects the accessNode DO stub.
  return await ctx.accessNode!.class.status()
}
