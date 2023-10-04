import { BadRequestError } from '@proofzero/errors'
import { initIdentityGroupNodeByName } from '@proofzero/platform/identity/src/nodes'
import { IdentityURN } from '@proofzero/urns/identity'
import { IdentityGroupURN } from '@proofzero/urns/identity-group'
import { getErrorCause } from '@proofzero/utils/errors'

export default async (
  ctx: unknown & {
    identityURN?: IdentityURN
    IdentityGroup?: DurableObjectNamespace
  },
  identityGroupURN: IdentityGroupURN
) => {
  if (!ctx.identityURN) {
    throw new BadRequestError({
      message: 'No identity URN in context',
    })
  }

  if (!ctx.IdentityGroup) {
    throw new BadRequestError({
      message: 'No IdentityGroup in context',
    })
  }

  const DO = initIdentityGroupNodeByName(identityGroupURN, ctx.IdentityGroup)
  const { error } = await DO.class.validateAdmin(ctx.identityURN)
  if (error) {
    throw getErrorCause(error)
  }
}
