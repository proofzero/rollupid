import { BadRequestError } from '@proofzero/errors'
import { KeyPairSerialized } from '@proofzero/packages/types/application'
import { JWK, SignJWT, importJWK, jwtVerify, errors } from 'jose'

export const createSignedWebauthnChallenge = async (
  keyPairJSON: KeyPairSerialized
) => {
  const privateKey = await importJWK(keyPairJSON.privateKey)
  const challengeRandomBuffer = new Uint8Array(48)
  crypto.getRandomValues(challengeRandomBuffer)
  const payload = { challenge: challengeRandomBuffer }
  const challengeJwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'ES256' })
    .setExpirationTime('5 min')
    .sign(privateKey)
  return challengeJwt
}

export const verifySignedWebauthnChallenge = async (
  challengeJwt: string,
  keyPairJSON: KeyPairSerialized
) => {
  const publicKey = await importJWK(keyPairJSON.publicKey)
  try {
    await jwtVerify(challengeJwt, publicKey)
  } catch (e) {
    if (e instanceof errors.JWTExpired)
      throw new BadRequestError({
        message:
          'Passkey request authentication has expired. Please try again.',
      })
  }
}
