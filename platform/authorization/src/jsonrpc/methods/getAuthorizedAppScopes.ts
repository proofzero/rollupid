import { z } from 'zod'
import { Context } from '../../context'
import { initAuthorizationNodeByName } from '../../nodes'
import { inputValidators } from '@proofzero/platform-middleware'
import { AuthorizationURNSpace } from '@proofzero/urns/authorization'
import { IdentityURNSpace } from '@proofzero/urns/identity'
import { appRouter } from '../router'
import { getClaimValues } from '@proofzero/security/persona'

export const GetAuthorizedAppScopesMethodInput = z.object({
  identityURN: inputValidators.IdentityURNInput,
  clientId: z.string().min(1),
})
type GetAuthorizedAppScopesMethodParams = z.infer<
  typeof GetAuthorizedAppScopesMethodInput
>

export const GetAuthorizedAppScopesMethodOutput = z.object({
  scopes: z.array(z.string()),
  claimValues: z.record(
    z.string(),
    z.object({
      claims: z.record(z.string(), z.any()),
      meta: z.object({
        urns: z.array(z.string()),
        valid: z.boolean(),
      }),
    })
  ),
})

export type GetAuthorizedAppScopesMethodResult = z.infer<
  typeof GetAuthorizedAppScopesMethodOutput
>

export const getAuthorizedAppScopesMethod = async ({
  input,
  ctx,
}: {
  input: GetAuthorizedAppScopesMethodParams
  ctx: Context
}): Promise<GetAuthorizedAppScopesMethodResult> => {
  const { identityURN, clientId } = input

  const nss = `${IdentityURNSpace.decode(identityURN)}@${clientId}`
  const urn = AuthorizationURNSpace.componentizedUrn(nss)
  const authorizationNode = initAuthorizationNodeByName(
    urn,
    ctx.env.Authorization
  )

  const authorizationCaller = appRouter.createCaller(ctx)
  const [tokenState, personaData] = await Promise.all([
    authorizationNode.class.getTokenState(),
    authorizationCaller.getPersonaData({
      identityURN,
      clientId,
    }),
  ])
  const { tokenIndex, tokenMap } = tokenState

  const scopes = Array.from(
    new Set(tokenIndex.flatMap((t) => tokenMap[t].scope))
  )

  const claimValues = await getClaimValues(
    identityURN,
    clientId,
    scopes,
    ctx.env.Core,
    ctx.traceSpan,
    personaData
  )

  return { scopes, claimValues }
}
