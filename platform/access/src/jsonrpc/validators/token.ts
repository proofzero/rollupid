import { decodeJwt } from 'jose'
import { z } from 'zod'

import { AccessURNSpace } from '@kubelt/urns/access'

import type { AccessURN } from '@kubelt/urns/access'

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

export const AccessURNInput = z.custom<AccessURN>((input) => {
  if (typeof input !== 'string') {
    throw new Error(`input is not a string`)
  }
  if (!AccessURNSpace.is(input.trim())) {
    throw new Error(`invalid AccessURN entry: ${input}`)
  }
  return input as AccessURN
})
