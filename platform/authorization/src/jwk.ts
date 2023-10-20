import type { JSONWebKeySet, JWK } from 'jose'

import type { Environment } from '@proofzero/platform.core'

type Pair = {
  privateKey: JWK
  publicKey: JWK
}

type JWKS = Array<Pair>

export const getPrivateJWK = (env: Environment): JWK => {
  try {
    const pairs: JWKS = JSON.parse(env.SECRET_JWKS)
    const currentKid: string = env.SECRET_JWK_CURRENT_KID
    for (const pair of pairs) {
      if (pair.privateKey.kid === currentKid) {
        return pair.privateKey
      }
    }
    throw new Error('current JWK not found')
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const getJWKS = (env: Environment): JSONWebKeySet => {
  try {
    const pairs: JWKS = JSON.parse(env.SECRET_JWKS)

    const jwks = {
      keys: pairs.map((p) => p.publicKey),
    }

    return jwks
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const generateJKU = (issuer: string) => {
  return `${issuer}/.well-known/jwks.json`
}
