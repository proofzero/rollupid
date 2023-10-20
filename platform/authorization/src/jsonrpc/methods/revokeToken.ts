import { z } from 'zod'
import { decodeJwt } from 'jose'

import { router } from '@proofzero/platform.core'
import type { AuthorizationJWTPayload } from '@proofzero/types/authorization'
import { AuthorizationURNSpace } from '@proofzero/urns/authorization'
import { IdentityURNSpace } from '@proofzero/urns/identity'

import { Context } from '../../context'
import { getJWKS } from '../../jwk'
import { initAuthorizationNodeByName } from '../../nodes'

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

  const payload = decodeJwt(token) as AuthorizationJWTPayload
  if (clientId != payload.aud[0]) throw MismatchClientIdError
  if (!payload.sub) throw MissingSubjectError

  const identityURN = payload.sub
  const nss = `${IdentityURNSpace.decode(identityURN)}@${clientId}`
  const urn = AuthorizationURNSpace.componentizedUrn(nss)
  const node = initAuthorizationNodeByName(urn, ctx.env.Authorization)
  const jwks = getJWKS(ctx)
  await node.class.revoke(token, jwks, { issuer })
}
