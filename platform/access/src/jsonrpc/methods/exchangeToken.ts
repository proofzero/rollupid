import { z } from 'zod'
import { decodeJwt } from 'jose'

import {
  AUTHENTICATION_TOKEN_OPTIONS,
  EDGE_AUTHENTICATES,
  EDGE_AUTHORIZES,
} from '@kubelt/platform.access/src/constants'

import { AccessURNSpace } from '@kubelt/urns/access'
import { AccountURN, AccountURNSpace } from '@kubelt/urns/account'
import { AccessJWTPayload, GrantType, Scope } from '@kubelt/types/access'

import { Context } from '../../context'
import { initAuthorizationNodeByName, initAccessNodeByName } from '../../nodes'

import getIdTokenProfileFromAccount from '../../utils/getIdTokenProfileFromAccount'

const AuthenticationCodeInput = z.object({
  grantType: z.literal(GrantType.AuthenticationCode),
  code: z.string(),
  clientId: z.string(),
})

type AuthenticationCodeInput = z.infer<typeof AuthenticationCodeInput>

const AuthorizationCodeInput = z.object({
  grantType: z.literal(GrantType.AuthorizationCode),
  code: z.string(),
  clientId: z.string(),
  clientSecret: z.string(),
})

type AuthorizationCodeInput = z.infer<typeof AuthorizationCodeInput>

const RefreshTokenInput = z.object({
  grantType: z.literal(GrantType.RefreshToken),
  refreshToken: z.string(),
  clientId: z.string(),
  clientSecret: z.string(),
})

type RefreshTokenInput = z.infer<typeof RefreshTokenInput>

export const ExchangeTokenMethodInput = z.discriminatedUnion('grantType', [
  AuthenticationCodeInput,
  AuthorizationCodeInput,
  RefreshTokenInput,
])

type ExchangeTokenMethodInput = z.infer<typeof ExchangeTokenMethodInput>

export const ExchangeTokenMethodOutput = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  idToken: z.string().optional(),
})

type ExchangeTokenMethodOutput = z.infer<typeof ExchangeTokenMethodOutput>

type ExchangeTokenParams<T = ExchangeTokenMethodInput> = {
  ctx: Context
  input: T
}

interface ExchangeTokenMethod<T = ExchangeTokenMethodInput> {
  (params: ExchangeTokenParams<T>): Promise<ExchangeTokenMethodOutput>
}

export const exchangeTokenMethod: ExchangeTokenMethod = async ({
  ctx,
  input,
}) => {
  const { grantType } = input
  if (grantType == GrantType.AuthenticationCode) {
    return handleAuthenticationCode({ ctx, input })
  } else if (grantType == GrantType.AuthorizationCode) {
    return handleAuthorizationCode({ ctx, input })
  } else if (grantType == GrantType.RefreshToken) {
    return handleRefreshToken({ ctx, input })
  } else {
    throw new Error(`unsupported grant type: ${grantType}`)
  }
}

const handleAuthenticationCode: ExchangeTokenMethod<
  AuthenticationCodeInput
> = async ({ ctx, input }) => {
  const { code, clientId } = input

  const authorizationNode = await initAuthorizationNodeByName(
    code,
    ctx.Authorization
  )

  await authorizationNode.class.exchangeToken(code, clientId)

  const account = (await authorizationNode.storage.get<AccountURN>(
    'account'
  )) as AccountURN
  const scope: Scope = (await authorizationNode.storage.get('scope')) || []

  const name = `${AccountURNSpace.decode(account)}@${account}`
  const accessNode = await initAccessNodeByName(name, ctx.Access)
  const result = await accessNode.class.generate(account, clientId, scope, {
    accessExpiry: AUTHENTICATION_TOKEN_OPTIONS.expirationTime,
  })

  return result
}

const handleAuthorizationCode: ExchangeTokenMethod<
  AuthorizationCodeInput
> = async ({ ctx, input }) => {
  const { code, clientId, clientSecret } = input

  const { valid } = await ctx.starbaseClient.checkAppAuth.query({
    clientId,
    clientSecret,
  })

  if (!valid) {
    throw new Error('invalid client credentials')
  }

  const authorizationNode = await initAuthorizationNodeByName(
    code,
    ctx.Authorization
  )

  await authorizationNode.class.exchangeToken(code, clientId)

  const account = (await authorizationNode.storage.get<AccountURN>(
    'account'
  )) as AccountURN
  const scope: string[] = []

  const name = `${AccountURNSpace.decode(account)}@${clientId}`
  const accessNode = await initAccessNodeByName(name, ctx.Access)
  const idTokenProfile = await getIdTokenProfileFromAccount(account, ctx)
  const result = await accessNode.class.generate(account, clientId, scope, {
    idTokenProfile,
  })

  const access = AccessURNSpace.componentizedUrn(name, { client_id: clientId })
  await ctx.edgesClient!.makeEdge.mutate({
    src: account,
    dst: access,
    tag: EDGE_AUTHORIZES,
  })

  return result
}

const handleRefreshToken: ExchangeTokenMethod<RefreshTokenInput> = async ({
  ctx,
  input,
}) => {
  const { refreshToken, clientId, clientSecret } = input

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

  const payload = decodeJwt(refreshToken) as AccessJWTPayload
  if (clientId != payload.aud[0]) {
    throw new Error('mismatch Client ID')
  }

  if (!payload.sub) {
    throw new Error('missing subject')
  }

  const account = payload.sub
  const name = `${AccountURNSpace.decode(account)}@${clientId}`
  const accessNode = await initAccessNodeByName(name, ctx.Access)
  return accessNode.class.refresh(refreshToken)
}
