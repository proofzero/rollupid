import { hexlify } from '@ethersproject/bytes'
import { randomBytes } from '@ethersproject/random'
import { ApplicationURN } from '@kubelt/urns/application'
import { DOProxy } from 'do-proxy'
import { exportJWK, generateKeyPair, importJWK, JWK, jwtVerify, KeyLike, SignJWT } from 'jose'
import { STARBASE_API_KEY_ISSUER } from '../../constants'
import type { AppReadableFields, AppUpdateableFields } from '../../types'


type AppDetails = AppUpdateableFields & AppReadableFields


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

export default class ApplicationNode extends DOProxy {
  declare state: DurableObjectState

  constructor(state: DurableObjectState) {
    super(state)
    this.state = state
  }

  async init(clientId: string, clientName: string): Promise<void> {

    //These key-vals get stored as key-vals in the DO itself
    const entriesToStore = {
      clientId,
      clientName,
      app: {
        timestamp: Date.now(),
        name: clientName
      }
    }
    this.state.storage.put(entriesToStore)

  }

  async delete(): Promise<void> {
    //As per docs, this doesn't guarnatee deletion in cases of failure.
    //Only a subset of data may be deleted
    this.state.storage.deleteAll()
  }

  async getDetails(): Promise<AppDetails> {

    const keysWeWant: Array<keyof AppDetails> = [
      'app',
      'clientId', 
      'clientName', 
      'published', 
      'secretTimestamp', 
      'apiKeyTimestamp' 
    ]
    const appObj = await this.state.storage.get(keysWeWant);
    const result = Object.fromEntries(appObj) as AppDetails
    return result
  }

  async rotateClientSecret(clientSecret: string): Promise<void> {
    this.state.storage.put({clientSecret})
  }

  async rotateApiKey(appUrn: ApplicationURN): Promise<string> {
    const apiKey = this.generateAndStore(appUrn)
    this.state.storage.put("apiKey", apiKey)
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
    const stored = await this.state.storage.get('apiKeySigningKeyPair') as KeyPairSerialized
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

}

export const getApplicationNodeByClientId = async (
  clientId: string, 
  durableObject: DurableObjectNamespace
) => {
  const proxy = ApplicationNode.wrap(durableObject)
  const appDO = proxy.getByName(clientId)
  return appDO
}