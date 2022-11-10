import * as jose from 'jose'
import { hexlify } from '@ethersproject/bytes'
import { randomBytes } from '@ethersproject/random'

import { DurableObject } from '@kubelt/worker-commons'

import { JWT_OPTIONS } from './constants'

import {
  AccessApi as Api,
  AccessParameters,
  Environment,
  GenerateResult,
  KeyPair,
  KeyPairSerialized,
  RefreshResult,
  Scope,
} from './types'

export default class Access extends DurableObject<Environment, Api> {
  methods(): Api {
    return {
      generate: this.generate.bind(this),
      verify: this.verify.bind(this),
      refresh: this.refresh.bind(this),
    }
  }

  async generate(
    coreId: string,
    clientId: string,
    scope: Scope
  ): Promise<GenerateResult> {
    const { alg, ttl } = JWT_OPTIONS
    const { privateKey: key } = await this.getJWTSigningKeyPair()
    await this.storage.put<AccessParameters>('params', {
      coreId,
      clientId,
      scope,
    })

    const objectId = this.state.id.toString()

    const accessToken = await new jose.SignJWT({ client_id: clientId, scope })
      .setProtectedHeader({ alg })
      .setAudience(coreId)
      .setExpirationTime(Math.floor((Date.now() + ttl * 1000) / 1000))
      .setIssuedAt()
      .setIssuer(objectId)
      .setJti(hexlify(randomBytes(JWT_OPTIONS.jti.length)))
      .setSubject(coreId)
      .sign(key)

    const refreshToken = await new jose.SignJWT({})
      .setProtectedHeader({ alg })
      .setExpirationTime(Math.floor((Date.now() + ttl * 1000) / 1000))
      .setIssuedAt()
      .setIssuer(objectId)
      .setSubject(coreId)
      .sign(key)

    return {
      accessToken,
      refreshToken,
    }
  }

  async verify(token: string): Promise<jose.JWTVerifyResult> {
    const { alg } = JWT_OPTIONS
    const { publicKey: key } = await this.getJWTSigningKeyPair()
    const options = { algorithms: [alg] }
    return jose.jwtVerify(token, key, options)
  }

  async refresh(token: string): Promise<RefreshResult> {
    await this.verify(token)
    const params = await this.storage.get<AccessParameters>('params')
    if (!params) {
      throw 'missing access parameters'
    }

    const { coreId, clientId, scope } = params
    return this.generate(coreId, clientId, scope)
  }

  async getJWTSigningKeyPair(): Promise<KeyPair> {
    const { alg } = JWT_OPTIONS
    const stored = await this.storage.get<KeyPairSerialized>('signingKey')
    if (stored) {
      return {
        publicKey: await jose.importJWK(stored.publicKey, alg),
        privateKey: await jose.importJWK(stored.privateKey, alg),
      }
    }

    const generated: KeyPair = await jose.generateKeyPair(alg, {
      extractable: true,
    })
    await this.storage.put('signingKey', {
      publicKey: await jose.exportJWK(generated.publicKey),
      privateKey: await jose.exportJWK(generated.privateKey),
    })

    return generated
  }
}
