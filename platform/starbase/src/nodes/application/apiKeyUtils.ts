import { RpcInput, RpcOutput, RpcParams } from '@kubelt/openrpc/component'
import {
  exportJWK,
  generateKeyPair,
  importJWK,
  JWK,
  jwtVerify,
  KeyLike,
  SignJWT,
} from 'jose'
import { hexlify } from '@ethersproject/bytes'
import { randomBytes } from '@ethersproject/random'
import { STARBASE_API_KEY_ISSUER } from '../../constants'

const JWT_OPTIONS = {
  alg: 'ES256',
  jti: {
    length: 24,
  },
}

interface KeyPair {
  publicKey: KeyLike | Uint8Array
  privateKey: KeyLike | Uint8Array
}

interface KeyPairSerialized {
  publicKey: JWK
  privateKey: JWK
}

export async function generateAndStore(
  params: RpcParams,
  input: RpcInput,
  output: RpcOutput
): Promise<string> {
  const appURN = params.get('urn')

  const { privateKey: key } = await getJWTSigningKeyPair(input, output)

  const apiKey = await new SignJWT({})
    .setProtectedHeader(JWT_OPTIONS)
    .setIssuedAt()
    .setIssuer(STARBASE_API_KEY_ISSUER)
    .setJti(hexlify(randomBytes(JWT_OPTIONS.jti.length)))
    .setSubject(appURN)
    .sign(key)

  return apiKey
}

export async function verify(
  params: RpcParams,
  input: RpcInput,
  output: RpcOutput
): Promise<boolean> {
  const { alg } = JWT_OPTIONS
  const { publicKey: key } = await getJWTSigningKeyPair(input, output)
  const options = { algorithms: [alg] }
  const token = params.get('apiKey')
  try {
    await jwtVerify(token, key, options)
    return true
  } catch (e) {
    console.error('Error verifying API key validity.', e)
    return false
  }
}

export async function getJWTSigningKeyPair(
  input: RpcInput,
  output: RpcOutput
): Promise<KeyPair> {
  const { alg } = JWT_OPTIONS
  const stored: KeyPairSerialized = input.get('apiKeySigningKeyPair')
  if (stored) {
    return {
      publicKey: await importJWK(stored.publicKey, alg),
      privateKey: await importJWK(stored.privateKey, alg),
    }
  }

  const generated: KeyPair = await generateKeyPair(alg, {
    extractable: true,
  })

  output.set('apiKeySigningKeyPair', {
    publicKey: await exportJWK(generated.publicKey),
    privateKey: await exportJWK(generated.privateKey),
  })

  return generated
}
