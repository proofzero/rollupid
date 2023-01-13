import { z } from 'zod'
import { inputValidators } from '@kubelt/platform-middleware'
import { Context } from '../../context'
import { initAccountNodeByName } from '../../nodes'
import { Profile } from '../../types'

export const GetProfileInput = z.object({
  account: inputValidators.AccountURNInput,
})

export type GetProfileParams = z.infer<typeof GetProfileInput>

export const getProfileMethod = async ({
  input,
  ctx,
}: {
  input: GetProfileParams
  ctx: Context
}): Promise<Profile | null> => {
  const node = await initAccountNodeByName(input.account, ctx.Account)
  console.debug("account before get profile")
  const result = await node.class.getProfile()
  console.debug("account after get profile", result)
  return result
}
