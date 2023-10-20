import { z } from 'zod'
import { Context } from '../../context'
import { initIdentityGroupNodeByName } from '../../../../identity/src/nodes'
import { IdentityGroupURNValidator } from '@proofzero/platform-middleware/inputValidators'

export const SetPaymentFailedInput = z.object({
  URN: IdentityGroupURNValidator,
  failed: z.boolean().default(true),
})

export type SetPaymentFailedParams = z.infer<typeof SetPaymentFailedInput>

export const setPaymentFailed = async ({
  input,
  ctx,
}: {
  input: SetPaymentFailedParams
  ctx: Context
}) => {
  const ownerNode = initIdentityGroupNodeByName(
    input.URN,
    ctx.env.IdentityGroup
  )
  await ownerNode.class.setPaymentFailed(input.failed)
}
