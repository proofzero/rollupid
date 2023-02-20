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

import {
  ACCESS_TOKEN_OPTIONS,
  JWT_OPTIONS,
  REFRESH_TOKEN_OPTIONS,
} from '../constants'

import type {
  ExchangeTokenResult,
  IdTokenProfile,
  KeyPair,
  KeyPairSerialized,
} from '../types'

type Token = {
  jwt: string
  scope: Scope
}

type Tokens = Record<string, Token>

export default class Access extends DOProxy {
  declare state: DurableObjectState

  constructor(state: DurableObjectState) {
    super(state)
    this.state = state
  }

  async generate(
    account: AccountURN,
    clientId: string,
    scope: Scope,
    idTokenProfile?: IdTokenProfile
  ): Promise<ExchangeTokenResult> {
    const { storage } = this.state
    await storage.put({ account, clientId })

    const { alg } = JWT_OPTIONS
    const { privateKey: key } = await this.getJWTSigningKeyPair()

    const issuedAt = Date.now()
    const accessTokenId = hexlify(randomBytes(JWT_OPTIONS.jti.length))
    const refreshTokenId = hexlify(randomBytes(JWT_OPTIONS.jti.length))

    const accessToken = await new SignJWT({ account, clientId, scope })
      .setProtectedHeader({ alg })
      .setExpirationTime(ACCESS_TOKEN_OPTIONS.expirationTime)
      .setAudience([clientId])
      .setIssuedAt(issuedAt)
      .setJti(accessTokenId)
      .setSubject(account)
      .sign(key)

    const refreshToken = await new SignJWT({ account, clientId, scope })
      .setProtectedHeader({ alg })
      .setExpirationTime(REFRESH_TOKEN_OPTIONS.expirationTime)
      .setAudience([clientId])
      .setIssuedAt(issuedAt)
      .setJti(refreshTokenId)
      .setSubject(account)
      .sign(key)

    await storage.transaction(async () => {
      const tokens = (await this.state.storage.get<Tokens>('tokens')) || {}

      if (tokens[accessTokenId]) {
        throw new Error('access token id exists')
      }

      if (tokens[refreshTokenId]) {
        throw new Error('refresh token id exists')
      }

      const put = async (tokens: Tokens): Promise<void> => {
        tokens[accessTokenId] = {
          jwt: accessToken,
          scope,
        }

        tokens[refreshTokenId] = {
          jwt: refreshToken,
          scope,
        }

        await storage.put({ tokens })
      }

      try {
        await put(tokens)
      } catch (error) {
        if (error instanceof RangeError) {
          const pruned = await this.pruneTokens(tokens)
          await put(pruned)
        }
      }
    })

    let idToken: string | undefined
    if (idTokenProfile) {
      idToken = await new SignJWT(idTokenProfile)
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
    const result = await jwtVerify(token, key, options)

    if (!result.payload.jti) {
      throw new Error('missing token id')
    }

    const tokens = (await this.state.storage.get<Tokens>('tokens')) || {}
    if (!tokens[result.payload.jti]) {
      throw new Error('token not found')
    }

    return result
  }

  async refresh(token: string): Promise<ExchangeTokenResult> {
    const { payload } = await this.verify(token)
    const {
      sub: account,
      aud: [clientId],
      scope,
    } = payload as AccessJWTPayload

    await this.state.storage.transaction(async (txn) => {
      if (!payload.jti) {
        throw new Error('missing JTI')
      }
      const tokens = (await txn.get<Tokens>('tokens')) || {}
      delete tokens[payload.jti]
      await txn.put({ tokens })
    })

    return this.generate(account, clientId, scope)
  }

  async revoke(token: string): Promise<void> {
    const { storage } = this.state

    await storage.transaction(async () => {
      const { payload } = await this.verify(token)
      const { jti } = payload
      if (!jti) {
        throw new Error('missing token id')
      }
      const tokens = (await this.state.storage.get<Tokens>('tokens')) || {}
      delete tokens[jti]
      await storage.put({ tokens })
    })
  }

  async pruneTokens(tokens: Tokens): Promise<Tokens> {
    const { alg } = JWT_OPTIONS
    const { publicKey: key } = await this.getJWTSigningKeyPair()
    const options = { algorithms: [alg] }

    const active = async.reduce<string, Tokens>(
      Object.keys(tokens),
      {},
      async (state: Tokens | undefined, tokenId: string) => {
        if (!state) {
          throw new Error('missing tokens')
        }

        const { jwt } = tokens[tokenId]
        try {
          await jwtVerify(jwt, key, options)
          state[tokenId] = tokens[tokenId]
          return state
        } catch (error) {
          return state
        }
      }
    )

    return active
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
