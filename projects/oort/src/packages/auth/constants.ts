export const JWT_ALG = process.env.AUTH_JWT_ALG
export const JWT_TTL = Number(process.env.AUTH_JWT_TTL)

export const JWT_OPTIONS = {
  alg: JWT_ALG,
  ttl: JWT_TTL,
}

export const NONCE_LENGTH = Number(process.env.AUTH_NONCE_LENGTH)
export const NONCE_TTL = Number(process.env.AUTH_NONCE_TTL)

export const NONCE_OPTIONS = {
  length: NONCE_LENGTH,
  ttl: NONCE_TTL,
}
