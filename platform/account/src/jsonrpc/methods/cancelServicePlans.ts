import { z } from 'zod'
import { Context } from '../../context'
import { inputValidators } from '@proofzero/platform-middleware'
import { initAccountNodeByName } from '../../nodes'

export const CancelServicePlansInput = z.object({
  account: inputValidators.AccountURNInput,
})

export type CancelServicePlansParams = z.infer<typeof CancelServicePlansInput>

export const cancelServicePlans = async ({
  input,
  ctx,
}: {
  input: CancelServicePlansParams
  ctx: Context
}) => {
  const servicePlansNode = await initAccountNodeByName(
    input.account,
    ctx.Account
  )

  await servicePlansNode.storage.delete('servicePlans')
}
