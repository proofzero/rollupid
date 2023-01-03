import { z } from 'zod'
import { Context } from '../../context'
import { initAccessNodeByName } from '../../nodes'
import { tokenValidator } from '../middleware/validators'

export const VerifyAuthorizationMethodInput = z.object({
  token: tokenValidator,
})

export const VerifyAuthorizationMethodOutput = z.boolean()

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

  const accessNode = initAccessNodeByName(iss, ctx.Access)
  const result = await accessNode.verify({ token })
  return result
}
