import { z } from 'zod'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import { PaymasterSchema } from '../validators/app'
import { ApplicationURNSpace } from '@proofzero/urns/application'
import { groupAdminValidatorByAppURN } from '@proofzero/security/identity-group-validators'

export const SetPaymasterInput = z.object({
  clientId: z.string(),
  paymaster: PaymasterSchema,
})

export const setPaymaster = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof SetPaymasterInput>
  ctx: Context
}): Promise<void> => {
  const appURN = ApplicationURNSpace.componentizedUrn(input.clientId)
  if (!ctx.allAppURNs || !ctx.allAppURNs.includes(appURN))
    throw new Error(
      `Request received for clientId ${input.clientId} which is not owned by provided account.`
    )

  await groupAdminValidatorByAppURN(ctx, appURN)

  const appDO = await getApplicationNodeByClientId(
    input.clientId,
    ctx.env.StarbaseApp
  )
  await appDO.class.setPaymaster(input.paymaster)
}
