// @kubelt/platform.access:src/jsonrpc/methods/getSession.ts

import { z } from 'zod'

import { AccessURNSpace } from '@kubelt/urns/access'

import { Context } from '../../context'
import { initAccessNodeByName } from '../../nodes'
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
  input,
  ctx,
}: {
  input: GetSessionParams
  ctx: Context
}) => {
  const name = AccessURNSpace.decode(input)

  const accessNode = await initAccessNodeByName(name, ctx.Access)

  const status = await accessNode.class.status()

  return status
}
