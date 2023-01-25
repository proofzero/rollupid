import { hexlify } from '@ethersproject/bytes'
import { randomBytes } from '@ethersproject/random'
import { ApplicationURN } from '@kubelt/urns/application'
import { DOProxy } from 'do-proxy'
import {
  exportJWK,
  generateKeyPair,
  importJWK,
  JWK,
  jwtVerify,
  KeyLike,
  SignJWT,
} from 'jose'
import { STARBASE_API_KEY_ISSUER } from '../constants'
import type {
  AppAllFields,
  AppObject,
  AppReadableFields,
  AppUpdateableFields,
} from '../types'

type AppDetails = AppUpdateableFields & AppReadableFields
type AppProfile = AppUpdateableFields

interface KeyPair {
  publicKey: KeyLike | Uint8Array
  privateKey: KeyLike | Uint8Array
}

interface KeyPairSerialized {
  publicKey: JWK
  privateKey: JWK
}

const JWT_OPTIONS = {
  alg: 'ES256',
  jti: {
    length: 24,
  },
}

export default class StarbaseApp extends DOProxy {
  declare state: DurableObjectState

  constructor(state: DurableObjectState) {
    super(state)
    this.state = state
  }

  async init(clientId: string, clientName: string): Promise<void> {
    //These key-vals get stored as key-vals in the DO itself
    const entriesToStore: Partial<AppAllFields> = {
      clientId,
      clientName,
      app: {
        name: clientName,
        scopes: [],
      },
      createdTimestamp: Date.now(),
    }
    this.state.storage.put(entriesToStore)
  }

  async delete(): Promise<void> {
    //As per docs, this doesn't guarnatee deletion in cases of failure.
    //Only a subset of data may be deleted
    this.state.storage.deleteAll()
  }

  async update(updates: Partial<AppObject>): Promise<void> {
    //Merge values in app object
    const storedValues = this.state.storage.get('app')
    const mergedEntries = new Map(Object.entries(storedValues))
    Object.entries(updates).forEach(([k, v]) => {
      mergedEntries.set(k, v)
    })
    const mergedObject = Object.fromEntries(mergedEntries.entries())

    await this.state.storage.put('app', mergedObject)
  }

  async getDetails(): Promise<AppDetails> {
    const keysWeWant: Array<keyof AppDetails> = [
      'app',
      'clientId',
      'clientName',
      'published',
      'secretTimestamp',
      'apiKeyTimestamp',
      'createdTimestamp',
    ]
    const appObj = await this.state.storage.get(keysWeWant)
    const result = Object.fromEntries(appObj) as AppDetails
    return result
  }

  async getProfile(): Promise<AppProfile> {
    const keysWeWant: Array<keyof AppProfile> = [
      'app',
      'clientName',
      'published',
    ]
    const appObj = await this.state.storage.get(keysWeWant)
    const result = Object.fromEntries(appObj) as AppProfile
    return result
  }

  async publish(published: boolean): Promise<void> {
    this.state.storage.put('published', published)
  }

  async rotateClientSecret(clientSecret: string): Promise<void> {
    this.state.storage.put({ clientSecret })
    this.state.storage.put('secretTimestamp', Date.now())
  }

  async validateClientSecret(hashedClientSecret: string): Promise<boolean> {
    const storedSecret = await this.state.storage.get('clientSecret')
    return storedSecret === hashedClientSecret
  }

  async rotateApiKey(appUrn: ApplicationURN): Promise<string> {
    const apiKey = await this.generateAndStore(appUrn)
    this.state.storage.put('apiKey', apiKey)
    this.state.storage.put('apiKeyTimestamp', Date.now())
    return apiKey
  }

  async generateAndStore(appURN: ApplicationURN): Promise<string> {
    const { privateKey: key } = await this.getJWTSigningKeyPair()

    const apiKey = await new SignJWT({})
      .setProtectedHeader(JWT_OPTIONS)
      .setIssuedAt()
      .setIssuer(STARBASE_API_KEY_ISSUER)
      .setJti(hexlify(randomBytes(JWT_OPTIONS.jti.length)))
      .setSubject(appURN)
      .sign(key)

    return apiKey
  }

  async verify(apiKey: string): Promise<boolean> {
    const { alg } = JWT_OPTIONS
    const { publicKey: key } = await this.getJWTSigningKeyPair()
    const options = { algorithms: [alg] }
    try {
      await jwtVerify(apiKey, key, options)
      return true
    } catch (e) {
      console.error('Error verifying API key validity.', e)
      return false
    }
  }

  async getJWTSigningKeyPair(): Promise<KeyPair> {
    const { alg } = JWT_OPTIONS
    const stored = (await this.state.storage.get(
      'apiKeySigningKeyPair'
    )) as KeyPairSerialized
    if (stored) {
      return {
        publicKey: await importJWK(stored.publicKey, alg),
        privateKey: await importJWK(stored.privateKey, alg),
      }
    }

    const generated: KeyPair = await generateKeyPair(alg, {
      extractable: true,
    })

    this.state.storage.put('apiKeySigningKeyPair', {
      publicKey: await exportJWK(generated.publicKey),
      privateKey: await exportJWK(generated.privateKey),
    })

    return generated
  }

  async checkApiKey(apiKey: string): Promise<boolean> {
    const validJWTForClient = await this.verify(apiKey)
    const storedKey = await this.state.storage.get('apiKey')
    return validJWTForClient && apiKey === storedKey
  }

  async hasClientSecret(): Promise<boolean> {
    const storedSecret = await this.state.storage.get<string>('clientSecret')
    return (storedSecret && storedSecret.length > 0) || false
  }
}

export const getApplicationNodeByClientId = async (
  clientId: string,
  durableObject: DurableObjectNamespace
) => {
  const proxy = StarbaseApp.wrap(durableObject)
  const appDO = proxy.getByName(clientId)
  return appDO
}
