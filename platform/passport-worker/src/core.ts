/*
   Zero Knowledge Authentication

   This module implements zero-knowledge proof for authentication.
 */

import _ from 'lodash'
import * as jose from 'jose'

import { BytesLike, hexlify } from '@ethersproject/bytes'
import { keccak256 } from '@ethersproject/keccak256'
import { recoverPublicKey } from '@ethersproject/signing-key'
import { computeAddress } from '@ethersproject/transactions'

import { DurableObject } from '@kubelt/worker-commons'

import { JWT_OPTIONS, NONCE_OPTIONS } from './constants'
import {
  Api,
  Challenge,
  Environment,
  GenerateJWTOptions,
  KeyPair,
  KeyPairSerialized,
} from './types'

export default class Core extends DurableObject<Environment, Api> {
  methods(proxy: object): Api {
    return {
      kb_getNonce: this.getNonce.bind(proxy),
      kb_verifyNonce: this.verifyNonce.bind(proxy),
      kb_isAuthenticated: this.isAuthenticated.bind(proxy),
    }
  }

  async getNonce(address: string, template: string): Promise<string> {
    if (!address) {
      throw 'missing address'
    }

    if (!template) {
      throw 'missing template'
    }

    if (typeof template != 'string') {
      throw 'template is not a string'
    }

    if (!template.includes('{{nonce}}')) {
      throw 'template missing nonce variable'
    }

    const buffer = new Uint8Array(NONCE_OPTIONS.length)
    const nonce = hexlify(crypto.getRandomValues(buffer))

    const challenge: Challenge = { address, nonce, template }
    await this.storage.put(`challenge/${nonce}`, challenge)

    if (NONCE_OPTIONS.ttl) {
      // The nonce is temporarily persisted to avoid memory evictions.
      setTimeout(() => {
        this.storage.delete(`challenge/${nonce}`)
      }, NONCE_OPTIONS.ttl * 1000)
    }

    return nonce
  }

  async verifyNonce(nonce: string, signature: string): Promise<string> {
    const challenge = await this.storage.get<Challenge>(`challenge/${nonce}`)

    if (!challenge) {
      throw 'challenge not found'
    }

    await this.storage.delete(`challenge/${nonce}`)

    const message = challenge.template.slice().replace(/{{nonce}}/, nonce)
    const publicKey = this.recoverPublicKey(message, signature)
    const subject = this.computeAddress(publicKey)

    if (subject != challenge.address) {
      throw 'not matching address'
    }

    if (nonce !== challenge.nonce) {
      throw 'not matching nonce'
    }

    const payload: jose.JWTPayload = {}
    const jwt = await this.generateJWT({ payload })

    return jwt
  }

  async generateJWT(options: GenerateJWTOptions): Promise<string> {
    const { payload } = options
    const { alg, ttl } = JWT_OPTIONS
    const { privateKey: key }: KeyPair = await this.getJWTSigningKeyPair()

    const { id: coreId } = this

    _.defaults(payload, {
      aud: [coreId],
      sub: coreId,
    })

    _.assign(payload, {
      iss: coreId,
    })

    return new jose.SignJWT(payload)
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime(Math.floor((Date.now() + ttl * 1000) / 1000))
      .sign(key)
  }

  async verifyJWT(token: string): Promise<jose.JWTVerifyResult> {
    const { alg } = JWT_OPTIONS
    const { publicKey: key } = await this.getJWTSigningKeyPair()
    const options = { algorithms: [alg] }
    return jose.jwtVerify(token, key, options)
  }

  async getJWTSigningKeyPair(): Promise<KeyPair> {
    const stored = await this.storage.get<KeyPairSerialized>(
      'auth/jwt/signingKey'
    )

    const { alg } = JWT_OPTIONS

    if (stored) {
      return {
        publicKey: await jose.importJWK(stored.publicKey, alg),
        privateKey: await jose.importJWK(stored.privateKey, alg),
      }
    }

    const generated: KeyPair = await jose.generateKeyPair(alg, {
      extractable: true,
    })

    await this.storage.put('auth/jwt/signingKey', {
      publicKey: await jose.exportJWK(generated.publicKey),
      privateKey: await jose.exportJWK(generated.privateKey),
    })

    return generated
  }

  recoverPublicKey(message: string, signature: string): string {
    const prefix = `\u0019Ethereum Signed Message:\n${message.length}`
    const encoder = new TextEncoder()
    const bytes = encoder.encode(`${prefix}${message}`)
    const digest = keccak256(bytes)
    return recoverPublicKey(digest, signature)
  }

  computeAddress(publicKey: BytesLike): string {
    return computeAddress(publicKey)
  }

  async isAuthenticated(): Promise<boolean> {
    const { authentication: token } = this.context || {}
    if (!token) {
      return false
    }
    try {
      await this.verifyJWT(token)
      return true
    } catch (err) {
      return false
    }
  }
}
