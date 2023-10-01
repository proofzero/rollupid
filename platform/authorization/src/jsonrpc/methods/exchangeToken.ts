import { z } from 'zod'
import * as jose from 'jose'

import { router } from '@proofzero/platform.core'

import {
  ACCESS_TOKEN_OPTIONS,
  AUTHENTICATION_TOKEN_OPTIONS,
  EDGE_AUTHORIZES,
} from '../../constants'

import { AuthorizationURNSpace } from '@proofzero/urns/authorization'
import { IdentityURN, IdentityURNSpace } from '@proofzero/urns/identity'
import {
  AuthorizationJWTPayload,
  GrantType,
  Scope,
} from '@proofzero/types/authorization'

import { Context } from '../../context'
import { generateJKU, getJWKS, getPrivateJWK } from '../../jwk'
import {
  initAuthorizationNodeByName,
  initExchangeCodeNodeByName,
} from '../../nodes'

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
  userClaimsFormatter,
} from '@proofzero/security/persona'
import { UnauthorizedError } from '@proofzero/errors'
import { createAnalyticsEvent } from '@proofzero/utils/analytics'

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
  R = ExchangeTokenMethodOutput,
> {
  (params: ExchangeTokenParams<T>): Promise<R>
}

export const exchangeTokenMethod: ExchangeTokenMethod = async ({
  ctx,
  input,
}) => {
  const { grantType } = input
  let result, eventObject
  if (grantType == GrantType.AuthenticationCode) {
    result = handleAuthenticationCode({ ctx, input })
    eventObject = 'authn_code'
  } else if (grantType == GrantType.AuthorizationCode) {
    result = handleAuthorizationCode({ ctx, input })
    eventObject = 'auth_code'
  } else if (grantType == GrantType.RefreshToken) {
    result = handleRefreshToken({ ctx, input })
    eventObject = 'refresh_token'
  } else {
    throw new UnsupportedGrantTypeError(grantType)
  }

  ctx.waitUntil?.(
    createAnalyticsEvent({
      eventName: `app_exchanged_${eventObject}`,
      distinctId: ctx.identityURN as IdentityURN,
      apiKey: ctx.POSTHOG_API_KEY,
      properties: {
        $groups: { app: input.clientId },
      },
    })
  )

  return result
}

const handleAuthenticationCode: ExchangeTokenMethod<
  AuthenticationCodeInput,
  AuthenticationCodeOutput
> = async ({ ctx, input }) => {
  const { code, clientId, issuer } = input

  const exchangeCodeNode = await initExchangeCodeNodeByName(
    code,
    ctx.ExchangeCode
  )

  await exchangeCodeNode.class.exchangeToken(code, clientId)

  const identity = (await exchangeCodeNode.storage.get<IdentityURN>(
    'identity'
  )) as IdentityURN

  const nss = `${IdentityURNSpace.decode(identity)}@${identity}`
  const urn = AuthorizationURNSpace.componentizedUrn(nss)
  const authorizationNode = initAuthorizationNodeByName(urn, ctx.Authorization)
  await authorizationNode.storage.put({ identity, clientId: 'rollup' })

  const { expirationTime } = AUTHENTICATION_TOKEN_OPTIONS
  const scope: Scope = (await authorizationNode.storage.get('scope')) || []

  const jku = generateJKU(issuer)
  const jwk = getPrivateJWK(ctx)

  return {
    accessToken: await authorizationNode.class.generateAccessToken({
      jku,
      jwk,
      identity,
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

  const caller = router.createCaller(ctx)
  const { valid } = await caller.starbase.checkAppAuth({
    clientId,
    clientSecret,
  })

  if (!valid) throw InvalidClientCredentialsError

  const exchangeCodeNode = await initExchangeCodeNodeByName(
    code,
    ctx.ExchangeCode
  )

  await exchangeCodeNode.class.exchangeToken(code, clientId)

  const identity = (await exchangeCodeNode.storage.get<IdentityURN>(
    'identity'
  )) as IdentityURN
  const resultMap = await exchangeCodeNode.storage.get(['scope', 'personaData'])
  const scope = (resultMap.get('scope') || []) as string[]
  const newPersonaData = (resultMap.get('personaData') || {}) as PersonaData
  const nss = `${IdentityURNSpace.decode(identity)}@${clientId}`
  const baseURN = AuthorizationURNSpace.componentizedUrn(nss)
  const authorizationNode = initAuthorizationNodeByName(
    baseURN,
    ctx.Authorization
  )
  const { expirationTime } = ACCESS_TOKEN_OPTIONS

  //We take the existing (already-authorized) personaData and update it with
  //any new data just authorized. This retains previous scope data that could
  //be needed for previous authorizations, but not the new one.
  const existingPersonaData =
    (await authorizationNode.storage.get<PersonaData>('personaData')) || {}
  const combinedPersonaData = Object.assign(existingPersonaData, newPersonaData)
  await authorizationNode.storage.put({
    identity,
    clientId,
    personaData: combinedPersonaData,
  })
  const fullAuthzURN = AuthorizationURNSpace.componentizedUrn(nss, {
    client_id: clientId,
  })
  await caller.edges.makeEdge({
    src: identity,
    dst: fullAuthzURN,
    tag: EDGE_AUTHORIZES,
  })
  await setPersonaReferences(
    fullAuthzURN,
    scope,
    combinedPersonaData,
    ctx.Core,
    ctx.traceSpan
  )

  const jku = generateJKU(issuer)
  const jwk = getPrivateJWK(ctx)

  const accessToken = await authorizationNode.class.generateAccessToken({
    jku,
    jwk,
    identity,
    clientId,
    expirationTime,
    issuer,
    scope,
  })

  const refreshToken = await authorizationNode.class.generateRefreshToken({
    jku,
    jwk,
    identity,
    clientId,
    issuer,
    scope,
  })

  //TODO: this will need to use a more specific getIdTokenClaimValues()
  //in the next iteration of this
  const idTokenClaims = await getClaimValues(
    identity,
    clientId,
    scope,
    ctx.Core,
    ctx.traceSpan,
    combinedPersonaData
  )
  for (const [_, scopeClaimResponse] of Object.entries(idTokenClaims)) {
    if (!scopeClaimResponse.meta.valid)
      throw new UnauthorizedError({
        message: 'Authorized data error. Re-authorization by user required',
      })
  }

  const idToken = await authorizationNode.class.generateIdToken({
    jku,
    jwk,
    identity,
    clientId,
    expirationTime,
    idTokenClaims: userClaimsFormatter(idTokenClaims, ['profile']),
    issuer,
  })

  return { accessToken, refreshToken, idToken }
}

const handleRefreshToken: ExchangeTokenMethod<
  RefreshTokenInput,
  RefreshTokenOutput
> = async ({ ctx, input }) => {
  const { refreshToken, clientId, clientSecret, issuer } = input

  const caller = router.createCaller(ctx)
  const { valid } = await caller.starbase.checkAppAuth({
    clientId,
    clientSecret,
  })

  if (!valid) throw InvalidClientCredentialsError

  const payload = jose.decodeJwt(refreshToken) as AuthorizationJWTPayload
  if (clientId != payload.aud[0]) throw MismatchClientIdError
  if (!payload.sub) throw MissingSubjectError

  const identity = payload.sub
  const nss = `${IdentityURNSpace.decode(identity)}@${clientId}`
  const urn = AuthorizationURNSpace.componentizedUrn(nss)
  const authorizationNode = initAuthorizationNodeByName(urn, ctx.Authorization)

  const jwks = getJWKS(ctx)
  await authorizationNode.class.verify(refreshToken, jwks)

  const scope = payload.scope.split(' ')
  const { expirationTime } = ACCESS_TOKEN_OPTIONS

  const jku = generateJKU(issuer)
  const jwk = getPrivateJWK(ctx)

  return {
    accessToken: await authorizationNode.class.generateAccessToken({
      jku,
      jwk,
      identity,
      clientId,
      expirationTime,
      issuer,
      scope,
    }),
  }
}
