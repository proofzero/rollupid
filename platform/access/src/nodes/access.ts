import async from 'async'
import { DOProxy } from 'do-proxy'

import {
  exportJWK,
  generateKeyPair,
  jwtVerify,
  importJWK,
  SignJWT,
  JWTVerifyResult,
} from 'jose'

import { hexlify } from '@ethersproject/bytes'
import { randomBytes } from '@ethersproject/random'

import { AccountURN } from '@kubelt/urns/account'
import type { AccessJWTPayload, Scope } from '@kubelt/types/access'

import { ACCESS_TOKEN_OPTIONS, JWT_OPTIONS } from '../constants'

import type {
  ExchangeTokenResult,
  IdTokenProfile,
  KeyPair,
  KeyPairSerialized,
} from '../types'

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

export default class Access extends DOProxy {
  declare state: DurableObjectState

  constructor(state: DurableObjectState) {
    super(state)
    this.state = state
  }

  async getTokenState(store: TokenStore): Promise<TokenState> {
    return {
      tokenMap: (await store.get<TokenMap>('tokenMap')) || {},
      tokenIndex: (await store.get<TokenIndex>('tokenIndex')) || [],
    }
  }

  async generate(
    account: AccountURN,
    clientId: string,
    scope: Scope,
    options?: {
      idTokenProfile?: IdTokenProfile
      accessExpiry?: string
    }
  ): Promise<ExchangeTokenResult> {
    const { storage } = this.state
    await storage.put({ account, clientId })

    const { alg } = JWT_OPTIONS
    const { privateKey: key } = await this.getJWTSigningKeyPair()

    const issuedAt = Date.now()
    const accessTokenId = hexlify(randomBytes(JWT_OPTIONS.jti.length))
    const refreshTokenId = hexlify(randomBytes(JWT_OPTIONS.jti.length))

    const accessToken = await new SignJWT({ scope })
      .setProtectedHeader({ alg })
      .setExpirationTime(
        options?.accessExpiry || ACCESS_TOKEN_OPTIONS.expirationTime
      )
      .setAudience([clientId])
      .setIssuedAt(issuedAt)
      .setJti(accessTokenId)
      .setSubject(account)
      .sign(key)

    const refreshToken = await new SignJWT({ scope })
      .setProtectedHeader({ alg })
      .setAudience([clientId])
      .setIssuedAt(issuedAt)
      .setJti(refreshTokenId)
      .setSubject(account)
      .sign(key)

    await storage.transaction(async (txn) => {
      const { tokenMap, tokenIndex } = await this.getTokenState(txn)

      if (tokenMap[refreshTokenId]) {
        throw new Error('refresh token id exists')
      }

      tokenMap[refreshTokenId] = {
        jwt: refreshToken,
        scope,
      }

      tokenIndex.push(refreshTokenId)

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

    let idToken: string | undefined
    if (options?.idTokenProfile) {
      idToken = await new SignJWT(options.idTokenProfile)
        .setProtectedHeader({ alg })
        .setExpirationTime(ACCESS_TOKEN_OPTIONS.expirationTime)
        .setAudience([clientId])
        .setIssuedAt(issuedAt)
        .setIssuer(accessTokenId)
        .sign(key)
    }

    return {
      accessToken,
      refreshToken,
      idToken,
    }
  }

  async verify(token: string): Promise<JWTVerifyResult> {
    const { alg } = JWT_OPTIONS
    const { publicKey: key } = await this.getJWTSigningKeyPair()
    const options = { algorithms: [alg] }
    return jwtVerify(token, key, options)
  }

  async refresh(token: string): Promise<ExchangeTokenResult> {
    const { payload } = await this.verify(token)
    const {
      sub: account,
      aud: [clientId],
      scope,
    } = payload as AccessJWTPayload
    return this.generate(account, clientId, scope)
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

  async getJWTSigningKeyPair(): Promise<KeyPair> {
    const { alg } = JWT_OPTIONS
    const { storage } = this.state

    const stored = await storage.get<KeyPairSerialized>('signingKey')
    if (stored) {
      return {
        publicKey: await importJWK(stored.publicKey, alg),
        privateKey: await importJWK(stored.privateKey, alg),
      }
    }

    const generated: KeyPair = await generateKeyPair(alg, {
      extractable: true,
    })

    await storage.put('signingKey', {
      publicKey: await exportJWK(generated.publicKey),
      privateKey: await exportJWK(generated.privateKey),
    })

    return generated
  }
}
