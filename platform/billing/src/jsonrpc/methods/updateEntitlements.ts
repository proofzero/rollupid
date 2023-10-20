import { z } from 'zod'
import { Context } from '../../context'
import { IdentityRefURNValidator } from '@proofzero/platform-middleware/inputValidators'
import { ServicePlanType } from '@proofzero/types/billing'
import { IdentityGroupURNSpace } from '@proofzero/urns/identity-group'
import { BadRequestError } from '@proofzero/errors'
import { IdentityURNSpace } from '@proofzero/urns/identity'
import {
  initIdentityGroupNodeByName,
  initIdentityNodeByName,
} from '../../../../identity/src/nodes'

export const UpdateEntitlementsInputSchema = z.object({
  URN: IdentityRefURNValidator,
  subscriptionID: z.string(),
  type: z.nativeEnum(ServicePlanType),
  quantity: z.number(),
})
export type UpdateEntitlementsInput = z.infer<
  typeof UpdateEntitlementsInputSchema
>

export const updateEntitlements = async ({
  input,
  ctx,
}: {
  input: UpdateEntitlementsInput
  ctx: Context
}): Promise<void> => {
  const { type, quantity, subscriptionID } = input

  let ownerNode
  if (IdentityURNSpace.is(input.URN)) {
    ownerNode = initIdentityNodeByName(input.URN, ctx.env.Identity)
  } else if (IdentityGroupURNSpace.is(input.URN)) {
    ownerNode = initIdentityGroupNodeByName(input.URN, ctx.env.IdentityGroup)
  } else {
    throw new BadRequestError({
      message: `URN type not supported`,
    })
  }

  await ownerNode.class.updateEntitlements(type, quantity, subscriptionID)
}
