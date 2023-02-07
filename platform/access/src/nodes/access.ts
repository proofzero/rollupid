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
  IdTokenProfile,
  KeyPair,
  KeyPairSerialized,
  SessionDetails,
} from '../types'
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
    idTokenProfile?: IdTokenProfile
  }): Promise<ExchangeTokenResult> {
    let [account, clientId, scope] = await Promise.all([
      this.state.storage.get<AccountURN>('account'),
      this.state.storage.get<string>('clientId'),
      this.state.storage.get<any>('scope'),
    ])

    account ||= params.account
    clientId ||= params.clientId
    scope ||= params.scope
    const idTokenProfile = params.idTokenProfile

    return generate(
      params.iss,
      account,
      clientId,
      scope,
      this.state.storage,
      idTokenProfile
    )
  }

  async verify(token: string): Promise<JWTVerifyResult> {
    return verify(token, this.state.storage)
  }

  async refresh(iss: string, token: string): Promise<ExchangeTokenResult> {
    const account = await this.state.storage.get<AccountURN>('account')
    const clientId = await this.state.storage.get<string>('clientId')
    const scope = await this.state.storage.get<any>('scope')

    if (!account || !clientId) {
      throw new Error('Invalid token')
    }
    await verify(token, this.state.storage)

    const { expired } = await this.refreshStatus()
    if (expired) throw new Error('Refresh token expired')
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
    return { expired, creation, expiry, expiryTime }
  }

  async refreshStatus(): Promise<SessionDetails> {
    const expired = await this.state.storage.get<boolean>('refreshExpired')
    const expiryTime = await this.state.storage.get<number>('refreshTime')
    let expiry
    if (expiryTime) {
      expiry = new Date(expiryTime).toUTCString()
    }
    const creation = await this.state.storage.get<string>('creationTime')
    return { expired, creation, expiry, expiryTime }
  }

  async alarm(): Promise<void> {
    const { expired, expiryTime } = await this.status()
    if (!expired && expiryTime && expiryTime < Date.now()) {
      await this.state.storage.put('expired', true)
    }
    const { expired: refreshExpired, expiryTime: refreshExpiryTime } =
      await this.refreshStatus()
    if (
      !refreshExpired &&
      refreshExpiryTime &&
      refreshExpiryTime < Date.now()
    ) {
      await this.state.storage.put('refreshExpired', true)
      // TODO: remove own edge if refresh token is also expired
      // since these are epxected to expire we don't want to bloat the edges database
      // or DO storage
    }
  }
} // Access

const generate = async (
  objectId: string,
  account: AccountURN,
  clientId: string,
  scope: any,
  storage: DurableObjectStorage,
  idTokenProfile?: IdTokenProfile
) => {
  await storage.put({
    account,
    clientId,
    scope,
  })

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

  const { alg, ttl, refreshTtl } = JWT_OPTIONS
  const { privateKey: key } = await getJWTSigningKeyPair(storage)

  // We store expiry as milliseconds since epoch.
  const expiryTimeMs = Date.now() + ttl
  const refreshTimeMs = Date.now() + refreshTtl
  await storage.put('expiryTime', expiryTimeMs)
  await storage.put('refreshTime', refreshTimeMs)

  // JWT expiry time is in *seconds* since the epoch.
  const expirationTime = Math.floor((expiryTimeMs * 1000) / 1000)

  const currentTime = Date.now()
  const accessToken = await new SignJWT({ client_id: clientId, scope })
    .setProtectedHeader({ alg })
    .setExpirationTime(expirationTime)
    .setIssuedAt(currentTime)
    .setIssuer(objectId)
    .setAudience(clientId)
    .setJti(hexlify(randomBytes(JWT_OPTIONS.jti.length)))
    .setSubject(account)
    .sign(key)

  const refreshToken = await new SignJWT({})
    .setProtectedHeader({ alg })
    .setExpirationTime(refreshTimeMs)
    .setIssuedAt(currentTime)
    .setAudience(clientId)
    .setIssuer(objectId)
    .setSubject(account)
    .sign(key)

  const result = {
    accessToken,
    refreshToken,
  }

  //Conditionally add the ID token to the result, if it's set
  if (idTokenProfile) {
    const idToken = await new SignJWT(idTokenProfile)
      .setProtectedHeader({ alg })
      .setExpirationTime(expirationTime)
      .setAudience(clientId)
      .setIssuedAt(currentTime)
      .setIssuer(objectId)
      .sign(key)
    Object.assign(result, { idToken })
  }

  // Schedule an alarm that executes after this session expires in order
  // to delete the session state and perform other cleanup. Note that
  // refreshing the JWT that represents the session will result in the
  // alarm being rescheduled for after the new expiry time.
  const ms = (ttl + 1) * 1000
  // Accepts Date or ms since epoch.
  storage.setAlarm(ms)

  return result
}

const verify = async (token: string, storage: DurableObjectStorage) => {
  const { alg } = JWT_OPTIONS
  const { publicKey: key } = await getJWTSigningKeyPair(storage)
  const options = { algorithms: [alg] }

  // TODO: check the token expirytime

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
