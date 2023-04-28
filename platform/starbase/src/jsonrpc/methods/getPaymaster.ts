import { z } from 'zod'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import { PaymasterSchema } from '../validators/app'
import { ApplicationURNSpace } from '@proofzero/urns/application'

export const GetPaymasterInput = z.object({
  clientId: z.string(),
})

export const GetPaymasterOutput = PaymasterSchema.optional()

export const getPaymaster = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof GetPaymasterInput>
  ctx: Context
}): Promise<z.infer<typeof GetPaymasterOutput>> => {
  const appURN = ApplicationURNSpace.componentizedUrn(input.clientId)
  if (!ctx.ownAppURNs || !ctx.ownAppURNs.includes(appURN))
    throw new Error(
      `Request received for clientId ${input.clientId} which is not owned by provided account.`
    )

  const appDO = await getApplicationNodeByClientId(
    input.clientId,
    ctx.StarbaseApp
  )
  const paymaster = appDO.class.getPaymaster()
  return paymaster
}
