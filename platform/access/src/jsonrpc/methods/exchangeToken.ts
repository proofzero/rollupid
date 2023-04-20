import { z } from 'zod'
import * as jose from 'jose'

import {
  ACCESS_TOKEN_OPTIONS,
  AUTHENTICATION_TOKEN_OPTIONS,
  EDGE_AUTHORIZES,
} from '../../constants'

import { AccessURNSpace } from '@proofzero/urns/access'
import { AccountURN, AccountURNSpace } from '@proofzero/urns/account'
import { AccessJWTPayload, GrantType, Scope } from '@proofzero/types/access'

import { Context } from '../../context'
import { getJWKS, getPrivateJWK } from '../../jwk'
import { initAuthorizationNodeByName, initAccessNodeByName } from '../../nodes'

import {
  InvalidClientCredentialsError,
  MismatchClientIdError,
  MissingSubjectError,
  UnsupportedGrantTypeError,
} from '../../errors'

import { PersonaData } from '@proofzero/types/application'
import {
  getClaimValues,
  setPersonaReferences,
} from '@proofzero/security/persona'

const AuthenticationCodeInput = z.object({
  grantType: z.literal(GrantType.AuthenticationCode),
  code: z.string(),
  clientId: z.string(),
  issuer: z.string(),
})

type AuthenticationCodeInput = z.infer<typeof AuthenticationCodeInput>

const AuthenticationCodeOutput = z.object({
  accessToken: z.string(),
})

type AuthenticationCodeOutput = z.infer<typeof AuthenticationCodeOutput>

const AuthorizationCodeInput = z.object({
  grantType: z.literal(GrantType.AuthorizationCode),
  code: z.string(),
  clientId: z.string(),
  clientSecret: z.string(),
  issuer: z.string(),
})

type AuthorizationCodeInput = z.infer<typeof AuthorizationCodeInput>

const AuthorizationCodeOutput = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  idToken: z.string(),
})

type AuthorizationCodeOutput = z.infer<typeof AuthorizationCodeOutput>

const RefreshTokenInput = z.object({
  grantType: z.literal(GrantType.RefreshToken),
  refreshToken: z.string(),
  clientId: z.string(),
  clientSecret: z.string(),
  issuer: z.string(),
})

type RefreshTokenInput = z.infer<typeof RefreshTokenInput>

const RefreshTokenOutput = z.object({
  accessToken: z.string(),
})

type RefreshTokenOutput = z.infer<typeof RefreshTokenOutput>

export const ExchangeTokenMethodInput = z.discriminatedUnion('grantType', [
  AuthenticationCodeInput,
  AuthorizationCodeInput,
  RefreshTokenInput,
])

type ExchangeTokenMethodInput = z.infer<typeof ExchangeTokenMethodInput>

export const ExchangeTokenMethodOutput = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  idToken: z.string().optional(),
})

type ExchangeTokenMethodOutput = z.infer<typeof ExchangeTokenMethodOutput>

type ExchangeTokenParams<T = ExchangeTokenMethodInput> = {
  ctx: Context
  input: T
}

interface ExchangeTokenMethod<
  T = ExchangeTokenMethodInput,
  R = ExchangeTokenMethodOutput
> {
  (params: ExchangeTokenParams<T>): Promise<R>
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
    throw new UnsupportedGrantTypeError(grantType)
  }
}

const handleAuthenticationCode: ExchangeTokenMethod<
  AuthenticationCodeInput,
  AuthenticationCodeOutput
> = async ({ ctx, input }) => {
  const { code, clientId, issuer } = input

  const authorizationNode = await initAuthorizationNodeByName(
    code,
    ctx.Authorization
  )

  await authorizationNode.class.exchangeToken(code, clientId)

  const account = (await authorizationNode.storage.get<AccountURN>(
    'account'
  )) as AccountURN

  const name = `${AccountURNSpace.decode(account)}@${account}`
  const accessNode = await initAccessNodeByName(name, ctx.Access)
  await accessNode.storage.put({ account, clientId: 'rollup' })

  const { expirationTime } = AUTHENTICATION_TOKEN_OPTIONS
  const scope: Scope = (await authorizationNode.storage.get('scope')) || []

  const jku = generateJKU(issuer)
  const jwk = getPrivateJWK(ctx)

  return {
    accessToken: await accessNode.class.generateAccessToken({
      jku,
      jwk,
      account,
      clientId,
      expirationTime,
      issuer,
      scope,
    }),
  }
}

const handleAuthorizationCode: ExchangeTokenMethod<
  AuthorizationCodeInput,
  AuthorizationCodeOutput
> = async ({ ctx, input }) => {
  const { code, clientId, clientSecret, issuer } = input

  const { valid } = await ctx.starbaseClient.checkAppAuth.query({
    clientId,
    clientSecret,
  })

  if (!valid) throw InvalidClientCredentialsError

  const authorizationNode = await initAuthorizationNodeByName(
    code,
    ctx.Authorization
  )

  await authorizationNode.class.exchangeToken(code, clientId)

  const account = (await authorizationNode.storage.get<AccountURN>(
    'account'
  )) as AccountURN
  const resultMap = await authorizationNode.storage.get([
    'scope',
    'personaData',
  ])
  const scope = (resultMap.get('scope') || []) as string[]
  const personaData = (resultMap.get('personaData') || {}) as PersonaData
  const name = `${AccountURNSpace.decode(account)}@${clientId}`
  const accessNode = await initAccessNodeByName(name, ctx.Access)
  const { expirationTime } = ACCESS_TOKEN_OPTIONS

  await accessNode.storage.put({ account, clientId, personaData })
  const access = AccessURNSpace.componentizedUrn(name, { client_id: clientId })
  await ctx.edgesClient!.makeEdge.mutate({
    src: account,
    dst: access,
    tag: EDGE_AUTHORIZES,
  })
  await setPersonaReferences(
    access,
    scope,
    personaData,
    { edgesFetcher: ctx.Edges },
    ctx.traceSpan
  )

  const jku = generateJKU(issuer)
  const jwk = getPrivateJWK(ctx)

  const accessToken = await accessNode.class.generateAccessToken({
    jku,
    jwk,
    account,
    clientId,
    expirationTime,
    issuer,
    scope,
  })

  const refreshToken = await accessNode.class.generateRefreshToken({
    jku,
    jwk,
    account,
    clientId,
    issuer,
    scope,
  })

  //TODO: this will need to use a more specific getIdTokenClaimValues()
  //in the next iteration of this
  const idTokenClaims = await getClaimValues(
    account,
    clientId,
    scope,
    { edgesFetcher: ctx.Edges, accountFetcher: ctx.Account },
    ctx.traceSpan,
    personaData
  )
  const idToken = await accessNode.class.generateIdToken({
    jku,
    jwk,
    account,
    clientId,
    expirationTime,
    idTokenClaims: idTokenClaims,
    issuer,
  })

  return { accessToken, refreshToken, idToken }
}

const handleRefreshToken: ExchangeTokenMethod<RefreshTokenInput> = async ({
  ctx,
  input,
}) => {
  const { refreshToken, clientId, clientSecret, issuer } = input

  if (!ctx.starbaseClient) {
    throw new Error('missing starbase client')
  }

  const { valid } = await ctx.starbaseClient.checkAppAuth.query({
    clientId,
    clientSecret,
  })

  if (!valid) throw InvalidClientCredentialsError

  const payload = jose.decodeJwt(refreshToken) as AccessJWTPayload
  if (clientId != payload.aud[0]) throw MismatchClientIdError
  if (!payload.sub) throw MissingSubjectError

  const account = payload.sub
  const name = `${AccountURNSpace.decode(account)}@${clientId}`
  const accessNode = await initAccessNodeByName(name, ctx.Access)

  const jwks = getJWKS(ctx)
  await accessNode.class.verify(refreshToken, jwks)

  const scope = payload.scope.split(' ')
  const { expirationTime } = ACCESS_TOKEN_OPTIONS

  const jku = generateJKU(issuer)
  const jwk = getPrivateJWK(ctx)

  return {
    accessToken: await accessNode.class.generateAccessToken({
      jku,
      jwk,
      account,
      clientId,
      expirationTime,
      issuer,
      scope,
    }),
  }
}

const generateJKU = (issuer: string) => {
  return `${issuer}/.well-known/jwks.json`
}
