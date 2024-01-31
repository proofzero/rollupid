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

export const VerifyTokenMethodInput = z.object({
  token: z.string(),
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
  issuer: z.string().optional(),
})
type VerifyTokenMethodInput = z.infer<typeof VerifyTokenMethodInput>

export const VerifyTokenMethodOutput = z.object({
  payload: z.object({
    aud: z.union([z.string(), z.array(z.string()), z.undefined()]),
    iss: z.string().optional(),
  }),
})
type VerifyTokenMethodOutput = z.infer<typeof VerifyTokenMethodOutput>

type VerifyTokenParams = {
  ctx: Context
  input: VerifyTokenMethodInput
}

interface VerifyTokenMethod {
  (params: VerifyTokenParams): Promise<VerifyTokenMethodOutput>
}

export const verifyTokenMethod: VerifyTokenMethod = async ({ ctx, input }) => {
  const { token, clientId, clientSecret, issuer } = input

  if (clientId && clientSecret) {
    const caller = router.createCaller(ctx)
    const { valid } = await caller.starbase.checkAppAuth({
      clientId,
      clientSecret,
    })
    if (!valid) throw InvalidClientCredentialsError
  }

  const payload = decodeJwt(token) as AuthorizationJWTPayload
  if (clientId && clientId != payload.aud[0]) throw MismatchClientIdError
  if (!payload.sub) throw MissingSubjectError

  const identityURN = payload.sub
  const nss = `${IdentityURNSpace.decode(identityURN)}@${clientId}`
  const urn = AuthorizationURNSpace.componentizedUrn(nss)
  const node = initAuthorizationNodeByName(urn, ctx.Authorization)
  const jwks = getJWKS(ctx)
  return node.class.verify(token, jwks, { issuer })
}
