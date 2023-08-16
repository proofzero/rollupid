import { z } from 'zod'
import { Context } from '../../context'
import { AnyURNInput } from '@proofzero/platform-middleware/inputValidators'
import { BadRequestError } from '@proofzero/errors'
import { IdentityGroupURNSpace } from '@proofzero/urns/identity-group'
import { IdentityURNSpace } from '@proofzero/urns/identity'
import {
  initIdentityGroupNodeByName,
  initIdentityNodeByName,
} from '../../../../identity/src/nodes'
export const CancelServicePlansInput = z.object({
  URN: AnyURNInput,
  subscriptionID: z.string(),
  deletePaymentData: z.boolean().optional(),
})

export type CancelServicePlansParams = z.infer<typeof CancelServicePlansInput>

export const cancelServicePlans = async ({
  input,
  ctx,
}: {
  input: CancelServicePlansParams
  ctx: Context
}) => {
  let ownerNode
  if (IdentityURNSpace.is(input.URN)) {
    ownerNode = initIdentityNodeByName(input.URN, ctx.Account)
  } else if (IdentityGroupURNSpace.is(input.URN)) {
    ownerNode = initIdentityGroupNodeByName(input.URN, ctx.IdentityGroup)
  } else {
    throw new BadRequestError({
      message: `URN type not supported`,
    })
  }

  await ownerNode.storage.delete('servicePlans')
  if (input.deletePaymentData) {
    await ownerNode.storage.delete('stripePaymentData')
  }
}
