import { z } from 'zod'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import { AppObjectSchema, AppUpdateableFieldsSchema } from '../../types'

export const UpdateAppInputSchema = z.object({
  clientId: z.string(),
  updates: AppObjectSchema.partial(),
})

export const updateApp = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof UpdateAppInputSchema>
  ctx: Context
}): Promise<void> => {
  const appDO = await getApplicationNodeByClientId(input.clientId, ctx.Starbase)
  appDO.class.update(input.updates)
}
