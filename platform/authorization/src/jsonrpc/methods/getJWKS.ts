import { z } from 'zod'

import { Context } from '../../context'
import { getJWKS } from '../../jwk'

export const GetJWKSMethodOutput = z.object({
  keys: z.array(
    z
      .object({
        alg: z.string(),
        kid: z.string(),
        kty: z.string(),
        x: z.string(),
        y: z.string(),
        crv: z.string(),
      })
      .partial()
  ),
})

type GetJWKSMethodOutput = z.infer<typeof GetJWKSMethodOutput>

type GetJWKSParams = {
  ctx: Context
}

interface GetJWKSMethod {
  (params: GetJWKSParams): GetJWKSMethodOutput
}

export const getJWKSMethod: GetJWKSMethod = ({ ctx }) => {
  return getJWKS(ctx)
}
