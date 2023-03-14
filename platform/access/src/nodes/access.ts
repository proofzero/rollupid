import { DOProxy } from 'do-proxy'

import * as jose from 'jose'

import { hexlify } from '@ethersproject/bytes'
import { randomBytes } from '@ethersproject/random'

import { AccountURN } from '@proofzero/urns/account'
import type { Scope } from '@proofzero/types/access'

import { JWT_OPTIONS } from '../constants'

import type { IdTokenProfile, KeyPair, KeyPairSerialized } from '../types'

import {
  ExpiredTokenError,
  InvalidTokenError,
  TokenClaimValidationFailedError,
  TokenVerificationFailedError,
} from '../errors'

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
  account: AccountURN
  clientId: string
  expirationTime: string
  issuer: string
  scope: Scope
}

type RefreshTokenOptions = {
  account: AccountURN
  clientId: string
  issuer: string
  scope: Scope
}

type IdTokenOptions = {
  account: AccountURN
  clientId: string
  expirationTime: string
  issuer: string
  idTokenProfile: IdTokenProfile
}

export default class Access extends DOProxy {
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
    const { account, clientId, expirationTime, issuer, scope } = options
    const { alg } = JWT_OPTIONS
    const jti = hexlify(randomBytes(JWT_OPTIONS.jti.length))
    const { privateKey: key } = await this.getJWTSigningKeyPair()
    return new jose.SignJWT({ scope })
      .setProtectedHeader({ alg })
      .setExpirationTime(expirationTime)
      .setAudience([clientId])
      .setIssuedAt()
      .setIssuer(issuer)
      .setJti(jti)
      .setSubject(account)
      .sign(key)
  }

  async generateRefreshToken(options: RefreshTokenOptions): Promise<string> {
    const { account, clientId, issuer, scope } = options
    const { alg } = JWT_OPTIONS
    const jti = hexlify(randomBytes(JWT_OPTIONS.jti.length))
    const { privateKey: key } = await this.getJWTSigningKeyPair()
    const jwt = await new jose.SignJWT({ scope })
      .setProtectedHeader({ alg })
      .setAudience([clientId])
      .setIssuedAt()
      .setIssuer(issuer)
      .setJti(jti)
      .setSubject(account)
      .sign(key)

    await this.store(jti, jwt, scope)
    return jwt
  }

  async generateIdToken(options: IdTokenOptions): Promise<string> {
    const { account, clientId, expirationTime, idTokenProfile, issuer } =
      options
    const { alg } = JWT_OPTIONS
    const { privateKey: key } = await this.getJWTSigningKeyPair()
    return new jose.SignJWT(idTokenProfile)
      .setProtectedHeader({ alg })
      .setExpirationTime(expirationTime)
      .setAudience([clientId])
      .setIssuedAt()
      .setIssuer(issuer)
      .setSubject(account)
      .sign(key)
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

  async verify(token: string): Promise<jose.JWTVerifyResult> {
    const { alg } = JWT_OPTIONS
    const { publicKey: key } = await this.getJWTSigningKeyPair()
    const options = { algorithms: [alg] }
    try {
      return await jose.jwtVerify(token, key, options)
    } catch (error) {
      if (error instanceof jose.errors.JWTClaimValidationFailed)
        throw TokenClaimValidationFailedError
      else if (error instanceof jose.errors.JWTExpired) throw ExpiredTokenError
      else if (error instanceof jose.errors.JWTInvalid) throw InvalidTokenError
      else throw TokenVerificationFailedError
    }
  }

  async revoke(token: string): Promise<void> {
    const { payload } = await this.verify(token)
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

  async getJWTSigningKeyPair(): Promise<KeyPair> {
    const { alg } = JWT_OPTIONS
    const { storage } = this.state

    const stored = await storage.get<KeyPairSerialized>('signingKey')
    if (stored) {
      return {
        publicKey: await jose.importJWK(stored.publicKey, alg),
        privateKey: await jose.importJWK(stored.privateKey, alg),
      }
    }

    const generated: KeyPair = await jose.generateKeyPair(alg, {
      extractable: true,
    })

    await storage.put('signingKey', {
      publicKey: await jose.exportJWK(generated.publicKey),
      privateKey: await jose.exportJWK(generated.privateKey),
    })

    return generated
  }
}
