import {
  exportJWK,
  generateKeyPair,
  jwtVerify,
  importJWK,
  SignJWT,
  JWTVerifyResult,
} from 'jose'
import { DOProxy } from 'do-proxy'

import { hexlify } from '@ethersproject/bytes'
import { randomBytes } from '@ethersproject/random'

import { JWT_OPTIONS } from '../constants'

import {
  ExchangeTokenResult,
  KeyPair,
  KeyPairSerialized,
  SessionDetails,
} from '../types.ts'
import { AccountURN } from '@kubelt/urns/account'

export default class Access extends DOProxy {
  declare state: DurableObjectState

  constructor(state: DurableObjectState) {
    super(state)
    this.state = state
  }

  async generate(params: {
    iss: string
    account: AccountURN
    clientId: string
    scope: any
  }): Promise<ExchangeTokenResult> {
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

  async refresh(iss: string, token: string): Promise<ExchangeTokenResult> {
    const [account, clientId, scope] = await Promise.all([
      this.state.storage.get<AccountURN>('account'),
      this.state.storage.get<string>('clientId'),
      this.state.storage.get<any>('scope'),
    ])
    if (!account || !clientId || !scope) throw new Error('Invalid token')
    await verify(token, this.state.storage)
    // NB: this reschedules the alarm for the new expiry time.
    return generate(iss, account, clientId, scope, this.state.storage)
  }

  async revoke(): Promise<boolean> {
    await this.state.storage.deleteAll()
    return true
  }

  async status(): Promise<SessionDetails> {
    const expired = await this.state.storage.get<boolean>('expired')
    const expiryTime = await this.state.storage.get<number>('expiryTime')
    let expiry
    if (expiryTime) {
      expiry = new Date(expiryTime).toUTCString()
    }
    const creation = await this.state.storage.get<string>('creationTime')
    return { expired, creation, expiry }
  }

  async alarm(): Promise<void> {
    await this.state.storage.put('expired', true)
  }
} // Access

const generate = async (
  objectId: string,
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

  // We only set the creation time once, not when refreshing the token /
  // session.
  const creationTime = storage.get('creationTime')
  if (!creationTime) {
    await storage.put('creationTime', Date.now())
  }

  const expired = storage.get('expired')
  if (expired === undefined) {
    await storage.put('expired', false)
  }

  const { alg, ttl } = JWT_OPTIONS
  const { privateKey: key } = await getJWTSigningKeyPair(storage)

  // We store expiry as milliseconds since epoch.
  const expiryTimeMs = Date.now() + ttl
  await storage.put('expiryTime', expiryTimeMs)

  // JWT expiry time is in *seconds* since the epoch.
  const expirationTime = Math.floor((expiryTimeMs * 1000) / 1000)

  const accessToken = await new SignJWT({ client_id: clientId, scope })
    .setProtectedHeader({ alg })
    .setExpirationTime(expirationTime)
    .setIssuedAt()
    .setIssuer(objectId)
    .setJti(hexlify(randomBytes(JWT_OPTIONS.jti.length)))
    .setSubject(account)
    .sign(key)

  const refreshToken = await new SignJWT({})
    .setProtectedHeader({ alg })
    .setExpirationTime(expirationTime)
    .setIssuedAt()
    .setIssuer(objectId)
    .setSubject(account)
    .sign(key)

  // Schedule an alarm that executes after this session expires in order
  // to delete the session state and perform other cleanup. Note that
  // refreshing the JWT that represents the session will result in the
  // alarm being rescheduled for after the new expiry time.
  const ms = (ttl + 1) * 1000
  // Accepts Date or ms since epoch.
  storage.setAlarm(ms)

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
