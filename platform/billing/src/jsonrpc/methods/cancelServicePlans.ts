import { z } from 'zod'
import { Context } from '../../context'
import { BadRequestError } from '@proofzero/errors'
import { IdentityGroupURNSpace } from '@proofzero/urns/identity-group'
import { IdentityURNSpace } from '@proofzero/urns/identity'
import {
  initIdentityGroupNodeByName,
  initIdentityNodeByName,
} from '../../../../identity/src/nodes'
import { IdentityRefURNValidator } from '@proofzero/platform-middleware/inputValidators'

export const CancelServicePlansInput = z.object({
  URN: IdentityRefURNValidator,
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
    ownerNode = initIdentityNodeByName(input.URN, ctx.env.Identity)
    const forwardIdentityURN = await ownerNode.class.getForwardIdentityURN()
    if (forwardIdentityURN)
      ownerNode = initIdentityNodeByName(forwardIdentityURN, ctx.env.Identity)
  } else if (IdentityGroupURNSpace.is(input.URN)) {
    ownerNode = initIdentityGroupNodeByName(input.URN, ctx.env.IdentityGroup)
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
