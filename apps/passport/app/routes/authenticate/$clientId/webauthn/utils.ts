import { JWK, SignJWT, importJWK, jwtVerify } from 'jose'

//TODO: refactor the same type from Starbase
export type KeyPairSerialized = {
  publicKey: JWK
  privateKey: JWK
}

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
  //TODO: Add custom error wrapping to this
  const verificationResults = await jwtVerify(challengeJwt, publicKey)
}
