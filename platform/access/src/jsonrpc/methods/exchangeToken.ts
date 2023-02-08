import { z } from 'zod'

import { EDGE_ACCESS } from '@kubelt/platform.access/src/constants'

import { AccessURNSpace } from '@kubelt/urns/access'
import { AccountURN } from '@kubelt/urns/account'
import { GrantType, Scope } from '@kubelt/types/access'

import { Context } from '../../context'
import { initAuthorizationNodeByName, initAccessNodeByName } from '../../nodes'

import { tokenValidator } from '../validators/token'
import getIdTokenProfileFromAccount from '../../utils/getIdTokenProfileFromAccount'

export const ExchangeTokenMethodInput = z.discriminatedUnion('grantType', [
  z.object({
    grantType: z.literal(GrantType.AuthenticationCode),
    code: z.string(),
    clientId: z.string(),
  }),
  z.object({
    grantType: z.literal(GrantType.AuthorizationCode),
    code: z.string(),
    clientId: z.string(),
    clientSecret: z.string(),
  }),
  z.object({
    grantType: z.literal(GrantType.RefreshToken),
    token: tokenValidator,
  }),
])

export const ExchangeTokenMethodOutput = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  idToken: z.string().optional(),
})

export type ExchangeTokenParams = z.infer<typeof ExchangeTokenMethodInput>

export const exchangeTokenMethod = async ({
  input,
  ctx,
}: {
  input: ExchangeTokenParams
  ctx: Context
}) => {
  const { grantType } = input

  if (grantType == GrantType.AuthenticationCode) {
    const { code, clientId } = input
    console.log({ code, grantType })

    const authorizationNode = await initAuthorizationNodeByName(
      code,
      ctx.Authorization
    )

    // TODO: what does this do other than validate code?
    await authorizationNode.class.exchangeToken(code, clientId)
    const account = (await authorizationNode.storage.get<AccountURN>(
      'account'
    )) as AccountURN

    // create a new id but use it as the name
    const iss = ctx.Access.newUniqueId().toString()

    const accessNode = await initAccessNodeByName(iss, ctx.Access)
    const result = await accessNode.class.generate({
      iss,
      account,
      clientId,
      scope: [], //scope,
    })

    // Create an edge between Account and Access nodes to record the
    // existence of a user "session".
    const access = AccessURNSpace.componentizedUrn(
      iss,
      { grant_type: GrantType.AuthenticationCode },
      undefined
    )

    console.log({ access, edgesClient: ctx.edgesClient })
    // NB: we use InjectEdges middleware to inject this service client.
    await ctx.edgesClient!.makeEdge.mutate({
      src: account,
      dst: access,
      tag: EDGE_ACCESS,
    })

    return result
  } else if (grantType == GrantType.AuthorizationCode) {
    const { code, clientId, clientSecret } = input

    // first step is to get the app profile from starbase
    const validationResult = await ctx.starbaseClient?.checkAppAuth
      .query({
        clientId,
        clientSecret,
      })
      .then((res) => res.valid)
      .catch((err) => {
        console.error('Failed to validate app', err)
        return false
      })

    if (!validationResult) {
      throw new Error('Invalid app credentials')
    }

    const authorizationNode = await initAuthorizationNodeByName(
      code,
      ctx.Authorization
    )

    await authorizationNode.class.exchangeToken(code, clientId)
    // TODO: validate the scopes list is good by gettings scopes stored in the node and comparing to app scopes?
    const scopes = await authorizationNode.storage.get<string[]>('scopes')
    const account = (await authorizationNode.storage.get<AccountURN>(
      'account'
    )) as AccountURN

    // create a new id but use it as the name
    const iss = ctx.Access.newUniqueId().toString()

    const idTokenProfile = await getIdTokenProfileFromAccount(account, ctx)

    const accessNode = await initAccessNodeByName(iss, ctx.Access)
    const result = await accessNode.class.generate({
      iss,
      account,
      clientId,
      scope: scopes,
      idTokenProfile,
    })

    // Create an edge between Account and Access nodes to record the
    // existence of a user "session".
    const access = AccessURNSpace.componentizedUrn(
      iss,
      { client_id: clientId, grant_type: GrantType.AuthorizationCode },
      undefined
    )

    console.log({ access, edgesClient: ctx.edgesClient })
    // NB: we use InjectEdges middleware to inject this service client.
    await ctx.edgesClient!.makeEdge.mutate({
      src: account,
      dst: access,
      tag: EDGE_ACCESS,
    })

    return result
  } else if (grantType == GrantType.RefreshToken) {
    const {
      token: { iss, token },
    } = input

    const accessNode = await initAccessNodeByName(iss, ctx.Access)
    const result = await accessNode.class.refresh(iss, token)
    return result
  } else {
    throw new Error(`unsupported grant type: ${grantType}`)
  }
}
