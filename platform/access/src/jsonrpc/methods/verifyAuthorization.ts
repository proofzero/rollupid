import { z } from 'zod'
import { Context } from '../../context'
import { initAccessNodeByName } from '../../nodes'
import { tokenValidator } from '../middleware/validators'

export const VerifyAuthorizationMethodInput = z.object({
  token: tokenValidator,
})

export const VerifyAuthorizationMethodOutput = z.object({
  iss: z.string().optional(),
  sub: z.string().optional(),
  aud: z.string().optional().or(z.array(z.string())).optional(),
  exp: z.number().optional(),
  iat: z.number().optional(),
  jti: z.string().optional(),
  nbf: z.number().optional(),
})

export type VerifyAuthorizationParams = z.infer<
  typeof VerifyAuthorizationMethodInput
>

export const verifyAuthorizationMethod = async ({
  input,
  ctx,
}: {
  input: VerifyAuthorizationParams
  ctx: Context
}) => {
  const {
    token: { token, iss },
  } = input

  const accessNode = await initAccessNodeByName(iss, ctx.Access)
  const result = await accessNode.verify(token) // throws exceptin if invalid from jose
  return result.payload
}
