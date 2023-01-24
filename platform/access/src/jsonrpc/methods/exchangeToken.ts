import { z } from 'zod'

import { EDGE_ACCESS } from '@kubelt/platform.access/src/constants'

import { AccessURNSpace } from '@kubelt/urns/access'
import { AccountURN } from '@kubelt/urns/account'

import { Context } from '../../context'
import { initAuthorizationNodeByName, initAccessNodeByName } from '../../nodes'

import { GrantType } from '../../types'
import { tokenValidator } from '../validators/token'

export const ExchangeTokenMethodInput = z.discriminatedUnion('grantType', [
  z.object({
    grantType: z.literal(GrantType.AuthenticationCode),
    code: z.string(),
    redirectUri: z.string(),
    clientId: z.string(),
  }),
  z.object({
    grantType: z.literal(GrantType.AuthorizationCode),
    code: z.string(),
    redirectUri: z.string(),
    clientId: z.string(),
    clientSecret: z.string(),
    scopes: z.array(z.string()).optional(),
  }),
  z.object({
    grantType: z.literal(GrantType.RefreshToken),
    token: tokenValidator,
  }),
])

export const ExchangeTokenMethodOutput = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
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

  console.log({ grantType })

  if (grantType == GrantType.AuthenticationCode) {
    const { code, redirectUri, clientId } = input

    const authorizationNode = await initAuthorizationNodeByName(
      code,
      ctx.Authorization
    )

    // TODO: what does this do other than validate code?
    await authorizationNode.class.exchangeToken(code, redirectUri, clientId)
    const account = (await authorizationNode.storage.get<AccountURN>(
      'account'
    )) as AccountURN

    // create a new id but use it as the name
    const iss = ctx.Access.newUniqueId().toString()
    console.log({ iss })

    const accessNode = await initAccessNodeByName(iss, ctx.Access)
    const result = await accessNode.class.generate({
      iss,
      account,
      clientId,
      scope: [], //scope,
    })

    // Create an edge between Account and Access nodes to record the
    // existence of a user "session".
    const access = AccessURNSpace.urn(iss)

    console.log({ access, edgesClient: ctx.edgesClient })
    // NB: we use InjectEdges middleware to inject this service client.
    await ctx.edgesClient!.makeEdge.mutate({
      src: account,
      dst: access,
      tag: EDGE_ACCESS,
    })

    return result
  } else if (grantType == GrantType.AuthorizationCode) {
    const { code, redirectUri, clientId, clientSecret, scopes } = input

    // first step is to get the app profile from starbase
    const validationResult = await ctx.starbaseClient?.checkAppAuth
      .query({
        clientId,
        clientSecret,
        redirectURI: redirectUri,
        scopes,
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

    // TODO: what does this do other than validate code?
    await authorizationNode.class.exchangeToken(code, redirectUri, clientId)
    const account = (await authorizationNode.storage.get<AccountURN>(
      'account'
    )) as AccountURN

    // create a new id but use it as the name
    const iss = ctx.Access.newUniqueId().toString()
    console.log({ iss })

    const accessNode = await initAccessNodeByName(iss, ctx.Access)
    const result = await accessNode.class.generate({
      iss,
      account,
      clientId,
      scope: scopes,
    })

    // Create an edge between Account and Access nodes to record the
    // existence of a user "session".
    const access = AccessURNSpace.urn(iss)

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
