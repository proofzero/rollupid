import { DOProxy } from 'do-proxy'

import * as jose from 'jose'
import { toHex } from 'viem'

import { InternalServerError, RollupError } from '@proofzero/errors'
import { NodeMethodReturnValue } from '@proofzero/types/node'

import { IdentityURN } from '@proofzero/urns/identity'
import type { Scope } from '@proofzero/types/authorization'

import { JWT_OPTIONS } from '../constants'

import {
  ExpiredTokenError,
  InvalidTokenError,
  TokenClaimValidationFailedError,
  TokenVerificationFailedError,
} from '../errors'

import { ClaimValueType } from '@proofzero/security/persona'

type TokenStore = DurableObjectStorage | DurableObjectTransaction

type Token = {
  jwt: string
  scope: Scope
}

type TokenMap = Record<string, Token>
type TokenIndex = Array<string>
type TokenState = {
  tokenMap: TokenMap
  tokenIndex: TokenIndex
}

type AccessTokenOptions = {
  jku: string
  jwk: jose.JWK
  identity: IdentityURN
  clientId: string
  expirationTime: string
  issuer: string
  scope: Scope
}

type RefreshTokenOptions = {
  jku: string
  jwk: jose.JWK
  identity: IdentityURN
  clientId: string
  issuer: string
  scope: Scope
}

type IdTokenOptions = {
  jku: string
  jwk: jose.JWK
  identity: IdentityURN
  clientId: string
  expirationTime: string
  issuer: string
  idTokenClaims: Record<string, ClaimValueType>
}

export default class Authorization extends DOProxy {
  declare state: DurableObjectState

  constructor(state: DurableObjectState) {
    super(state)
    this.state = state
  }

  async getTokenState(store?: TokenStore): Promise<TokenState> {
    if (!store) {
      store = this.state.storage
    }

    return {
      tokenMap: (await store.get<TokenMap>('tokenMap')) || {},
      tokenIndex: (await store.get<TokenIndex>('tokenIndex')) || [],
    }
  }

  async generateAccessToken(options: AccessTokenOptions): Promise<string> {
    const { jku, jwk, identity, clientId, expirationTime, issuer, scope } =
      options
    const { alg, kid } = jwk
    if (!alg) throw new InternalServerError({ message: 'missing alg in jwk' })

    const buffer = new Uint8Array(JWT_OPTIONS.jti.length)
    const jti = toHex(crypto.getRandomValues(buffer))

    //Need to convert scope array to space-delimited string, per spec
    return new jose.SignJWT({ scope: scope.join(' ') })
      .setProtectedHeader({ alg, jku, kid, typ: 'JWT' })
      .setExpirationTime(expirationTime)
      .setAudience([clientId])
      .setIssuedAt()
      .setIssuer(issuer)
      .setJti(jti)
      .setSubject(identity)
      .sign(await jose.importJWK(jwk))
  }

  async generateRefreshToken(options: RefreshTokenOptions): Promise<string> {
    const { jku, jwk, identity, clientId, issuer, scope } = options
    const { alg, kid } = jwk
    if (!alg) throw new InternalServerError({ message: 'missing alg in jwk' })

    const buffer = new Uint8Array(JWT_OPTIONS.jti.length)
    const jti = toHex(crypto.getRandomValues(buffer))

    const jwt = await new jose.SignJWT({ scope: scope.join(' ') })
      .setProtectedHeader({ alg, jku, kid, typ: 'JWT' })
      .setAudience([clientId])
      .setIssuedAt()
      .setIssuer(issuer)
      .setJti(jti)
      .setSubject(identity)
      .sign(await jose.importJWK(jwk))

    await this.store(jti, jwt, scope)
    return jwt
  }

  async generateIdToken(options: IdTokenOptions): Promise<string> {
    const {
      jku,
      jwk,
      identity,
      clientId,
      expirationTime,
      idTokenClaims,
      issuer,
    } = options
    const { alg, kid } = jwk
    if (!alg) throw new InternalServerError({ message: 'missing alg in jwk' })
    return new jose.SignJWT(idTokenClaims)
      .setProtectedHeader({ alg, jku, kid, typ: 'JWT' })
      .setExpirationTime(expirationTime)
      .setAudience([clientId])
      .setIssuedAt()
      .setIssuer(issuer)
      .setSubject(identity)
      .sign(await jose.importJWK(jwk))
  }

  async store(jti: string, jwt: string, scope: Scope): Promise<void> {
    await this.state.storage.transaction(async (txn) => {
      const { tokenMap, tokenIndex } = await this.getTokenState(txn)
      if (tokenMap[jti]) {
        throw new Error('refresh token id exists')
      }

      tokenMap[jti] = { jwt, scope }
      tokenIndex.push(jti)

      const put = async (
        tokenMap: TokenMap,
        tokenIndex: TokenIndex
      ): Promise<void> => {
        try {
          await txn.put({ tokenMap, tokenIndex })
        } catch (error) {
          if (error instanceof RangeError) {
            const expungeTokenId = tokenIndex.shift()
            if (expungeTokenId) {
              delete tokenMap[expungeTokenId]
            }
            await put(tokenMap, tokenIndex)
          }
        }
      }

      await put(tokenMap, tokenIndex)
    })
  }

  async verify(
    jwt: string,
    jwks: jose.JSONWebKeySet,
    options: jose.JWTVerifyOptions = {}
  ): Promise<NodeMethodReturnValue<jose.JWTVerifyResult, RollupError>> {
    const { kid } = jose.decodeProtectedHeader(jwt)
    if (kid) {
      try {
        return {
          value: await jose.jwtVerify(
            jwt,
            jose.createLocalJWKSet(jwks),
            options
          ),
        }
      } catch (error) {
        if (error instanceof jose.errors.JWTClaimValidationFailed)
          return { error: TokenClaimValidationFailedError }
        else if (error instanceof jose.errors.JWTExpired)
          return { error: ExpiredTokenError }
        else if (error instanceof jose.errors.JWTInvalid)
          return { error: InvalidTokenError }
        else return { error: TokenVerificationFailedError }
      }
    } else {
      // TODO: Initial signing keys didn't have `kid` property.
      // Tokens signed by these keys won't have `kid` property in the header.
      // This case will be invalid after 90 days.
      const local = await this.getJWTPublicKey()
      if (local) {
        const { alg } = JWT_OPTIONS
        const key = await jose.importJWK(local, alg)
        try {
          return { value: await jose.jwtVerify(jwt, key, options) }
        } catch (error) {
          if (error instanceof jose.errors.JWTClaimValidationFailed)
            return { error: TokenClaimValidationFailedError }
          else if (error instanceof jose.errors.JWTExpired)
            return { error: ExpiredTokenError }
          else if (error instanceof jose.errors.JWTInvalid)
            return { error: InvalidTokenError }
          else return { error: TokenVerificationFailedError }
        }
      }
    }

    return { error: TokenVerificationFailedError }
  }

  async revoke(
    token: string,
    jwks: jose.JSONWebKeySet,
    options: jose.JWTVerifyOptions = {}
  ): Promise<void> {
    const { value, error } = await this.verify(token, jwks, options)
    if (error) throw error
    const { payload } = value
    await this.state.storage.transaction(async (txn) => {
      const { jti } = payload
      if (!jti) {
        throw new Error('missing token id')
      }

      const { tokenMap, tokenIndex } = await this.getTokenState(txn)
      delete tokenMap[jti]

      const index = tokenIndex.findIndex((jti) => jti == payload.jti)
      if (index > -1) {
        tokenIndex.splice(index, 1)
      }

      await txn.put({ tokenMap, tokenIndex })
    })
  }

  async deleteAll(): Promise<void> {
    await this.state.storage.deleteAll()
  }

  async getJWTPublicKey(): Promise<jose.JWK | undefined> {
    const { alg } = JWT_OPTIONS
    const { storage } = this.state

    const stored = await storage.get<{ publicKey: jose.JWK }>('signingKey')
    if (stored) {
      return { alg, ...stored.publicKey }
    }
  }
}
