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

import { Methods } from '@open-rpc/meta-schema'

import JSONRPC, { MethodMap } from '../../jsonrpc'

import { JWT_OPTIONS, NONCE_OPTIONS } from './constants'

import methodObjects from './methods'

import {
  Capabilities,
  Capability,
  Challenge,
  GenerateJWTOptions,
  GetNonceParams,
  GetNonceResult,
  KeyPair,
  KeyPairSerialized,
  JWTPayload,
  VerifyNonceParams,
  VerifyNonceResult,
} from './types'

export default class Auth extends JSONRPC {
  getMethodMap(): MethodMap {
    return super.getMethodMap({
      kb_getNonce: 'getNonce',
      kb_verifyNonce: 'verifyNonce',
    })
  }

  getMethodObjects(): Methods {
    return super.getMethodObjects(methodObjects)
  }

  async getNonce(params: GetNonceParams): Promise<GetNonceResult> {
    const [address, template, capabilities] = params

    if (!address) {
      this.invalidRequest('missing address')
    }

    if (!template) {
      this.invalidRequest('missing template')
    }

    if (typeof template != 'string') {
      this.invalidRequest('template is not a string')
    }

    if (!template.includes('{{nonce}}')) {
      this.invalidRequest('template missing nonce variable')
    }

    const buffer = new Uint8Array(NONCE_OPTIONS.length)
    const nonce = hexlify(crypto.getRandomValues(buffer))

    const challenge: Challenge = { nonce, template, capabilities }
    await this.core.storage.put<Challenge>(`challenge/${nonce}`, challenge)

    if (NONCE_OPTIONS.ttl && !global.MINIFLARE) {
      // The nonce is temporarily persisted to avoid memory evictions.
      setTimeout(() => {
        this.core.storage.delete(`challenge/${nonce}`)
      }, NONCE_OPTIONS.ttl * 1000)
    }

    return { nonce }
  }

  async verifyNonce(params: VerifyNonceParams): Promise<VerifyNonceResult> {
    const [nonce, signature] = params

    const challenge: Challenge = await this.core.storage.get(
      `challenge/${nonce}`
    )

    if (!challenge) {
      this.error(null, 'challenge not found')
    }

    const message = challenge.template.slice().replace(/{{nonce}}/, nonce)
    const publicKey = this.recoverPublicKey(message, signature)
    const subject = this.computeAddress(publicKey)

    if (!(await this.core.storage.get<boolean>('core/claimed'))) {
      if (!(await this.core.isOwner(subject))) {
        this.error(null, 'cannot authenticate to unclaimed core')
      }
    }

    if (!(await this.core.isOwner(subject))) {
      this.error(null, 'cannot authenticate')
    }

    await this.core.storage.delete(`challenge/${nonce}`)
    if (nonce !== challenge.nonce) {
      this.error(null, 'not matching nonce')
    }

    const capabilities: Capabilities = {}

    if (challenge.capabilities) {
      for (const capability of Object.entries(challenge.capabilities)) {
        const [path, ops] = capability as [string, string[]]
        capabilities[path] = ops.reduce<Capability>((path, op) => {
          path[op] = true
          return path
        }, {})
      }
    }

    const payload: JWTPayload = { capabilities }
    const jwt = await this.generateJWT({ payload })

    if (await this.core.isOwner(subject)) {
      await this.core.storage.put('core/claimed', true)
    }

    return jwt
  }

  async generateJWT(options: GenerateJWTOptions): Promise<string> {
    const { payload } = options
    const { alg, ttl } = JWT_OPTIONS
    const { privateKey: key }: KeyPair = await this.getJWTSigningKeyPair()

    const { id: coreId } = this.core

    _.defaults(payload, {
      aud: [coreId],
      sub: coreId,
      capabilities: {},
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

  async verifyJWT(jwt: string): Promise<jose.JWTVerifyResult> {
    const { alg } = JWT_OPTIONS
    const { publicKey: key } = await this.getJWTSigningKeyPair()
    const options = { algorithms: [alg] }
    return jose.jwtVerify(jwt, key, options)
  }

  async getJWTSigningKeyPair(): Promise<KeyPair> {
    const stored = await this.core.storage.get<KeyPairSerialized>(
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

    await this.core.storage.put('auth/jwt/signingKey', {
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
}
