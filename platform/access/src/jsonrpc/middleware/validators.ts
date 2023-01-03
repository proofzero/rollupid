import { decodeJwt } from 'jose'
import { z } from 'zod'

export const tokenValidator = z.custom<{ iss: string; token: string }>(
  (token) => {
    const payload = decodeJwt(token as string)
    if (!payload) {
      throw 'missing JWT payload'
    }

    if (!payload.iss) {
      throw 'missing JWT issuer'
    }
    return {
      token,
      iss: payload.iss,
    }
  }
)
