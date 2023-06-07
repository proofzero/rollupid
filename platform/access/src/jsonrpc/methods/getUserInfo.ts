import { z } from 'zod'
import { decodeJwt } from 'jose'

import {
  BadRequestError,
  InternalServerError,
  UnauthorizedError,
} from '@proofzero/errors'
import { AccountURNSpace } from '@proofzero/urns/account'
import { AccessJWTPayload } from '@proofzero/types/access'

import { Context } from '../../context'
import { getJWKS } from '../../jwk'
import { initAccessNodeByName } from '../../nodes'

import {
  getClaimValues,
  userClaimsFormatter,
} from '@proofzero/security/persona'
import { PersonaData } from '@proofzero/types/application'

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
  const jwt = decodeJwt(token) as AccessJWTPayload
  const account = jwt.sub
  const [clientId] = jwt.aud
  const scope = jwt.scope.split(' ')

  if (!clientId)
    throw new BadRequestError({
      message: 'missing client id in the aud claim',
    })

  if (!AccountURNSpace.is(account))
    throw new BadRequestError({
      message: 'missing account in the sub claim',
    })

  const name = `${AccountURNSpace.decode(account)}@${clientId}`
  const accessNode = await initAccessNodeByName(name, ctx.Access)

  const jwks = getJWKS(ctx)
  await accessNode.class.verify(token, jwks, { issuer: input.issuer })

  const personaData = await accessNode.storage.get<PersonaData>('personaData')
  const claimValues = await getClaimValues(
    account,
    clientId,
    scope,
    {
      edgesFetcher: ctx.Edges,
      accountFetcher: ctx.Account,
      addressFetcher: ctx.Address,
    },
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
