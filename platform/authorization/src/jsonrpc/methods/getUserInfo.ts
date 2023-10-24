import { z } from 'zod'
import { decodeJwt } from 'jose'

import { BadRequestError, UnauthorizedError } from '@proofzero/errors'
import { AuthorizationURNSpace } from '@proofzero/urns/authorization'
import { IdentityURNSpace } from '@proofzero/urns/identity'
import { AuthorizationJWTPayload } from '@proofzero/types/authorization'

import { Context } from '../../context'
import { getJWKS } from '../../jwk'
import { initAuthorizationNodeByName } from '../../nodes'

import {
  getClaimValues,
  userClaimsFormatter,
} from '@proofzero/security/persona'
import { PersonaData } from '@proofzero/types/application'
import { getErrorCause } from '@proofzero/utils/errors'

export const GetUserInfoInput = z.object({
  access_token: z.string(),
  issuer: z.string().optional(),
})

export const GetUserInfoOutput = z.record(z.any())

export const getUserInfoMethod = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof GetUserInfoInput>
  ctx: Context
}): Promise<z.infer<typeof GetUserInfoOutput>> => {
  const token = input.access_token
  const jwt = decodeJwt(token) as AuthorizationJWTPayload
  const identityURN = jwt.sub
  const [clientId] = jwt.aud
  const scope = jwt.scope.split(' ')

  if (!clientId)
    throw new BadRequestError({
      message: 'missing client id in the aud claim',
    })

  if (!IdentityURNSpace.is(identityURN))
    throw new BadRequestError({
      message: 'missing identity in the sub claim',
    })

  const nss = `${IdentityURNSpace.decode(identityURN)}@${clientId}`
  const urn = AuthorizationURNSpace.componentizedUrn(nss)
  const authorizationNode = initAuthorizationNodeByName(
    urn,
    ctx.env.Authorization
  )
  const jwks = getJWKS(ctx.env)

  const { error } = await authorizationNode.class.verify(token, jwks, {
    issuer: input.issuer,
  })

  if (error) throw getErrorCause(error)

  const personaData = await authorizationNode.storage.get<PersonaData>(
    'personaData'
  )
  const claimValues = await getClaimValues(
    identityURN,
    clientId,
    scope,
    ctx.env.Core,
    ctx.traceSpan,
    personaData
  )

  for (const [_, scopeClaimResponse] of Object.entries(claimValues)) {
    if (!scopeClaimResponse.meta.valid)
      throw new UnauthorizedError({
        message: 'Authorized data error. Re-authorization by user required',
      })
  }
  //`sub` is a mandatory field in the userinfo result
  return { ...userClaimsFormatter(claimValues), sub: jwt.sub }
}
