import { z } from 'zod'
import { inputValidators } from '@kubelt/platform-middleware'
import { Context } from '../../context'
import type { Profile } from '../middlewares/profile'
import { initAccountNodeByName } from '../../nodes'

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
  const result = await node.class.getProfile()
  
  const blobs = ['getProfile']
  const doubles = [1]
  const indexes = ['index'.slice(-32)] // Must cap index at 32 bytes.

  ctx.AccountAnalytics.writeDataPoint({ blobs, doubles, indexes })

  return result
}
