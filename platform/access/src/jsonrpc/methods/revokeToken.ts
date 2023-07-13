import { z } from 'zod'
import { decodeJwt } from 'jose'

import { router } from '@proofzero/platform.core'
import type { AccessJWTPayload } from '@proofzero/types/access'

import { Context } from '../../context'
import { getJWKS } from '../../jwk'
import { initAccessNodeByName } from '../../nodes'

import {
  InvalidClientCredentialsError,
  MismatchClientIdError,
  MissingSubjectError,
} from '../../errors'

export const RevokeTokenMethodInput = z.object({
  token: z.string(),
  clientId: z.string(),
  clientSecret: z.string(),
  issuer: z.string(),
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
  const { token, clientId, clientSecret, issuer } = input

  const caller = router.createCaller(ctx)
  const { valid } = await caller.starbase.checkAppAuth({
    clientId,
    clientSecret,
  })

  if (!valid) throw InvalidClientCredentialsError

  const payload = decodeJwt(token) as AccessJWTPayload
  if (clientId != payload.aud[0]) throw MismatchClientIdError
  if (!payload.sub) throw MissingSubjectError

  const account = payload.sub
  const name = `${account}@${clientId}`
  const accessNode = await initAccessNodeByName(name, ctx.Access)

  const jwks = getJWKS(ctx)
  await accessNode.class.revoke(token, jwks, { issuer })
}
