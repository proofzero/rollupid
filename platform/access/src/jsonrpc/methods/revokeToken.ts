import { z } from 'zod'
import { decodeJwt } from 'jose'

import type { AccessJWTPayload } from '@kubelt/types/access'

import { Context } from '../../context'
import { initAccessNodeByName } from '../../nodes'

export const RevokeTokenMethodInput = z.object({
  token: z.string(),
  clientId: z.string(),
  clientSecret: z.string(),
})
type RevokeTokenMethodInput = z.infer<typeof RevokeTokenMethodInput>

export const RevokeTokenMethodOutput = z.void()
type RevokeTokenMethodOutput = z.infer<typeof RevokeTokenMethodOutput>

type RevokeTokenParams = {
  ctx: Context
  input: RevokeTokenMethodInput
}

interface RevokeTokenMethod {
  (params: RevokeTokenParams): Promise<RevokeTokenMethodOutput>
}

export const revokeTokenMethod: RevokeTokenMethod = async ({ ctx, input }) => {
  const { token, clientId, clientSecret } = input

  if (!ctx.starbaseClient) {
    throw new Error('missing starbase client')
  }

  const { valid } = await ctx.starbaseClient.checkAppAuth.query({
    clientId,
    clientSecret,
  })

  if (!valid) {
    throw new Error('invalid client credentials')
  }

  const payload = decodeJwt(token) as AccessJWTPayload
  if (clientId != payload.aud[0]) {
    throw new Error('mismatch Client ID')
  }

  if (!payload.sub) {
    throw new Error('missing subject')
  }

  const account = payload.sub
  const name = `${account}@${clientId}`
  const accessNode = await initAccessNodeByName(name, ctx.Access)
  await accessNode.class.revoke(token)
}
