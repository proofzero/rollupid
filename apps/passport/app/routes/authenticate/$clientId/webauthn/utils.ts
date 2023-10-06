import { BadRequestError, InternalServerError } from '@proofzero/errors'
import { KeyPairSerialized } from '@proofzero/packages/types/application'
import { SignJWT, importJWK, jwtVerify, errors, decodeJwt } from 'jose'

export const createSignedWebauthnChallenge = async (
  keyPairJSON: KeyPairSerialized,
  userId?: string
) => {
  const privateKey = await importJWK(keyPairJSON.privateKey)
  const challengeRandomBuffer = new Uint8Array(48)
  crypto.getRandomValues(challengeRandomBuffer)
  const payload = { challenge: challengeRandomBuffer }
  const signableJwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'ES256' })
    .setExpirationTime('5 min')

  if (userId) signableJwt.setSubject(userId)

  const challengeJwt = signableJwt.sign(privateKey)
  return challengeJwt
}

export const verifySignedWebauthnChallenge = async (
  challengeJwt: string,
  keyPairJSON: KeyPairSerialized
): Promise<string | undefined> => {
  const publicKey = await importJWK(keyPairJSON.publicKey)
  try {
    await jwtVerify(challengeJwt, publicKey)
    const jwt = decodeJwt(challengeJwt)
    return jwt.sub
  } catch (e) {
    if (e instanceof errors.JWTExpired)
      throw new BadRequestError({
        message:
          'Passkey request authentication has expired. Please try again.',
      })
    else
      throw new InternalServerError({
        message: 'Could not authenticate your request. Please try again.',
      })
  }
}

export const webauthnConstants = {
  challengeSize: 250,
  timeout: 60,
  cryptoAlgsArray: [-7, -8, -257],
  credentialIdLength: 42,
}
