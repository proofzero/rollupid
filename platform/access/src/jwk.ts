import type { JSONWebKeySet, JWK } from 'jose'

import { Context } from './context'

type Pair = {
  privateKey: JWK
  publicKey: JWK
}

type JWKS = Array<Pair>

export const getPrivateJWK = (context: Context): JWK => {
  try {
    const pairs: JWKS = JSON.parse(context.SECRET_JWKS)
    const currentKid: string = context.SECRET_JWK_CURRENT_KID
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

export const getJWKS = (context: Context): JSONWebKeySet => {
  try {
    const pairs: JWKS = JSON.parse(context.SECRET_JWKS)

    const jwks = {
      keys: pairs.map((p) => p.publicKey),
    }

    return jwks
  } catch (error) {
    console.error(error)
    throw error
  }
}
