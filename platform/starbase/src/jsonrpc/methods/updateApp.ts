import { z } from 'zod'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import { AppObjectSchema } from '../validators/app'
import { ApplicationURNSpace } from '@proofzero/urns/application'

export const UpdateAppInput = z.object({
  clientId: z.string(),
  updates: AppObjectSchema.partial(),
})

export const updateApp = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof UpdateAppInput>
  ctx: Context
}): Promise<void> => {
  const appURN = ApplicationURNSpace.componentizedUrn(
    input.clientId,
    undefined,
    { name: input.updates.name, iconURL: input.updates.icon }
  )
  if (
    !ctx.ownAppURNs ||
    !ctx.ownAppURNs.includes(ApplicationURNSpace.getBaseURN(appURN))
  )
    throw new Error(
      `Request received for clientId ${input.clientId} which is not owned by provided account.`
    )

  const appDO = await getApplicationNodeByClientId(
    input.clientId,
    ctx.StarbaseApp
  )
  appDO.class.update(input.updates)

  //TODO: Make this asynchronous so user doesn't have to wait for the second IO hop
  await ctx.edges.updateNode.mutate({ urnOfNode: appURN })
}
