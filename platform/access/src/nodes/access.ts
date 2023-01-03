import {
  exportJWK,
  generateKeyPair,
  jwtVerify,
  importJWK,
  SignJWT,
  JWTVerifyResult,
} from 'jose'
import { createDurable } from 'itty-durable'

import { hexlify } from '@ethersproject/bytes'
import { randomBytes } from '@ethersproject/random'

import { JWT_OPTIONS } from '../constants'

import { Environment, KeyPair, KeyPairSerialized } from '../types'
import { Node } from '@kubelt/types'
import { AccountURN } from '@kubelt/urns/account'

export default class Authorization extends createDurable({
  autoReturn: true,
  autoPersist: false,
}) {
  declare state: Node.IttyDurableObjectState<Environment>

  async generate(params: {
    iss?: string
    account: AccountURN
    clientId: string
    scope: any
  }): Promise<{
    accessToken: string
    refreshToken: string
  }> {
    let [account, clientId, scope] = await Promise.all([
      this.state.storage.get<AccountURN>('account'),
      this.state.storage.get<string>('clientId'),
      this.state.storage.get<any>('scope'),
    ])

    account ||= params.account
    clientId ||= params.clientId
    scope ||= params.scope
    return generate(params.iss, account, clientId, scope, this.state.storage)
  }

  async verify(token: string): Promise<JWTVerifyResult> {
    return verify(token, this.state.storage)
  }

  async refresh(
    iss: string,
    token: string
  ): Promise<{
    accessToken: string
    refreshToken: string
  }> {
    const [account, clientId, scope] = await Promise.all([
      this.state.storage.get<AccountURN>('account'),
      this.state.storage.get<string>('clientId'),
      this.state.storage.get<any>('scope'),
    ])
    if (!account || !clientId || !scope) throw new Error('Invalid token')
    await verify(token, this.state.storage)
    return generate(iss, account, clientId, scope, this.state.storage)
  }
}

const generate = async (
  objectId: string | undefined,
  account: AccountURN,
  clientId: string,
  scope: any,
  storage: DurableObjectStorage
) => {
  await Promise.all([
    storage.put('account', account),
    storage.put('clientId', clientId),
    storage.put('scope', scope),
  ])

  const { alg, ttl } = JWT_OPTIONS
  const { privateKey: key } = await getJWTSigningKeyPair(storage)

  const accessToken = await new SignJWT({ client_id: clientId, scope })
    .setProtectedHeader({ alg })
    .setExpirationTime(Math.floor((Date.now() + ttl * 1000) / 1000))
    .setIssuedAt()
    .setIssuer(objectId || '')
    .setJti(hexlify(randomBytes(JWT_OPTIONS.jti.length)))
    .setSubject(account)
    .sign(key)

  const refreshToken = await new SignJWT({})
    .setProtectedHeader({ alg })
    .setExpirationTime(Math.floor((Date.now() + ttl * 1000) / 1000))
    .setIssuedAt()
    .setIssuer(objectId || '')
    .setSubject(account)
    .sign(key)

  return {
    accessToken,
    refreshToken,
  }
}

const verify = async (token: string, storage: DurableObjectStorage) => {
  const { alg } = JWT_OPTIONS
  const { publicKey: key } = await getJWTSigningKeyPair(storage)
  const options = { algorithms: [alg] }
  return jwtVerify(token, key, options)
}

const getJWTSigningKeyPair = async (
  storage: DurableObjectStorage
): Promise<KeyPair> => {
  const { alg } = JWT_OPTIONS
  const stored: KeyPairSerialized | undefined = await storage.get('signingKey')
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
